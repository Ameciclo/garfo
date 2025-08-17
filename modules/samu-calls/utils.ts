import { sql, inArray } from "drizzle-orm";
import { samu_calls } from "../../db/schema";
import { config } from "./config";

export function getOutcomeFilter(includeInvalid: boolean = false) {
  if (includeInvalid) {
    return sql`1=1`; // Retorna todos os registros
  }
  
  // Retorna apenas desfechos válidos
  return inArray(samu_calls.motivo_desf_cat, config.desfechos.validos);
}

export function parseIncludeInvalid(query: any): boolean {
  const includeInvalid = query.incluir_invalidos || query.include_invalid;
  return includeInvalid === 'true' || includeInvalid === '1';
}