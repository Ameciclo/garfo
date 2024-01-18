"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cyclist_infra_ways = exports.cyclist_infra_relationCities = exports.cyclist_infra_relations = exports.cyclist_infra_schema = exports.cyclist_count_characteristicsCount = exports.cyclist_count_characteristics = exports.directions = exports.direction_count = exports.cyclist_count_session = exports.cyclist_count_edition = exports.cyclist_count_schema = exports.coordinates = exports.cities = void 0;
// public
const pg_core_1 = require("drizzle-orm/pg-core");
exports.cities = (0, pg_core_1.pgTable)("cities", {
    id: (0, pg_core_1.integer)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    state: (0, pg_core_1.varchar)("state", { length: 2 }).notNull(),
}, (cities) => ({
    nameStateIdx: (0, pg_core_1.uniqueIndex)("name_state_idx").on(cities.name, cities.state),
}));
exports.coordinates = (0, pg_core_1.pgTable)("coordinates", {
    id: (0, pg_core_1.integer)("id").primaryKey(),
    point: (0, pg_core_1.varchar)("point").$type().notNull(), // Armazenar como texto, por exemplo, "latitude,longitude"
    type: (0, pg_core_1.varchar)("type"),
});
//CYCLIST COUNT
exports.cyclist_count_schema = (0, pg_core_1.pgSchema)("cyclist_count");
exports.cyclist_count_edition = exports.cyclist_count_schema.table("edition", {
    id: (0, pg_core_1.integer)("id").primaryKey(),
    cityId: (0, pg_core_1.integer)("city_id").references(() => exports.cities.id),
    name: (0, pg_core_1.varchar)("name"),
    date: (0, pg_core_1.date)("date"),
    coordinatesId: (0, pg_core_1.integer)("coordinates_id").references(() => exports.coordinates.id),
});
exports.cyclist_count_session = exports.cyclist_count_schema.table("session", {
    id: (0, pg_core_1.integer)("id").primaryKey(),
    editionId: (0, pg_core_1.integer)("edition_id").references(() => exports.cyclist_count_edition.id),
    startTime: (0, pg_core_1.timestamp)("start_time"),
    endTime: (0, pg_core_1.timestamp)("end_time"),
});
// Tabela 'direction_count' no esquema 'cyclist_count'
exports.direction_count = exports.cyclist_count_schema.table("direction_count", {
    id: (0, pg_core_1.integer)("id").primaryKey(),
    sessionId: (0, pg_core_1.integer)("session_id").references(() => exports.cyclist_count_session.id),
    directionId: (0, pg_core_1.integer)("direction_id").references(() => exports.directions.id),
    count: (0, pg_core_1.integer)("count"),
});
// Tabela 'directions' no esquema 'cyclist_count'
exports.directions = exports.cyclist_count_schema.table("directions", {
    id: (0, pg_core_1.integer)("id").primaryKey(),
    origin: (0, pg_core_1.varchar)("origin"),
    originCardinal: (0, pg_core_1.varchar)("origin_cardinal"),
    destin: (0, pg_core_1.varchar)("destin"),
    destinCardinal: (0, pg_core_1.varchar)("destin_cardinal"),
});
exports.cyclist_count_characteristics = exports.cyclist_count_schema.table("characteristics", {
    id: (0, pg_core_1.integer)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name"),
    type: (0, pg_core_1.varchar)("type"),
    atribute: (0, pg_core_1.varchar)("atribute"),
});
exports.cyclist_count_characteristicsCount = exports.cyclist_count_schema.table("characteristics_count", {
    id: (0, pg_core_1.integer)("id").primaryKey(),
    sessionId: (0, pg_core_1.integer)("session_id").references(() => exports.cyclist_count_session.id),
    characteristicsId: (0, pg_core_1.integer)("characteristics_id").references(() => exports.cyclist_count_characteristics.id),
    count: (0, pg_core_1.integer)("count"),
});
// CYCLIST INFRA
exports.cyclist_infra_schema = (0, pg_core_1.pgSchema)("cyclist_infra");
// Tabela 'relations' no schema 'cyclist_infra'
exports.cyclist_infra_relations = exports.cyclist_infra_schema.table("relations", {
    id: (0, pg_core_1.integer)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name"),
    pdcRef: (0, pg_core_1.varchar)("pdc_ref"),
    pdcNotes: (0, pg_core_1.varchar)("pdc_notes"),
    pdcTypology: (0, pg_core_1.varchar)("pdc_typology"),
    pdcKm: (0, pg_core_1.real)("pdc_km"),
    pdcStretch: (0, pg_core_1.varchar)("pdc_stretch"),
    pdcCities: (0, pg_core_1.varchar)("pdc_cities"),
    osmId: (0, pg_core_1.integer)("osm_id"),
    notes: (0, pg_core_1.varchar)("notes"),
});
exports.cyclist_infra_relationCities = exports.cyclist_infra_schema.table("relation_cities", {
    relationId: (0, pg_core_1.integer)("relation_id").references(() => exports.cyclist_infra_relations.id),
    citiesId: (0, pg_core_1.integer)("cities_id").references(() => exports.cities.id),
});
exports.cyclist_infra_ways = exports.cyclist_infra_schema.table("ways", {
    osmId: (0, pg_core_1.integer)("osm_id").primaryKey(),
    name: (0, pg_core_1.varchar)("name"),
    length: (0, pg_core_1.real)("length"),
    highway: (0, pg_core_1.varchar)("highway"),
    hasCycleway: (0, pg_core_1.boolean)("has_cycleway"),
    cyclewayTypology: (0, pg_core_1.varchar)("cycleway_typology"),
    relationId: (0, pg_core_1.integer)("relation_id").references(() => exports.cyclist_infra_relations.id),
    geojson: (0, pg_core_1.jsonb)("geojson"),
    lastUpdated: (0, pg_core_1.date)("lastupdated"), // Coluna 'lastupdated' como tipo 'date'
    cityId: (0, pg_core_1.integer)("city_id"), // Coluna 'city_id'
    dualCarriageway: (0, pg_core_1.boolean)("dual_carriageway"), // Coluna 'dual_carriageway' como tipo boolean
    pdcTypology: (0, pg_core_1.varchar)("pdc_typology"), // Coluna 'pdc_typology'
});
/* // CYCLIST PROFILE

export const cyclist_profile_schema = pgSchema("cyclist_profile");

export const cyclist_profile_edition = cyclist_profile_schema.table(
  "edition",
  {
    id: serial("id").primaryKey(),
    year: integer("year").notNull(),
    cityId: integer("city_id")
      .references(() => cities.id)
      .notNull(),
  },
  (edition) => ({
    yearCityIdx: uniqueIndex("year_city_idx").on(
      cyclist_profile_edition.year,
      cyclist_profile_edition.cityId
    ),
  })
);

export const cyclist_profile_categories = cyclist_profile_schema.table(
  "categories",
  {
    id: serial("id").primaryKey(),
    type: varchar("type"),
    name: varchar("name"),
  },
  (categories) => ({
    typeNameIdx: uniqueIndex("type_name_idx").on(
      cyclist_profile_categories.type,
      cyclist_profile_categories.name
    ),
  })
);

export const cyclist_profile_summary = cyclist_profile_schema.table("summary", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .references(() => cyclist_profile_categories.id)
    .notNull(),
  value: real("value"),
  total: integer("total"),
});

export const cyclist_profile_editionSummary = cyclist_profile_schema.table(
  "edition_summary",
  {
    editionId: integer("edition_id")
      .references(() => cyclist_profile_edition.id)
      .notNull(),
    summaryId: integer("summary_id")
      .references(() => cyclist_profile_summary.id)
      .notNull(),
  }
);

export const cyclist_profile_formData = cyclist_profile_schema.table(
  "form_data",
  {
    id: integer("id").primaryKey(),
    date: varchar("date"),
    weekday: varchar("weekday"),
    coordinatesId: integer("coordinates_id").references(() => coordinates.id),
    areaId: integer("area_id").references(() => cyclist_profile_categories.id),
    neighborhood: varchar("neighborhood"),
    address: varchar("address"),
    job: varchar("job"),
    age: integer("age"),
    ageCategoryId: integer("age_category_id").references(
      () => cyclist_profile_categories.id
    ),
    genderId: integer("gender_id").references(
      () => cyclist_profile_categories.id
    ),
    schoolingId: integer("schooling_id").references(
      () => cyclist_profile_categories.id
    ),
    wageStandardId: integer("wage_standard_id").references(
      () => cyclist_profile_categories.id
    ),
    colorRaceId: integer("color_race_id").references(
      () => cyclist_profile_categories.id
    ),
    peopleAtHome: integer("people_at_home"),
    neighborhoodLiving: varchar("neighborhood_living"),
    weekUsageTotalCatId: integer("week_usage_total_cat_id").references(
      () => cyclist_profile_categories.id
    ),
    weekUsageTotal: integer("week_usage_total"),
    weekUsageWorking: integer("week_usage_working"),
    weekUsageSchool: integer("week_usage_school"),
    weekUsageShopping: integer("week_usage_shopping"),
    weekUsageLeisure: integer("week_usage_leisure"),
    weekUsageStation: integer("week_usage_station"),
    transportationIntegrationId: integer(
      "transportation_integration_id"
    ).references(() => cyclist_profile_categories.id),
    transportationBeforeBicycleId: integer(
      "transportation_before_bicycle_id"
    ).references(() => cyclist_profile_categories.id),
    distanceTimeId: integer("distance_time_id"),
    distanceTimeCategoryId: integer("distance_time_category_id").references(
      () => cyclist_profile_categories.id
    ),
    yearsUsingId: integer("years_using_id").references(
      () => cyclist_profile_categories.id
    ),
    sharedBicycle: boolean("shared_bicycle"),
    collisionsLastYears: integer("collisions_last_years").references(
      () => cyclist_profile_categories.id
    ),
    neighborhoodOrigin: varchar("neighborhood_origin"),
    neighborhoodDestiny: varchar("neighborhood_destiny"),
    shareBikeChanges: boolean("share_bike_changes"),
    biggestIssue: integer("biggest_issue").references(
      () => cyclist_profile_categories.id
    ),
    biggestNeed: integer("biggest_need").references(
      () => cyclist_profile_categories.id
    ),
    motivationToStart: integer("motivation_to_start").references(
      () => cyclist_profile_categories.id
    ),
    motivationToContinue: integer("motivation_to_continue").references(
      () => cyclist_profile_categories.id
    ),
    covid19Changes: boolean("covid19_changes"),
    covid19FrequencyChanges: varchar("covid19_frequency_changes"),
    covid19AtHome: varchar("covid19_at_home"),
  }
);

export const cyclist_profile_editionFormData = cyclist_profile_schema.table(
  "edition_form_data",
  {
    editionId: integer("edition_id")
      .references(() => cyclist_profile_edition.id)
      .notNull(),
    formDataId: integer("form_data_id")
      .references(() => cyclist_profile_formData.id)
      .notNull(),
  }
);

export const cyclist_profile_researcherFormData = cyclist_profile_schema.table(
  "researcher_form_data",
  {
    formDataId: integer("form_data_id")
      .references(() => cyclist_profile_formData.id)
      .notNull(),
    researcherId: integer("researcher_id")
      .references(() => researchers.id)
      .notNull(),
  }
);
 */
