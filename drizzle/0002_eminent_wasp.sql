ALTER TABLE "dispense_jobs" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "dispense_jobs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "dispense_jobs" ALTER COLUMN "id" SET NOT NULL;