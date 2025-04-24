import {
  pgSchema,
  integer,
  varchar,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { cities, coordinates } from "./public";

const cc = pgSchema("cyclist_count");

export const cyclist_count_edition = cc.table("edition", {
  id: integer("id").primaryKey(),
  cityId: integer("city_id")
    .references(() => cities.id)
    .notNull(),
  name: varchar("name").notNull(),
  date: date("date").notNull(),
  coordinatesId: integer("coordinates_id")
    .references(() => coordinates.id)
    .notNull(),
});

export const cyclist_count_session = cc.table("session", {
  id: integer("id").primaryKey(),
  editionId: integer("edition_id")
    .references(() => cyclist_count_edition.id)
    .notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
});

export const directions = cc.table("directions", {
  id: integer("id").primaryKey(),
  origin: varchar("origin").notNull(),
  originCardinal: varchar("origin_cardinal").notNull(),
  destin: varchar("destin").notNull(),
  destinCardinal: varchar("destin_cardinal").notNull(),
});

export const direction_count = cc.table("direction_count", {
  id: integer("id").primaryKey(),
  sessionId: integer("session_id")
    .references(() => cyclist_count_session.id)
    .notNull(),
  directionId: integer("direction_id")
    .references(() => directions.id)
    .notNull(),
  count: integer("count").notNull(),
});

export const cyclist_count_characteristics = cc.table("characteristics", {
  id: integer("id").primaryKey(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(),
  atribute: varchar("atribute"),
});

export const cyclist_count_characteristicsCount = cc.table(
  "characteristics_count",
  {
    id: integer("id").primaryKey(),
    sessionId: integer("session_id").references(() => cyclist_count_session.id),
    characteristicsId: integer("characteristics_id").references(
      () => cyclist_count_characteristics.id
    ),
    count: integer("count").notNull(),
  }
);
