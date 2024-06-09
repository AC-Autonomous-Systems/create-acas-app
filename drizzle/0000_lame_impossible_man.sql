DO $$ BEGIN
 CREATE TYPE "dispense_job_status" AS ENUM('pending', 'dispensed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dispense_jobs" (
	"id" uuid,
	"created_at" timestamp DEFAULT now(),
	"dispensed_at" timestamp,
	"status" "dispense_job_status" DEFAULT 'pending'
);
