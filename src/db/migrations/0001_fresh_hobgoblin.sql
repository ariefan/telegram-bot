CREATE TABLE IF NOT EXISTS "reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"debt_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"reminder_type" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'sent' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reminders" ADD CONSTRAINT "reminders_debt_id_debts_id_fk" FOREIGN KEY ("debt_id") REFERENCES "debts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
