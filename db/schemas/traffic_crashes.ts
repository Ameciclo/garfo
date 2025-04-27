// db/schemas/traffic_crashes.ts
import {
  pgSchema,
  serial,
  integer,
  varchar,
  text,
  date,
  time,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { pref_street_names } from "./streets";

export const traffic = pgSchema("traffic");

export const crashes = traffic.table("crashes", {
  id: serial("id").primaryKey(),
  row_hash: text("row_hash").notNull().unique(),

  /**––– Data & hora –––––––––––––––––––––––––––––––––––––*/
  crash_date: date("crash_date").notNull(), // coluna “data” nos CSVs
  crash_time: time("crash_time").notNull(), // coluna “hora” nos CSVs
  created_at: timestamp("created_at").defaultNow(), // facilita auditoria

  /**––– Classificações oficiais ––––––––––––––––––––––––*/
  natureza: varchar("natureza", { length: 50 }), // natureza_acidente
  situacao: varchar("situacao", { length: 50 }), // situacao
  tipo: varchar("tipo", { length: 80 }), // tipo
  descricao: text("descricao"), // descricao

  /**––– Localização textual ––––––––––––––––––––––––––––*/
  bairro: varchar("bairro", { length: 60 }),
  street_name: text("street_name"), // endereco
  street_num: varchar("street_num", { length: 15 }), // numero
  cross_st: text("cross_st"), // endereco_cruzamento

  /**––– Vínculo opcional ao logradouro oficial ––––––––*/
  street_id: integer("street_id").references(() => pref_street_names.id, {
    onDelete: "set null",
  }),

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
  geom: text("geom"), // usar geometry(point) custom type quando estiver pronto
});
