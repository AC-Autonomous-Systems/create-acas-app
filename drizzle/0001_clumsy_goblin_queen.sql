ALTER TYPE "dispense_job_status" ADD VALUE 'dispensing';--> statement-breakpoint
ALTER TABLE "dispense_jobs" ADD COLUMN "dispense_amount" double precision NOT NULL;