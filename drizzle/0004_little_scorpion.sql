ALTER TABLE "casualties"."datasus_deaths" RENAME COLUMN "codmunnat" TO "codmunnatu";--> statement-breakpoint
ALTER TABLE "casualties"."datasus_deaths" DROP CONSTRAINT "datasus_deaths_codmunnat_cities_id_fk";
--> statement-breakpoint
ALTER TABLE "casualties"."datasus_deaths" ADD CONSTRAINT "datasus_deaths_codmunnatu_cities_id_fk" FOREIGN KEY ("codmunnatu") REFERENCES "global"."cities"("id") ON DELETE no action ON UPDATE no action;