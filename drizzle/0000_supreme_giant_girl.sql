CREATE SCHEMA "cyclist_count";
--> statement-breakpoint
CREATE SCHEMA "cyclist_infra";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"state" varchar(2)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coordinates" (
	"id" integer PRIMARY KEY NOT NULL,
	"point" varchar,
	"type" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cyclist_count"."characteristics" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar,
	"type" varchar,
	"atribute" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cyclist_count"."characteristics_count" (
	"id" integer PRIMARY KEY NOT NULL,
	"session_id" integer,
	"characteristics_id" integer,
	"count" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cyclist_count"."direction_counts" (
	"id" integer PRIMARY KEY NOT NULL,
	"session_id" integer,
	"origin" varchar,
	"origin_cardinal" varchar,
	"destin" varchar,
	"destin_cardinal" varchar,
	"count" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cyclist_count"."edition" (
	"id" integer PRIMARY KEY NOT NULL,
	"city_id" integer,
	"name" varchar,
	"date" date,
	"coordinates_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cyclist_count"."researcher_session" (
	"count_session_id" integer NOT NULL,
	"researcher_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cyclist_count"."session" (
	"id" integer PRIMARY KEY NOT NULL,
	"edition_id" integer,
	"start_time" time,
	"end_time" time
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cyclist_count"."summary" (
	"id" integer PRIMARY KEY NOT NULL,
	"edition_id" integer,
	"count" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cyclist_infra"."relation_cities" (
	"relation_id" integer,
	"cities_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cyclist_infra"."relations" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar,
	"pdc_ref" varchar,
	"pdc_notes" varchar,
	"pdc_typology" varchar,
	"pdc_km" real,
	"pdc_stretch" real,
	"pdc_cities" real,
	"osm_id" real,
	"notes" real
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cyclist_infra"."ways" (
	"osm_id" integer PRIMARY KEY NOT NULL,
	"name" varchar,
	"length" real,
	"highway" varchar,
	"has_cycleway" boolean,
	"cycleway_typology" varchar,
	"relation_id" integer,
	"geojson" jsonb,
	"lastupdated" date,
	"city_id" integer,
	"dual_carriageway" boolean,
	"pdc_typology" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "researchers" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "name_state_idx" ON "cities" ("name","state");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cyclist_count"."characteristics_count" ADD CONSTRAINT "characteristics_count_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "cyclist_count"."session"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cyclist_count"."characteristics_count" ADD CONSTRAINT "characteristics_count_characteristics_id_characteristics_id_fk" FOREIGN KEY ("characteristics_id") REFERENCES "cyclist_count"."characteristics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cyclist_count"."direction_counts" ADD CONSTRAINT "direction_counts_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "cyclist_count"."session"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cyclist_count"."edition" ADD CONSTRAINT "edition_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cyclist_count"."edition" ADD CONSTRAINT "edition_coordinates_id_coordinates_id_fk" FOREIGN KEY ("coordinates_id") REFERENCES "coordinates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cyclist_count"."researcher_session" ADD CONSTRAINT "researcher_session_count_session_id_session_id_fk" FOREIGN KEY ("count_session_id") REFERENCES "cyclist_count"."session"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cyclist_count"."researcher_session" ADD CONSTRAINT "researcher_session_researcher_id_researchers_id_fk" FOREIGN KEY ("researcher_id") REFERENCES "researchers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cyclist_count"."session" ADD CONSTRAINT "session_edition_id_edition_id_fk" FOREIGN KEY ("edition_id") REFERENCES "cyclist_count"."edition"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cyclist_count"."summary" ADD CONSTRAINT "summary_edition_id_edition_id_fk" FOREIGN KEY ("edition_id") REFERENCES "cyclist_count"."edition"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cyclist_infra"."relation_cities" ADD CONSTRAINT "relation_cities_relation_id_relations_id_fk" FOREIGN KEY ("relation_id") REFERENCES "cyclist_infra"."relations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cyclist_infra"."relation_cities" ADD CONSTRAINT "relation_cities_cities_id_cities_id_fk" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cyclist_infra"."ways" ADD CONSTRAINT "ways_relation_id_relations_id_fk" FOREIGN KEY ("relation_id") REFERENCES "cyclist_infra"."relations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
