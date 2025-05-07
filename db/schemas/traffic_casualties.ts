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
  geometry,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { pref_street_names } from "./streets";
import { cities } from "./global";

export const traffic_casualties = pgSchema("traffic_casualties");

export const cttu_crashes = traffic_casualties.table("cttu_crashes", {
  id: serial("id").primaryKey(),
  row_hash: text("row_hash").notNull().unique(),
  created_at: timestamp("created_at").defaultNow(), // facilita auditoria

  /**––– Vínculo opcional ao logradouro oficial ––––––––*/
  street_id: integer("street_id").references(() => pref_street_names.id, {
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
  geom: geometry("geom", { type: 'point', mode: 'xy', srid: 4326 }), // usar geometry(point) custom type quando estiver pronto
});

export const traffic_datasus_deaths = traffic_casualties.table(
  "traffic_datasus_deaths",
  {
    id: serial("id").primaryKey(),
    contador: integer("contador").notNull(),
    origem: varchar("origem", { length: 1 }),
    tipo_bito: varchar("tipo_bito", { length: 1 }),
    dtobito: date("dtobito").notNull(),
    horaobito: varchar("horaobito", { length: 6 }),
    natural: varchar("natural", { length: 3 }),
    lococor: varchar("lococor", { length: 50 }),
    circo_bito: varchar("circo_bito", { length: 3 }),
    dtnasc: date("dtnasc"),
    idade: integer("idade"),
    sexo: varchar("sexo", { length: 1 }),
    racacor: varchar("racacor", { length: 1 }),
    estciv: varchar("estciv", { length: 2 }),
    esc2010: varchar("esc2010", { length: 2 }),
    seriescfal: varchar("seriescfal", { length: 4 }),
    ocup: varchar("ocup", { length: 10 }),
    codmunocor: integer("codmunocor").references(() => cities.id),
    codmunres: integer("codmunres").references(() => cities.id),
    acidtrab: varchar("acidtrab", { length: 1 }),
    dtinvest: date("dtinvest"),
    fonte: varchar("fonte", { length: 20 }),
    linhaa: varchar("linhaa", { length: 10 }),
    linhab: varchar("linhab", { length: 10 }),
    linhac: varchar("linhac", { length: 10 }),
    linhad: varchar("linhad", { length: 10 }),
    linhaii: varchar("linhaii", { length: 10 }),
    causa_bas: varchar("causa_bas", { length: 7 }),
    created_at: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    unique_contador: uniqueIndex("datasus_deaths_contador_unique").on(
      t.contador,
      t.dtobito
    ),
  })
);
