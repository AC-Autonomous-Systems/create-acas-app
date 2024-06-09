ALTER TABLE "dispense_job_breakdown" RENAME COLUMN "cassette_id" TO "casette_id";--> statement-breakpoint
ALTER TABLE "dispense_job_breakdown" ALTER COLUMN "casette_id" SET DATA TYPE text;