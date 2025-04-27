CREATE SCHEMA "streets";
--> statement-breakpoint
CREATE SCHEMA "traffic";
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
	"nomeBairro" text,
	"geom" geometry(point),
	CONSTRAINT "pref_street_names_codlogradouro_unique" UNIQUE("codlogradouro")
);
--> statement-breakpoint
CREATE TABLE "traffic"."crashes" (
	"id" serial PRIMARY KEY NOT NULL,
	"row_hash" text NOT NULL,
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
	"geom" geometry(point),
	CONSTRAINT "crashes_row_hash_unique" UNIQUE("row_hash")
);
--> statement-breakpoint
ALTER TABLE "cyclist_count"."edition" ADD COLUMN "geom" geometry(point) NOT NULL;--> statement-breakpoint
ALTER TABLE "traffic"."crashes" ADD CONSTRAINT "crashes_street_id_pref_street_names_id_fk" FOREIGN KEY ("street_id") REFERENCES "streets"."pref_street_names"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pref_street_rua_bairro_unique" ON "streets"."pref_street_names" USING btree ("codlogradouro","codbairro");