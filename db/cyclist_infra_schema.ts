// src/schema/cyclingInfraSchema.ts
import { pgTable, integer, varchar, real, boolean, jsonb } from 'drizzle-orm/pg-core';
import { cities } from './public_schema';

export const relations = pgTable('cycling_infra.relations', {
  osmId: integer('osm_id').primaryKey(),
  name: varchar('name'),
  pdcRef: varchar('pdc_ref'),
  pdcNotes: varchar('pdc_notes'),
  pdcTypology: varchar('pdc_typology'),
  kmTotal: real('km_total'),
  kmTotalCycleway: real('km_total_cycleway'),
  kmTotalCyclepath: real('km_total_cyclepath'),
  kmTotalCyclingRoute: real('km_total_cycling_route'),
  kmTotalFootway: real('km_total_footway'),
});

export const relationCities = pgTable('cycling_infra.relation_cities', {
  relationId: integer('relation_id').references(() => relations.osmId),
  citiesId: integer('cities_id').references(() => cities.id),
});

export const ways = pgTable('cycling_infra.ways', {
  osmId: integer('osm_id').primaryKey(),
  name: varchar('name'),
  length: real('length'),
  highway: varchar('highway'),
  hasCycleway: boolean('has_cycleway'),
  cyclewayTypology: varchar('cycleway_typology'),
  relationId: integer('relation_id').references(() => relations.osmId),
  geojson: jsonb('geojson'),
});
