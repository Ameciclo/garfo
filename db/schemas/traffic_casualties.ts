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
  geom: geometry("geom", { type: "point", mode: "xy", srid: 4326 }), // usar geometry(point) custom type quando estiver pronto
});

export const traffic_datasus_deaths = traffic_casualties.table(
  "traffic_datasus_deaths",
  {
    id: serial("id").primaryKey(),
    contador: integer("contador"),
    tipobito: varchar("tipobito"),
    dtobito: date("dtobito").notNull(),
    horaobito: varchar("horaobito", { length: 5 }),
    natural: varchar("natural"),
    codmunnat: integer("codmunnat").references(() => cities.id),
    dtnasc: date("dtnasc"),
    idade: integer("idade"),
    sexo: varchar("sexo"),
    racacor: varchar("racacor"),
    estciv: varchar("estciv"),
    esc2010: varchar("esc2010"),
    seriescfal: varchar("seriescfal"),
    ocup: varchar("ocup"),
    codmunres: integer("codmunres").references(() => cities.id),
    lococor: varchar("lococor"),
    codmunocor: integer("codmunocor").references(() => cities.id),
    linhaa: varchar("linhaa"),
    linhab: varchar("linhab"),
    linhac: varchar("linhac"),
    linhad: varchar("linhad"),
    linhaii: varchar("linhaii"),
    circobito: varchar("circobito"),
    acidtrab: varchar("acidtrab"),
    fonte: varchar("fonte"),
    origem: varchar("origem"),
    esc: varchar("esc"),
    exame: varchar("exame"),
    cirurgia: varchar("cirurgia"),
    dtinvestig: date("dtinvestig"),
    causabas_o: varchar("causabas_o"),
    causabas: varchar("causabas"),
    created_at: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    unique_contador: uniqueIndex("datasus_deaths_contador_unique").on(
      t.contador,
      t.dtobito
    ),
  })
);
