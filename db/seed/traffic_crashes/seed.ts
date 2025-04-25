// db/seed/traffic_crashes/seed.ts
import path from "node:path";
import glob from "fast-glob";
import { ilike } from "drizzle-orm";

import * as schema from "../../schemas/traffic_crashes";
import { db, readCsv } from "../utils";
import { pref_street_names } from "../../schemas/streets";

// helper igual ao seed de streets
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size)
    chunks.push(arr.slice(i, i + size));
  return chunks;
}

// tentativa muito simples de casar “AV NORTE” com logradouro oficial
async function guessStreetId(rawStreet: string | undefined) {
  if (!rawStreet) return null;
  const firstToken = rawStreet.split(/[ ,]/)[0]; // “AV”, “RUA”, etc.
  const match = await db
    .select({ id: pref_street_names.id })
    .from(pref_street_names)
    .where(
      ilike(pref_street_names.nome_logradouro_concatenado, `${firstToken}%`)
    )
    .limit(1);

  return match[0]?.id ?? null;
}

type RawCSV = Record<string, string>;

export async function seedCrashes() {
  // pega TODOS os csv sinistrosXXXX.csv
  const files = await glob("./db/seed/traffic_crashes/sinistros*.csv");
  for (const file of files) {
    const csvRows = await readCsv<RawCSV>(file);

    // normalização mínima → adequar conforme necessidade
    const inserts = await Promise.all(
      csvRows.map(async (r) => ({
        crash_date: r.data ? r.data.split("T")[0] : "undefined",
        crash_time: r.hora || "undefined",
        natureza: r.natureza_acidente || undefined,
        situacao: r.situacao || undefined,
        tipo: r.tipo || undefined,
        descricao: r.descricao || undefined,
        bairro: r.bairro || undefined,
        street_name: r.endereco || undefined,
        street_num: r.numero || undefined,
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
        street_id: await guessStreetId(r.endereco) || undefined,
      }))
    );

    for (const batch of chunkArray(inserts, 2000)) {
      await db.insert(schema.crashes).values(batch).onConflictDoNothing();
      console.log(`✅ ${path.basename(file)} → +${batch.length} linhas`);
    }
  }
}

// permite rodar isolado com: `tsx db/seed/traffic_crashes/seed.ts`
if (require.main === module) seedCrashes();
