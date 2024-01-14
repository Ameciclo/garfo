CREATE TABLE IF NOT EXISTS "public.cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"state" varchar(2)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public.coordinates" (
	"id" integer PRIMARY KEY NOT NULL,
	"point" "geometry(Point,4326)",
	"type" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public.researchers" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_state_idx" ON "public.cities" ("name","state");