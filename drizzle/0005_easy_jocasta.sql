CREATE TABLE IF NOT EXISTS "dispense_job_breakdown" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dispense_job_id" uuid NOT NULL,
	"cassette_id" uuid NOT NULL,
	"dispense_amount" double precision NOT NULL,
	"dispensed_amount" double precision,
	"status" "dispense_job_status" DEFAULT 'pending',
	"error_message" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dispense_job_breakdown" ADD CONSTRAINT "dispense_job_breakdown_dispense_job_id_dispense_jobs_id_fk" FOREIGN KEY ("dispense_job_id") REFERENCES "public"."dispense_jobs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
