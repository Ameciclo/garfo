// src/schema/cyclistCountSchema.ts
import { pgTable, integer, varchar, date, time } from "drizzle-orm/pg-core";
import { cities, researchers, coordinates } from "./public_schema";

export const edition = pgTable("cyclist_count.edition", {
  id: integer("id").primaryKey(),
  cityId: integer("city_id").references(() => cities.id),
  name: varchar("name"),
  date: date("date"),
  coordinatesId: integer("coordinates_id").references(() => coordinates.id),
});

export const summary = pgTable("cyclist_count.summary", {
  id: integer("id").primaryKey(),
  editionId: integer("edition_id").references(() => edition.id),
  count: integer("count"),
});

export const researcherSession = pgTable("cyclist_count.researcher_session", {
  countSessionId: integer("count_session_id")
    .references(() => session.id)
    .notNull(),
  researcherId: integer("researcher_id")
    .references(() => researchers.id)
    .notNull(),
});

export const session = pgTable("cyclist_count.session", {
  id: integer("id").primaryKey(),
  editionId: integer("edition_id").references(() => edition.id),
  startTime: time("start_time"),
  endTime: time("end_time"),
});

export const directionCounts = pgTable("cyclist_count.direction_counts", {
  id: integer("id").primaryKey(),
  sessionId: integer("session_id").references(() => session.id),
  origin: varchar("origin"),
  originCardinal: varchar("origin_cardinal"),
  destin: varchar("destin"),
  destinCardinal: varchar("destin_cardinal"),
  count: integer("count"),
});

export const characteristicsCount = pgTable(
  "cyclist_count.characteristics_count",
  {
    id: integer("id").primaryKey(),
    sessionId: integer("session_id").references(() => session.id),
    characteristicsId: integer("characteristics_id").references(
      () => characteristics.id
    ),
    count: integer("count"),
  }
);

export const characteristics = pgTable("cyclist_count.characteristics", {
  id: integer("id").primaryKey(),
  name: varchar("name"),
  type: varchar("type"),
  atributo: varchar("atributo"),
});
