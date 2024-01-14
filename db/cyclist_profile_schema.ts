// src/schema/cyclistProfileSchema.ts
import {
  pgTable,
  integer,
  serial,
  varchar,
  real,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { cities, researchers, coordinates } from "./public_schema";

export const edition = pgTable(
  "cyclist_profile.edition",
  {
    id: serial("id").primaryKey(),
    year: integer("year").notNull(),
    cityId: integer("city_id")
      .references(() => cities.id)
      .notNull(),
  },
  (edition) => ({
    yearCityIdx: uniqueIndex("year_city_idx").on(edition.year, edition.cityId),
  })
);

export const categories = pgTable(
  "cyclist_profile.categories",
  {
    id: serial("id").primaryKey(),
    type: varchar("type"),
    name: varchar("name"),
  },
  (categories) => ({
    typeNameIdx: uniqueIndex("type_name_idx").on(
      categories.type,
      categories.name
    ),
  })
);

export const summary = pgTable("cyclist_profile.summary", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .references(() => categories.id)
    .notNull(),
  value: real("value"),
  total: integer("total"),
});

export const editionSummary = pgTable("cyclist_profile.edition_summary", {
  editionId: integer("edition_id")
    .references(() => edition.id)
    .notNull(),
  summaryId: integer("summary_id")
    .references(() => summary.id)
    .notNull(),
});

export const formData = pgTable("cyclist_profile.form_data", {
  id: integer("id").primaryKey(),
  date: varchar("date"),
  weekday: varchar("weekday"),
  coordinatesId: integer("coordinates_id").references(() => coordinates.id),
  areaId: integer("area_id").references(() => categories.id),
  neighborhood: varchar("neighborhood"),
  address: varchar("address"),
  job: varchar("job"),
  age: integer("age"),
  ageCategoryId: integer("age_category_id").references(() => categories.id),
  genderId: integer("gender_id").references(() => categories.id),
  schoolingId: integer("schooling_id").references(() => categories.id),
  wageStandardId: integer("wage_standard_id").references(() => categories.id),
  colorRaceId: integer("color_race_id").references(() => categories.id),
  peopleAtHome: integer("people_at_home"),
  neighborhoodLiving: varchar("neighborhood_living"),
  weekUsageTotalCatId: integer("week_usage_total_cat_id").references(
    () => categories.id
  ),
  weekUsageTotal: integer("week_usage_total"),
  weekUsageWorking: integer("week_usage_working"),
  weekUsageSchool: integer("week_usage_school"),
  weekUsageShopping: integer("week_usage_shopping"),
  weekUsageLeisure: integer("week_usage_leisure"),
  weekUsageStation: integer("week_usage_station"),
  transportationIntegrationId: integer(
    "transportation_integration_id"
  ).references(() => categories.id),
  transportationBeforeBicycleId: integer(
    "transportation_before_bicycle_id"
  ).references(() => categories.id),
  distanceTimeId: integer("distance_time_id"),
  distanceTimeCategoryId: integer("distance_time_category_id").references(
    () => categories.id
  ),
  yearsUsingId: integer("years_using_id").references(() => categories.id),
  sharedBicycle: boolean("shared_bicycle"),
  collisionsLastYears: integer("collisions_last_years").references(
    () => categories.id
  ),
  neighborhoodOrigin: varchar("neighborhood_origin"),
  neighborhoodDestiny: varchar("neighborhood_destiny"),
  shareBikeChanges: boolean("share_bike_changes"),
  biggestIssue: integer("biggest_issue").references(() => categories.id),
  biggestNeed: integer("biggest_need").references(() => categories.id),
  motivationToStart: integer("motivation_to_start").references(
    () => categories.id
  ),
  motivationToContinue: integer("motivation_to_continue").references(
    () => categories.id
  ),
  covid19Changes: boolean("covid19_changes"),
  covid19FrequencyChanges: varchar("covid19_frequency_changes"),
  covid19AtHome: varchar("covid19_at_home"),
});

export const editionFormData = pgTable("cyclist_profile.edition_form_data", {
  editionId: integer("edition_id")
    .references(() => edition.id)
    .notNull(),
  formDataId: integer("form_data_id")
    .references(() => formData.id)
    .notNull(),
});

export const researcherFormData = pgTable(
  "cyclist_profile.researcher_form_data",
  {
    formDataId: integer("form_data_id")
      .references(() => formData.id)
      .notNull(),
    researcherId: integer("researcher_id")
      .references(() => researchers.id)
      .notNull(),
  }
);
