// public
import {
  pgTable,
  pgSchema,
  uniqueIndex,
  serial,
  varchar,
  boolean,
  integer,
  real,
  date,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

type Point = {
  latitude: number;
  longitude: number;
};

export const cities = pgTable(
  "cities",
  {
    id: integer("id").primaryKey(),
    name: varchar("name").notNull(),
    state: varchar("state", { length: 2 }).notNull(),
  },
  (cities) => ({
    nameStateIdx: uniqueIndex("name_state_idx").on(cities.name, cities.state),
  })
);

export const coordinates = pgTable("coordinates", {
  id: integer("id").primaryKey(),
  point: varchar("point").$type<Point>().notNull(), // Armazenar como texto, por exemplo, "latitude,longitude"
  type: varchar("type"),
});

//CYCLIST COUNT

export const cyclist_count_schema = pgSchema("cyclist_count");

export const cyclist_count_edition = cyclist_count_schema.table("edition", {
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

export const cyclist_count_session = cyclist_count_schema.table("session", {
  id: integer("id").primaryKey(),
  editionId: integer("edition_id")
    .references(() => cyclist_count_edition.id)
    .notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
});

// Tabela 'direction_count' no esquema 'cyclist_count'
export const direction_count = cyclist_count_schema.table("direction_count", {
  id: integer("id").primaryKey(),
  sessionId: integer("session_id")
    .references(() => cyclist_count_session.id)
    .notNull(),
  directionId: integer("direction_id")
    .references(() => directions.id)
    .notNull(),
  count: integer("count").notNull(),
});

// Tabela 'directions' no esquema 'cyclist_count'
export const directions = cyclist_count_schema.table("directions", {
  id: integer("id").primaryKey(),
  origin: varchar("origin").notNull(),
  originCardinal: varchar("origin_cardinal").notNull(),
  destin: varchar("destin").notNull(),
  destinCardinal: varchar("destin_cardinal").notNull(),
});

export const cyclist_count_characteristics = cyclist_count_schema.table(
  "characteristics",
  {
    id: integer("id").primaryKey(),
    name: varchar("name").notNull(),
    type: varchar("type").notNull(),
    atribute: varchar("atribute"),
  }
);

export const cyclist_count_characteristicsCount = cyclist_count_schema.table(
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

// CYCLIST INFRA

export const cyclist_infra_schema = pgSchema("cyclist_infra");

// Tabela 'relations' no schema 'cyclist_infra'
export const cyclist_infra_relations = cyclist_infra_schema.table("relations", {
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

export const cyclist_infra_relationCities = cyclist_infra_schema.table(
  "relation_cities",
  {
    relationId: integer("relation_id").references(
      () => cyclist_infra_relations.id
    ),
    citiesId: integer("cities_id").references(() => cities.id),
  }
);

export const cyclist_infra_ways = cyclist_infra_schema.table("ways", {
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
  lastUpdated: date("lastupdated"), // Coluna 'lastupdated' como tipo 'date'
  cityId: integer("city_id"), // Coluna 'city_id'
  dualCarriageway: boolean("dual_carriageway"), // Coluna 'dual_carriageway' como tipo boolean
  pdcTypology: varchar("pdc_typology"), // Coluna 'pdc_typology'
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
