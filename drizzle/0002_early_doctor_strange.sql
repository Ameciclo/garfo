CREATE SCHEMA "streets";
--> statement-breakpoint
CREATE SCHEMA "traffic_casualties";
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
CREATE TABLE "traffic_casualties"."cttu_crashes" (
	"id" serial PRIMARY KEY NOT NULL,
	"row_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"street_id" integer,
	"data" date NOT NULL,
	"hora" time NOT NULL,
	"natureza" varchar(50),
	"situacao" varchar(50),
	"tipo" varchar(80),
	"descricao" text,
	"bairro" varchar(60),
	"endereco" text,
	"numero" varchar(15),
	"endereco_cruzamento" text,
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
	CONSTRAINT "cttu_crashes_row_hash_unique" UNIQUE("row_hash")
);
--> statement-breakpoint
CREATE TABLE "traffic_casualties"."traffic_datasus_deaths" (
	"id" serial PRIMARY KEY NOT NULL,
	"contador" integer NOT NULL,
	"origem" varchar(1),
	"tipo_bito" varchar(1),
	"dtobito" date NOT NULL,
	"horaobito" varchar(6),
	"natural" varchar(3),
	"lococor" varchar(50),
	"circo_bito" varchar(3),
	"dtnasc" date,
	"idade" integer,
	"sexo" varchar(1),
	"racacor" varchar(1),
	"estciv" varchar(2),
	"esc2010" varchar(2),
	"seriescfal" varchar(4),
	"ocup" varchar(10),
	"codmunocor" integer,
	"codmunres" integer,
	"acidtrab" varchar(1),
	"dtinvest" date,
	"fonte" varchar(20),
	"linhaa" varchar(10),
	"linhab" varchar(10),
	"linhac" varchar(10),
	"linhad" varchar(10),
	"linhaii" varchar(10),
	"causa_bas" varchar(7),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "cyclist_count"."edition" ADD COLUMN "geom" geometry(point) NOT NULL;--> statement-breakpoint
ALTER TABLE "traffic_casualties"."cttu_crashes" ADD CONSTRAINT "cttu_crashes_street_id_pref_street_names_id_fk" FOREIGN KEY ("street_id") REFERENCES "streets"."pref_street_names"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traffic_casualties"."traffic_datasus_deaths" ADD CONSTRAINT "traffic_datasus_deaths_codmunocor_cities_id_fk" FOREIGN KEY ("codmunocor") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traffic_casualties"."traffic_datasus_deaths" ADD CONSTRAINT "traffic_datasus_deaths_codmunres_cities_id_fk" FOREIGN KEY ("codmunres") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pref_street_rua_bairro_unique" ON "streets"."pref_street_names" USING btree ("codlogradouro","codbairro");--> statement-breakpoint
CREATE UNIQUE INDEX "datasus_deaths_contador_unique" ON "traffic_casualties"."traffic_datasus_deaths" USING btree ("contador","dtobito");