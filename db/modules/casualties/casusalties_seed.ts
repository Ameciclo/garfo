// db/seed/traffic_crashes/seed.ts
import path from "node:path";
import glob from "fast-glob";
import { ilike, sql } from "drizzle-orm";
import crypto from "node:crypto";
import { db, readCsv } from "../../utils";
import { pcr_street_names } from "../global/table_pcr_street_names";
import { cities } from "../global/table_cities";
import { cttu_crashes } from "./table_cttu_crashes";
import { datasus_deaths } from "./table_datasus_deaths";

// helper igual ao seed de streets
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size)
    chunks.push(arr.slice(i, i + size));
  return chunks;
}

async function guessStreetId(rawStreet: string | undefined) {
  if (!rawStreet) return null;

  const match = await db
    .select({ id: pcr_street_names.id })
    .from(pcr_street_names)
    .where(ilike(pcr_street_names.nome_logradouro_concatenado, rawStreet))
    .limit(1);

  return match[0]?.id ?? null;
}

type RawCSV = Record<string, string>;

export async function seedCrashes() {
  // pega os sinistros da cttu
  const files = await glob("./db/modules/casualties/sinistros-cttu-2016-2024-corrigidas.csv");
  for (const file of files) {
    const csvRows = await readCsv<RawCSV>(file);
    // normalização mínima → adequar conforme necessidade
    const inserts = [];
    console.log(`📊 Processando ${csvRows.length} registros...`);
    
    for (let i = 0; i < csvRows.length; i++) {
      const r = csvRows[i];
      if ((i + 1) % 1000 === 0) {
        console.log(`⏳ Processados ${i + 1}/${csvRows.length} registros...`);
      }
      
      // 1. executa sua lógica de streetId primeiro
      const streetId = await guessStreetId(r.endereco);

        // 2. monta o array de valores a serem incluídos no hash
        const hashInput = [
          r.data,
          r.hora,
          r.natureza_acidente,
          r.situacao,
          r.tipo,
          r.descricao,
          r.bairro,
          r.endereco,
          r.numero,
          r.endereco_cruzamento,
          r.auto,
          r.moto,
          r.ciclom,
          r.ciclista,
          r.pedestre,
          r.onibus,
          r.caminhao,
          r.viatura,
          r.outros,
          r.vitimas,
          r.vitimasfatais,
          streetId?.toString(),
        ]
          .map((v) => v ?? "") // converte null|undefined em ""
          .join("|"); // delimita pra evitar colisão “ab|c” vs “a|bc”

        const row_hash = crypto
          .createHash("md5")
          .update(hashInput)
          .digest("hex");

      inserts.push({
        data: r.data || "undefined",
        hora: r.hora || "undefined",
        natureza: r.natureza_acidente || undefined,
        situacao: r.situacao || undefined,
        tipo: r.tipo || undefined,
        descricao: r.descricao || undefined,
        bairro: r.bairro || undefined,
        endereco: r.endereco || undefined,
        numero: r.numero || undefined,
        cross_st: r.endereco_cruzamento || undefined,
        auto: Number(r.auto) || undefined,
        moto: Number(r.moto) || undefined,
        ciclom: Number(r.ciclom) || undefined,
        ciclista: Number(r.ciclista) || undefined,
        pedestre: Number(r.pedestre) || undefined,
        onibus: Number(r.onibus) || undefined,
        caminhao: Number(r.caminhao) || undefined,
        viatura: Number(r.viatura) || undefined,
        outros: Number(r.outros) || undefined,
        vitimas: Number(r.vitimas) || undefined,
        vitimas_fat: Number(r.vitimasfatais) || undefined,
        street_id: streetId || undefined,
        row_hash: row_hash,
      });
    }

    for (const batch of chunkArray(inserts, 2000)) {
      await db.insert(cttu_crashes).values(batch).onConflictDoNothing();
      console.log(`✅ ${path.basename(file)} → +${batch.length} linhas`);
    }
  }
}

// permite rodar isolado com: `tsx db/seed/traffic_crashes/seed.ts`
if (require.main === module) seedCrashes();

function parseDate(d: string): string | undefined {
  if (!d || d.length !== 8) return undefined;
  // CSV dado como DDMMYYYY
  return `${d.slice(4, 8)}-${d.slice(2, 4)}-${d.slice(0, 2)}`;
}

