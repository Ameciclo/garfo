import path from "node:path";
import glob from "fast-glob";
import { ilike, sql } from "drizzle-orm";
import crypto from "node:crypto";
import { db } from "../../utils";
import { OptimizedSeeder } from "../../optimized-seed";
import { pcr_street_names } from "../global/table_pcr_street_names";
import { cities } from "../global/table_cities";
import { cttu_crashes } from "./table_cttu_crashes";
import { datasus_deaths } from "./table_datasus_deaths";
import { samu_calls } from "./table_samu_calls";

// Cache para evitar consultas repetidas
const streetCache = new Map<string, number | null>();
const cityCache = new Map<number, number | undefined>();

async function guessStreetIdCached(
  rawStreet: string | undefined
): Promise<number | null> {
  if (!rawStreet) return null;

  if (streetCache.has(rawStreet)) {
    return streetCache.get(rawStreet)!;
  }

  const match = await db
    .select({ id: pcr_street_names.id })
    .from(pcr_street_names)
    .where(ilike(pcr_street_names.nome_logradouro_concatenado, rawStreet))
    .limit(1);

  const result = match[0]?.id ?? null;
  streetCache.set(rawStreet, result);
  return result;
}

async function guessCityId6Cached(
  raw: string | undefined
): Promise<number | undefined> {
  if (!raw) return undefined;
  const code6 = Number(raw);
  if (isNaN(code6)) return undefined;

  if (cityCache.has(code6)) {
    return cityCache.get(code6);
  }

  const match = await db
    .select({ id: cities.id })
    .from(cities)
    .where(sql`((${cities.id} / 10)::integer) = ${code6}`)
    .limit(1);

  const result = match[0]?.id;
  cityCache.set(code6, result);
  return result;
}

function parseDate(d: string): string | undefined {
  if (!d || d.length !== 8) return undefined;
  return `${d.slice(4, 8)}-${d.slice(2, 4)}-${d.slice(0, 2)}`;
}

export async function seedCrashesOptimized() {
  const seeder = new OptimizedSeeder();

  try {
    const files = await glob(
      "./db/modules/casualties/sinistros-cttu-2016-2024.csv"
    );

    for (const file of files) {
      const fileName = path.basename(file, ".csv");

      await seeder.seedWithBatching(
        "casualties",
        `crashes_${fileName}`,
        file,
        async (batch: any[]) => {
          await db.insert(cttu_crashes).values(batch).onConflictDoNothing();
        },
        async (r: Record<string, string>) => {
          const streetId = await guessStreetIdCached(r.endereco);

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
            .map((v) => v ?? "")
            .join("|");

          const row_hash = crypto
            .createHash("md5")
            .update(hashInput)
            .digest("hex");

          return {
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
          };
        }
      );
    }

    console.log("🎉 Crashes seed otimizado concluído");
  } finally {
    await seeder.cleanup();
  }
}

export async function seedDatasusDeathsOptimized() {
  const seeder = new OptimizedSeeder();

  try {
    const files = await glob(
      "./db/modules/casualties/mortes_transito_*.csv"
    );

    for (const file of files) {
      const fileName = path.basename(file, ".csv");

      await seeder.seedWithBatching(
        "casualties",
        `deaths_${fileName}`,
        file,
        async (batch: any[]) => {
          await db.insert(datasus_deaths).values(batch).onConflictDoNothing();
        },
        async (r: Record<string, string>) => {
          const codmunnatu = await guessCityId6Cached(r.CODMUNNATU);
          const codmunocor = await guessCityId6Cached(r.CODMUNOCOR);
          const codmunres = await guessCityId6Cached(r.CODMUNRES);

          return {
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
          };
        }
      );
    }

    console.log("🎉 Datasus Deaths seed otimizado concluído");
  } finally {
    await seeder.cleanup();
  }
}

function parseDateTime(
  data: string,
  hora_minuto: string
): { data: string; hora: string } {
  const dateOnly = data.split("T")[0];
  const [hours, minutes] = hora_minuto.split(":");
  const paddedHours = hours.padStart(2, "0");
  const paddedMinutes = minutes.padStart(2, "0");
  return {
    data: dateOnly,
    hora: `${paddedHours}:${paddedMinutes}:00`,
  };
}

export async function seedSamuCallsOptimized() {
  const seeder = new OptimizedSeeder();

  try {
    const files = await glob(
      "./db/modules/casualties/sinistros-samu-2016-2025-ruas-corrigidas.csv"
    );

    for (const file of files) {
      const fileName = path.basename(file, ".csv");

      await seeder.seedWithBatching(
        "casualties",
        `samu_${fileName}`,
        file,
      async (batch: any[]) => {
        await db.insert(samu_calls).values(batch).onConflictDoNothing();
      },
      async (r: Record<string, string>) => {
        const streetId = await guessStreetIdCached(r.endereco_pcr);
        const { data: dateFormatted, hora: timeFormatted } = parseDateTime(
          r.data,
          r.hora_minuto
        );

        const hashInput = [
          r._id,
          r.data,
          r.hora_minuto,
          r.municipio,
          r.bairro,
          r.endereco,
          r.subtipo,
          r.sexo,
          r.idade,
          r.endereco_pcr,
        ]
          .map((v) => v ?? "")
          .join("|");

        const row_hash = crypto
          .createHash("md5")
          .update(hashInput)
          .digest("hex");

        return {
          original_id: Number(r._id) || undefined,
          data: dateFormatted,
          hora_minuto: timeFormatted,
          municipio: r.municipio || undefined,
          bairro: r.bairro || undefined,
          endereco: r.endereco || undefined,
          endereco_pcr: r.endereco_pcr || undefined,
          origem_chamado: r.origem_chamado || undefined,
          orig_tipo: r.orig_tipo || undefined,
          subtipo: r.subtipo || undefined,
          tipo: r.tipo || undefined,
          categoria: r.categoria || undefined,
          sexo: r.sexo || undefined,
          idade: Number(r.idade) || undefined,
          motivo_finalizacao: r.motivo_finalizacao || undefined,
          motivo_desfecho: r.motivo_desfecho || undefined,
          motivo_fin_norm: r.motivo_fin_norm || undefined,
          motivo_desf_norm: r.motivo_desf_norm || undefined,
          motivo_fin_cat: r.motivo_fin_cat || undefined,
          motivo_desf_cat: r.motivo_desf_cat || undefined,
          street_id: streetId || undefined,
          row_hash: row_hash,
        };
      }
    );
    }

    console.log("🎉 SAMU calls seed otimizado concluído");
  } finally {
    await seeder.cleanup();
  }
}
