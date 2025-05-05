import * as schema from "../../schemas/streets";
import { db, readCsv } from "../utils";
import fs from "fs/promises";
import path from "path";
import { sql } from "drizzle-orm";
import { raw } from "express";

type PrefStreetInsert = {
  codlogradouro: number;
  nome_logradouro_concatenado: string;
  nome_oficial_logradouro: string;
  nome_logradouro_resumido: string;
  cod_indica_pavimentacao?: string;
  desc_indica_pavimentacao?: string;
  indica_corredor_transporte?: string;
  indica_perimetral?: string;
  codbairro?: number;
  nome_bairro?: string;
};

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function seedPrefStreets() {
  const data = await readCsv<PrefStreetInsert>(
    "./db/seed/streets/trechoslogradouro.csv"
  );

  const valid = data.filter(
    (r) =>
      r.codlogradouro != null &&
      r.nome_logradouro_concatenado &&
      r.nome_oficial_logradouro &&
      r.nome_logradouro_resumido
  );

  const batches = chunkArray(valid, 1000);
  for (const batch of batches) {
    await db
      .insert(schema.pref_street_names)
      .values(batch)
      .onConflictDoNothing()
      .execute();
    console.log(`✅ Inseridos ${batch.length} logradouros`);
  }
}

async function seedStreetGeoms() {
  const geojsonPath = path.resolve(__dirname, "trechos-de-logradouros.geojson");
  const content = await fs.readFile(geojsonPath, "utf-8");
  const geojson = JSON.parse(content);

  for (const feature of geojson.features) {
    const rawCode = feature.properties.CLOGRACODI;
    const code =
      typeof rawCode === "number"
        ? Math.round(rawCode)
        : parseInt(String(rawCode), 10);
    if (isNaN(code)) continue;

    const geometry = JSON.stringify(feature.geometry);
    await db.execute(
      sql`UPDATE ${schema.pref_street_names}
        SET geom = ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(${geometry}), 4326))
        WHERE codlogradouro = ${code}`
    );
  }

  console.log("✅ Geometrias de logradouros atualizadas");
}

// Orquestra as duas etapas de seed
export async function seedAllStreets() {
  await seedPrefStreets();
  await seedStreetGeoms();
}

// Se executado diretamente
if (require.main === module) {
  seedAllStreets()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
