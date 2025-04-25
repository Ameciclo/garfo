import * as schema from "../../schemas/streets";
import { db, readCsv } from "../utils";

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

export async function seedPrefStreets() {
  const data = await readCsv<PrefStreetInsert>(
    "./db/seed/streets/trechoslogradouro.csv"
  );

  // filtra só as linhas que têm codlogradouro e nome
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
      .onConflictDoNothing();
    console.log(`✅ Inseridos ${batch.length} logradouros`);
  }
}
