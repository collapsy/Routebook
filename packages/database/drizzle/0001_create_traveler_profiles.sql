CREATE TABLE IF NOT EXISTS "traveler_profiles" (
  "id" uuid PRIMARY KEY,
  "trip_id" uuid NOT NULL REFERENCES "trips"("id") ON DELETE CASCADE,
  "traveler_count" integer NOT NULL,
  "interests" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "pace" varchar(24),
  "transport_preference" varchar(32),
  "budget_total_cents" integer,
  "budget_currency" varchar(3),
  "version" integer NOT NULL,
  "created_at" timestamptz NOT NULL,
  "updated_at" timestamptz NOT NULL,
  CONSTRAINT "traveler_profiles_traveler_count_check" CHECK ("traveler_count" BETWEEN 1 AND 20),
  CONSTRAINT "traveler_profiles_version_check" CHECK ("version" > 0),
  CONSTRAINT "traveler_profiles_budget_check" CHECK (
    ("budget_total_cents" IS NULL AND "budget_currency" IS NULL)
    OR ("budget_total_cents" > 0 AND "budget_currency" = 'BRL')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS "traveler_profiles_trip_id_unique"
  ON "traveler_profiles" ("trip_id");
