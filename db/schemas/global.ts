import {
  varchar,
  integer,
  pgSchema,
  geometry,
  boolean,
} from "drizzle-orm/pg-core";

export const global = pgSchema("global");

export const cities = global.table("cities", {
  id: integer("id").primaryKey(),
  name: varchar("name").notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  full_state: varchar("full_state").notNull(),
  rmr: boolean("rmr"),
  geom: geometry("geom", {
    type: "Polygon",
    srid: 4326,
  }),
});
