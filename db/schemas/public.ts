import {
  pgTable,
  uniqueIndex,
  varchar,
  integer,
  serial,
  geometry,
  index,
} from "drizzle-orm/pg-core";

export const cities = pgTable(
  "cities",
  {
    id: integer("id").primaryKey(),
    name: varchar("name").notNull(),
    state: varchar("state", { length: 2 }).notNull(),
  },
  (t) => ({
    nameStateIdx: uniqueIndex("name_state_idx").on(t.name, t.state),
  })
);

export type Point = { latitude: number; longitude: number };
export const coordinates = pgTable("coordinates", {
  id: integer("id").primaryKey(),
  point: varchar("point").$type<Point>().notNull(),
  type: varchar("type"),
});

export const os_streets = pgTable(
  "streets",
  {
    id: serial("id").primaryKey(),
    osm_id: integer("osm_id"),
    name_osm: varchar("name_osm").notNull(),
    name_pref: varchar("name_pref"),
    geom: geometry("geom", { type: "LineString", srid: 4326 }).notNull(),
  },
  (t) => [index("streets_geom_idx").using("gist", t.geom)]
);
