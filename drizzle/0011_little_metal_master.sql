ALTER TABLE "dispense_job_breakdown" RENAME COLUMN "dispensed_amount" TO "dispensed_count";--> statement-breakpoint
ALTER TABLE "dispense_job_breakdown" ALTER COLUMN "dispensed_count" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "dispense_job_breakdown" ALTER COLUMN "dispensed_count" SET NOT NULL;