type RawDeath = Record<string, string>;

// Cache para evitar queries repetidas
const cityCache = new Map<number, number | undefined>();

async function guessCityId6(
  raw: string | undefined
): Promise<number | undefined> {
  if (!raw) return undefined;
  const code6 = Number(raw);
  if (isNaN(code6)) return undefined;
  
  // Verificar cache primeiro
  if (cityCache.has(code6)) {
    return cityCache.get(code6);
  }
  
  const match = await db
    .select({ id: cities.id })
    .from(cities)
    .where(sql`((${cities.id} / 10)::integer) = ${code6}`)
    .limit(1)
    .execute();
  
  const result = match[0]?.id;
  cityCache.set(code6, result);
  return result;
}

export async function seedDatasusDeaths() {
  console.log("⚰️ Iniciando seed do DATASUS (mortes de trânsito)...");
  
  const files = [
    // "mortes_transito_2011.csv",
    // "mortes_transito_2012.csv",
    // "mortes_transito_2013.csv",
    // "mortes_transito_2014.csv",
    "mortes_transito_2015.csv",
    "mortes_transito_2016.csv",
    "mortes_transito_2017.csv",
    "mortes_transito_2018.csv",
    "mortes_transito_2019.csv",
    "mortes_transito_2020.csv",
    "mortes_transito_2021.csv",
    "mortes_transito_2022.csv",
    "mortes_transito_2023.csv",
  ];
  
  for (const fname of files) {
    console.log(`📄 Processando ${fname}...`);
    const full = path.resolve(__dirname, fname);
    const rows = await readCsv<RawDeath>(full);
    console.log(`📊 ${rows.length} registros encontrados`);

    // Processar em chunks menores para evitar timeout
    const chunks = chunkArray(rows, 5000); // chunks menores
    let totalProcessed = 0;
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`⏳ Processando chunk ${i + 1}/${chunks.length} (${chunk.length} registros)...`);
      
      const inserts = [];
      for (let j = 0; j < chunk.length; j++) {
        const r = chunk[j];
        const codmunnatu = await guessCityId6(r.CODMUNNATU);
        const codmunocor = await guessCityId6(r.CODMUNOCOR);
        const codmunres = await guessCityId6(r.CODMUNRES);

        inserts.push({
          contador: Number(r.CONTADOR),
          tipobito: r.TIPOBITO,
          dtobito: parseDate(r.DTOBITO)!,
          horaobito: r.HORAOBITO,
          natural: r.NATURAL,
          codmunnatu,
          dtnasc: parseDate(r.DTNASC),
          idade: Number(r.IDADE) || undefined,
          sexo: r.SEXO,
          racacor: r.RACACOR,
          estciv: r.ESTCIV,
          esc2010: r.ESC2010,
          seriescfal: r.SERIESCFAL,
          ocup: r.OCUP,
          codmunres,
          lococor: r.LOCOCOR,
          codmunocor,
          linhaa: r.LINHAA,
          linhab: r.LINHAB,
          linhac: r.LINHAC,
          linhad: r.LINHAD,
          linhaii: r.LINHAII,
          circobito: r.CIRCOBITU,
          acidtrab: r.ACIDTRAB,
          fonte: r.FONTE,
          origem: r.ORIGEM,
          esc: r.ESC,
          exame: r.EXAME,
          cirurgia: r.CIRURGIA,
          dtinvestig: parseDate(r.DTINVESTIG),
          causabas_o: r.CAUSABAS_O,
          causabas: r.CAUSABAS,
        });
        
        if ((j + 1) % 1000 === 0) {
          console.log(`   ⏳ Processados ${j + 1}/${chunk.length} registros do chunk...`);
        }
      }

      // Inserir em batches ainda menores
      for (const batch of chunkArray(inserts, 500)) {
        await db
          .insert(datasus_deaths)
          .values(batch)
          .onConflictDoNothing()
          .execute();
      }
      
      totalProcessed += chunk.length;
      console.log(`✅ Chunk processado! Total: ${totalProcessed}/${rows.length}`);
    }
    
    console.log(`✅ ${fname} concluído -> ${rows.length} registros`);
  }
  
  console.log(`🎉 Seed DATASUS concluído! Cache de cidades: ${cityCache.size} entradas`);
}

if (require.main === module) seedDatasusDeaths().catch(console.error);
