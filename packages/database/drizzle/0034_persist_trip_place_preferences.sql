-- RB-INC-201 — evolui Saved Places para a persistência canônica de TripPlacePreference.
ALTER TABLE "saved_places" ADD COLUMN "intent" varchar(24);
--> statement-breakpoint
ALTER TABLE "saved_places" ADD COLUMN "priority" varchar(24);
--> statement-breakpoint
ALTER TABLE "saved_places" ADD COLUMN "updated_at" timestamp with time zone;
--> statement-breakpoint
UPDATE "saved_places"
SET
  "intent" = 'WANT',
  "priority" = NULL,
  "updated_at" = "created_at";
--> statement-breakpoint
ALTER TABLE "saved_places" ALTER COLUMN "intent" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "saved_places" ALTER COLUMN "updated_at" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "saved_places"
  ADD CONSTRAINT "saved_places_intent_check"
  CHECK ("intent" IN ('WANT', 'MAYBE', 'NOT_INTERESTED'));
--> statement-breakpoint
ALTER TABLE "saved_places"
  ADD CONSTRAINT "saved_places_priority_check"
  CHECK ("priority" IS NULL OR "priority" = 'MUST_DO');
--> statement-breakpoint
ALTER TABLE "saved_places"
  ADD CONSTRAINT "saved_places_priority_intent_check"
  CHECK ("priority" IS NULL OR "intent" = 'WANT');
