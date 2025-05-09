CREATE SCHEMA "cyclist_count";
--> statement-breakpoint
CREATE SCHEMA "cyclist_infra";
--> statement-breakpoint
CREATE SCHEMA "streets";
--> statement-breakpoint
CREATE SCHEMA "traffic_casualties";
--> statement-breakpoint
CREATE SCHEMA "global";
--> statement-breakpoint
CREATE TABLE "cyclist_count"."characteristics" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar NOT NULL,
	"atribute" varchar
);
--> statement-breakpoint
CREATE TABLE "cyclist_count"."characteristics_count" (
	"id" integer PRIMARY KEY NOT NULL,
	"session_id" integer,
	"characteristics_id" integer,
	"count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cyclist_count"."edition" (
	"id" integer PRIMARY KEY NOT NULL,
	"city_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"date" date NOT NULL,
	"geom" geometry(point) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cyclist_count"."session" (
	"id" integer PRIMARY KEY NOT NULL,
	"edition_id" integer NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cyclist_count"."direction_count" (
	"id" integer PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"direction_id" integer NOT NULL,
	"count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cyclist_count"."directions" (
	"id" integer PRIMARY KEY NOT NULL,
	"origin" varchar NOT NULL,
	"origin_cardinal" varchar NOT NULL,
	"destin" varchar NOT NULL,
	"destin_cardinal" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cyclist_infra"."relation_cities" (
	"relation_id" integer,
	"cities_id" integer
);
--> statement-breakpoint
CREATE TABLE "cyclist_infra"."relations" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar,
	"pdc_ref" varchar,
	"pdc_notes" varchar,
	"pdc_typology" varchar,
	"pdc_km" real,
	"pdc_stretch" varchar,
	"pdc_cities" varchar,
	"osm_id" integer,
	"notes" varchar
);
--> statement-breakpoint
CREATE TABLE "cyclist_infra"."ways" (
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
	"contador" integer,
	"tipobito" varchar(1),
	"dtobito" date NOT NULL,
	"horaobito" varchar(5),
	"natural" varchar(3),
	"codmunnat" integer,
	"dtnasc" date,
	"idade" integer,
	"sexo" varchar(1),
	"racacor" varchar(1),
	"estciv" varchar(1),
	"esc2010" varchar(1),
	"seriescfal" varchar,
	"ocup" varchar(6),
	"codmunres" integer,
	"lococor" varchar(1),
	"codmunocor" integer,
	"linhaa" varchar(20),
	"linhab" varchar(20),
	"linhac" varchar(20),
	"linhad" varchar(20),
	"linhaii" varchar(45),
	"circobito" varchar(1),
	"acidtrab" varchar(1),
	"fonte" varchar(1),
	"origem" varchar(1),
	"esc" varchar(1),
	"exame" varchar(1),
	"cirurgia" varchar(1),
	"dtinvestig" date,
	"causabas_o" varchar(4),
	"causabas" varchar(4),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "global"."cities" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"state" varchar(2) NOT NULL,
	"full_state" varchar NOT NULL,
	"rmr" boolean,
	"geom" geometry(point)
);
--> statement-breakpoint
ALTER TABLE "cyclist_count"."characteristics_count" ADD CONSTRAINT "characteristics_count_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "cyclist_count"."session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cyclist_count"."characteristics_count" ADD CONSTRAINT "characteristics_count_characteristics_id_characteristics_id_fk" FOREIGN KEY ("characteristics_id") REFERENCES "cyclist_count"."characteristics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cyclist_count"."edition" ADD CONSTRAINT "edition_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "global"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cyclist_count"."session" ADD CONSTRAINT "session_edition_id_edition_id_fk" FOREIGN KEY ("edition_id") REFERENCES "cyclist_count"."edition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cyclist_count"."direction_count" ADD CONSTRAINT "direction_count_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "cyclist_count"."session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cyclist_count"."direction_count" ADD CONSTRAINT "direction_count_direction_id_directions_id_fk" FOREIGN KEY ("direction_id") REFERENCES "cyclist_count"."directions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cyclist_infra"."relation_cities" ADD CONSTRAINT "relation_cities_relation_id_relations_id_fk" FOREIGN KEY ("relation_id") REFERENCES "cyclist_infra"."relations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cyclist_infra"."relation_cities" ADD CONSTRAINT "relation_cities_cities_id_cities_id_fk" FOREIGN KEY ("cities_id") REFERENCES "global"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cyclist_infra"."ways" ADD CONSTRAINT "ways_relation_id_relations_id_fk" FOREIGN KEY ("relation_id") REFERENCES "cyclist_infra"."relations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traffic_casualties"."cttu_crashes" ADD CONSTRAINT "cttu_crashes_street_id_pref_street_names_id_fk" FOREIGN KEY ("street_id") REFERENCES "streets"."pref_street_names"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traffic_casualties"."traffic_datasus_deaths" ADD CONSTRAINT "traffic_datasus_deaths_codmunnat_cities_id_fk" FOREIGN KEY ("codmunnat") REFERENCES "global"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traffic_casualties"."traffic_datasus_deaths" ADD CONSTRAINT "traffic_datasus_deaths_codmunres_cities_id_fk" FOREIGN KEY ("codmunres") REFERENCES "global"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traffic_casualties"."traffic_datasus_deaths" ADD CONSTRAINT "traffic_datasus_deaths_codmunocor_cities_id_fk" FOREIGN KEY ("codmunocor") REFERENCES "global"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pref_street_rua_bairro_unique" ON "streets"."pref_street_names" USING btree ("codlogradouro","codbairro");--> statement-breakpoint
CREATE UNIQUE INDEX "datasus_deaths_contador_unique" ON "traffic_casualties"."traffic_datasus_deaths" USING btree ("contador","dtobito");