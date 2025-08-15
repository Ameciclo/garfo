// db/schemas/traffic_crashes.ts
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
import { casualties } from "./casualties_schema";

export const cttu_crashes = casualties.table("cttu_crashes", {
  id: serial("id").primaryKey(),
  row_hash: text("row_hash").notNull().unique(),
  created_at: timestamp("created_at").defaultNow(), // facilita auditoria

  /**––– Vínculo opcional ao logradouro oficial ––––––––*/
  street_id: integer("street_id").references(() => pcr_street_names.id, {
    onDelete: "set null",
  }),

  /**––– Data & hora –––––––––––––––––––––––––––––––––––––*/
  data: date("data").notNull(), // coluna “data” nos CSVs
  hora: time("hora").notNull(), // coluna “hora” nos CSVs

  /**––– Classificações oficiais ––––––––––––––––––––––––*/
  natureza: varchar("natureza", { length: 50 }), // natureza_acidente
  situacao: varchar("situacao", { length: 50 }), // situacao
  tipo: varchar("tipo", { length: 80 }), // tipo
  descricao: text("descricao"), // descricao

  /**––– Localização textual ––––––––––––––––––––––––––––*/
  bairro: varchar("bairro", { length: 60 }),
  endereco: text("endereco"), // endereco
  numero: varchar("numero", { length: 15 }), // numero
  endereco_cruzamento: text("endereco_cruzamento"), // endereco_cruzamento

  /**––– Envolvidos –––––––––––––––––––––––––––––––––––––*/
  auto: integer("auto"),
  moto: integer("moto"),
  ciclom: integer("ciclom"),
  ciclista: integer("ciclista"),
  pedestre: integer("pedestre"),
  onibus: integer("onibus"),
  caminhao: integer("caminhao"),
  viatura: integer("viatura"),
  outros: integer("outros"),

  /**––– Resultados –––––––––––––––––––––––––––––––––––––*/
  vitimas: integer("vitimas"),
  vitimas_fat: integer("vitimas_fat"),

  /**––– Geometria (para geocodificação futura) ––––––––*/
  geom: geometry("geom", { type: "point", mode: "xy", srid: 4326 }), // usar geometry(point) custom type quando estiver pronto
});
