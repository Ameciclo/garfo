CREATE TABLE "global"."speed_plates" (
	"id" serial PRIMARY KEY NOT NULL,
	"speed" integer NOT NULL,
	"geom" geometry(point) NOT NULL
);
