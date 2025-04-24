// migration/schema/public.ts
import { pgTable, uniqueIndex, varchar, integer } from "drizzle-orm/pg-core";

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

