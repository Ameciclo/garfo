CREATE SCHEMA "streets";
--> statement-breakpoint
CREATE TABLE "streets"."pref_street_names" (
	"id" serial PRIMARY KEY NOT NULL,
	"codlogradouro" integer NOT NULL,
	"nome_logradouro_concatenado" text NOT NULL,
	"nome_oficial_logradouro" text NOT NULL,
	"nome_logradouro_resumido" text NOT NULL,
	"cod_indica_pavimentacao" varchar,
	"desc_indica_pavimentacao" text,
	"indica_corredor_transporte" varchar,
	"indica_perimetral" varchar,
	"codbairro" integer,
	"nomeBairro" text
);
--> statement-breakpoint
ALTER TABLE "cyclist_count"."edition" ADD COLUMN "geom" geometry(point) NOT NULL;