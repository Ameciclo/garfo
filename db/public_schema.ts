// public
import { pgTable, integer, serial, varchar, index, uniqueIndex } from "drizzle-orm/pg-core";
import { pointType } from "./PointAdaptation";

export const cities = pgTable('public.cities', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  state: varchar('state', { length: 2 }),
}, (cities) => ({
  nameStateIdx: uniqueIndex('name_state_idx').on(cities.name, cities.state),
}));

export const researchers = pgTable('public.researchers', {
  id: integer('id').primaryKey(),
  name: varchar('name'),
});

export const coordinates = pgTable('public.coordinates', {
  id: integer('id').primaryKey(),
  point: pointType('point'),
  type: varchar('type'),
});
