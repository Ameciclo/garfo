CREATE SCHEMA "traffic";
--> statement-breakpoint
CREATE TABLE "traffic"."crashes" (
	"id" serial PRIMARY KEY NOT NULL,
	"crash_date" date NOT NULL,
	"crash_time" time NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"natureza" varchar(50),
	"situacao" varchar(50),
	"tipo" varchar(80),
	"descricao" text,
	"bairro" varchar(60),
	"street_name" text,
	"street_num" varchar(15),
	"cross_st" text,
	"street_id" integer,
	"auto" integer,
	"moto" integer,
	"ciclom" integer,
	"ciclista" integer,
	"pedestre" integer,
	"onibus" integer,
	"caminhao" integer,
	"viatura" integer,
	"outros" integer,
	"vitimas" integer,
	"vitimas_fat" integer,
	"geom" text
);
--> statement-breakpoint
ALTER TABLE "traffic"."crashes" ADD CONSTRAINT "crashes_street_id_pref_street_names_id_fk" FOREIGN KEY ("street_id") REFERENCES "streets"."pref_street_names"("id") ON DELETE set null ON UPDATE no action;