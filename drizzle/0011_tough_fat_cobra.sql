ALTER TABLE "casualties"."samu_calls" ADD COLUMN "row_hash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "casualties"."samu_calls" ADD CONSTRAINT "samu_calls_row_hash_unique" UNIQUE("row_hash");