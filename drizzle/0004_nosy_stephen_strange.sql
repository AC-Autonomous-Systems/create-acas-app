DO $$ BEGIN
 CREATE TYPE "public"."user_roles_enum" AS ENUM('admin', 'user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "dispense_job_status" ADD VALUE 'cancelled';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"profile_picture_url" text,
	"role" "user_roles_enum" DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_email_unique_index" ON "users_table" ("email");