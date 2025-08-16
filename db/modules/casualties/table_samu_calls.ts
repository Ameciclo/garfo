import {
  serial,
  integer,
  varchar,
  text,
  date,
  time,
  timestamp,
  geometry,
} from "drizzle-orm/pg-core";
import { pcr_street_names } from "../global/table_pcr_street_names";
import { cities } from "../global/table_cities";
import { casualties } from "./casualties_schema";

export const samu_calls = casualties.table("samu_calls", {
  id: serial("id").primaryKey(),
  row_hash: text("row_hash").notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),

  /**––– Vínculo opcional ao logradouro oficial ––––––––*/
  street_id: integer("street_id").references(() => pcr_street_names.id, {
    onDelete: "set null",
  }),

  /**––– Vínculo à cidade ––––––––––––––––––––––––––––––*/
  city_id: integer("city_id").references(() => cities.id, {
    onDelete: "set null",
  }),

  /**––– Identificação original ––––––––––––––––––––––––*/
  original_id: integer("original_id"), // _id do TSV

  /**––– Data & hora –––––––––––––––––––––––––––––––––––––*/
  data: date("data"),
  hora_minuto: time("hora_minuto"),

  /**––– Localização –––––––––––––––––––––––––––––––––––––*/
  municipio: varchar("municipio", { length: 100 }),
  bairro: varchar("bairro", { length: 100 }),
  endereco: text("endereco"),
  endereco_pcr: text("endereco_pcr"), // campo para matching com PCR

  /**––– Origem da chamada ––––––––––––––––––––––––––––––*/
  origem_chamado: varchar("origem_chamado", { length: 50 }),
  orig_tipo: varchar("orig_tipo", { length: 50 }),

  /**––– Classificação do acidente ––––––––––––––––––––––*/
  subtipo: varchar("subtipo", { length: 50 }), // ACIDENTMOTO, ATROPELCARRO, etc.
  tipo: varchar("tipo", { length: 100 }),
  categoria: varchar("categoria", { length: 100 }),

  /**––– Dados da vítima ––––––––––––––––––––––––––––––––*/
  sexo: varchar("sexo", { length: 20 }),
  idade: integer("idade"),

  /**––– Desfecho do atendimento ––––––––––––––––––––––––*/
  motivo_finalizacao: text("motivo_finalizacao"),
  motivo_desfecho: text("motivo_desfecho"),
  motivo_fin_norm: text("motivo_fin_norm"),
  motivo_desf_norm: text("motivo_desf_norm"),
  motivo_fin_cat: varchar("motivo_fin_cat", { length: 100 }),
  motivo_desf_cat: varchar("motivo_desf_cat", { length: 100 }),

  /**––– Geometria (para geocodificação futura) ––––––––*/
  geom: geometry("geom", { type: "point", mode: "xy", srid: 4326 }),
});