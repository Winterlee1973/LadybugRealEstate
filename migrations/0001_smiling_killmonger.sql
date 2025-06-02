CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"role" text DEFAULT 'buyer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "favorites" ALTER COLUMN "property_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "searchable_id" text;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;