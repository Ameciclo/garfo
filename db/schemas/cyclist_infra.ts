import {
  pgSchema,
  integer,
  varchar,
  real,
  boolean,
  jsonb,
  date,
} from "drizzle-orm/pg-core";
import { cities } from "./public";

export const ci = pgSchema("cyclist_infra");

export const cyclist_infra_relations = ci.table("relations", {
  id: integer("id").primaryKey(),
  name: varchar("name"),
  pdcRef: varchar("pdc_ref"),
  pdcNotes: varchar("pdc_notes"),
  pdcTypology: varchar("pdc_typology"),
  pdcKm: real("pdc_km"),
  pdcStretch: varchar("pdc_stretch"),
  pdcCities: varchar("pdc_cities"),
  osmId: integer("osm_id"),
  notes: varchar("notes"),
});

export const cyclist_infra_relationCities = ci.table("relation_cities", {
  relationId: integer("relation_id").references(
    () => cyclist_infra_relations.id
  ),
  citiesId: integer("cities_id").references(() => cities.id),
});

export const cyclist_infra_ways = ci.table("ways", {
  osmId: integer("osm_id").primaryKey(),
  name: varchar("name"),
  length: real("length"),
  highway: varchar("highway"),
  hasCycleway: boolean("has_cycleway"),
  cyclewayTypology: varchar("cycleway_typology"),
  relationId: integer("relation_id").references(
    () => cyclist_infra_relations.id
  ),
  geojson: jsonb("geojson"),
  lastUpdated: date("lastupdated"),
  cityId: integer("city_id"),
  dualCarriageway: boolean("dual_carriageway"),
  pdcTypology: varchar("pdc_typology"),
});
