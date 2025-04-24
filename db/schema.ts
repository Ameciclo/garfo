export * from "./schemas/public";
export * from "./schemas/cyclist_count";
export * from "./schemas/cyclist_infra";
//export * from "./schemas/cyclist_profile";

// // public
// import {
//   pgTable,
//   pgSchema,
//   uniqueIndex,
//   serial,
//   varchar,
//   boolean,
//   integer,
//   real,
//   date,
//   timestamp,
//   jsonb,
// } from "drizzle-orm/pg-core";

// type Point = {
//   latitude: number;
//   longitude: number;
// };

// export const cities = pgTable(
//   "cities",
//   {
//     id: integer("id").primaryKey(),
//     name: varchar("name").notNull(),
//     state: varchar("state", { length: 2 }).notNull(),
//   },
//   (cities) => ({
//     nameStateIdx: uniqueIndex("name_state_idx").on(cities.name, cities.state),
//   })
// );

// export const coordinates = pgTable("coordinates", {
//   id: integer("id").primaryKey(),
//   point: varchar("point").$type<Point>().notNull(), // Armazenar como texto, por exemplo, "latitude,longitude"
//   type: varchar("type"),
// });

// //CYCLIST COUNT

// export const cyclist_count_schema = pgSchema("cyclist_count");

// export const cyclist_count_edition = cyclist_count_schema.table("edition", {
//   id: integer("id").primaryKey(),
//   cityId: integer("city_id")
//     .references(() => cities.id)
//     .notNull(),
//   name: varchar("name").notNull(),
//   date: date("date").notNull(),
//   coordinatesId: integer("coordinates_id")
//     .references(() => coordinates.id)
//     .notNull(),
// });

// export const cyclist_count_session = cyclist_count_schema.table("session", {
//   id: integer("id").primaryKey(),
//   editionId: integer("edition_id")
//     .references(() => cyclist_count_edition.id)
//     .notNull(),
//   startTime: timestamp("start_time").notNull(),
//   endTime: timestamp("end_time").notNull(),
// });

// // Tabela 'direction_count' no esquema 'cyclist_count'
// export const direction_count = cyclist_count_schema.table("direction_count", {
//   id: integer("id").primaryKey(),
//   sessionId: integer("session_id")
//     .references(() => cyclist_count_session.id)
//     .notNull(),
//   directionId: integer("direction_id")
//     .references(() => directions.id)
//     .notNull(),
//   count: integer("count").notNull(),
// });

// // Tabela 'directions' no esquema 'cyclist_count'
// export const directions = cyclist_count_schema.table("directions", {
//   id: integer("id").primaryKey(),
//   origin: varchar("origin").notNull(),
//   originCardinal: varchar("origin_cardinal").notNull(),
//   destin: varchar("destin").notNull(),
//   destinCardinal: varchar("destin_cardinal").notNull(),
// });

// export const cyclist_count_characteristics = cyclist_count_schema.table(
//   "characteristics",
//   {
//     id: integer("id").primaryKey(),
//     name: varchar("name").notNull(),
//     type: varchar("type").notNull(),
//     atribute: varchar("atribute"),
//   }
// );

// export const cyclist_count_characteristicsCount = cyclist_count_schema.table(
//   "characteristics_count",
//   {
//     id: integer("id").primaryKey(),
//     sessionId: integer("session_id").references(() => cyclist_count_session.id),
//     characteristicsId: integer("characteristics_id").references(
//       () => cyclist_count_characteristics.id
//     ),
//     count: integer("count").notNull(),
//   }
// );

// // CYCLIST INFRA

// export const cyclist_infra_schema = pgSchema("cyclist_infra");

// // Tabela 'relations' no schema 'cyclist_infra'
// export const cyclist_infra_relations = cyclist_infra_schema.table("relations", {
//   id: integer("id").primaryKey(),
//   name: varchar("name"),
//   pdcRef: varchar("pdc_ref"),
//   pdcNotes: varchar("pdc_notes"),
//   pdcTypology: varchar("pdc_typology"),
//   pdcKm: real("pdc_km"),
//   pdcStretch: varchar("pdc_stretch"),
//   pdcCities: varchar("pdc_cities"),
//   osmId: integer("osm_id"),
//   notes: varchar("notes"),
// });

// export const cyclist_infra_relationCities = cyclist_infra_schema.table(
//   "relation_cities",
//   {
//     relationId: integer("relation_id").references(
//       () => cyclist_infra_relations.id
//     ),
//     citiesId: integer("cities_id").references(() => cities.id),
//   }
// );

// export const cyclist_infra_ways = cyclist_infra_schema.table("ways", {
//   osmId: integer("osm_id").primaryKey(),
//   name: varchar("name"),
//   length: real("length"),
//   highway: varchar("highway"),
//   hasCycleway: boolean("has_cycleway"),
//   cyclewayTypology: varchar("cycleway_typology"),
//   relationId: integer("relation_id").references(
//     () => cyclist_infra_relations.id
//   ),
//   geojson: jsonb("geojson"),
//   lastUpdated: date("lastupdated"), // Coluna 'lastupdated' como tipo 'date'
//   cityId: integer("city_id"), // Coluna 'city_id'
//   dualCarriageway: boolean("dual_carriageway"), // Coluna 'dual_carriageway' como tipo boolean
//   pdcTypology: varchar("pdc_typology"), // Coluna 'pdc_typology'
// });
