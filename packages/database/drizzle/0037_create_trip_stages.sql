CREATE TABLE IF NOT EXISTS "trip_stages" (
  "id" uuid PRIMARY KEY NOT NULL,
  "trip_id" uuid NOT NULL REFERENCES "trips"("id") ON DELETE CASCADE,
  "destination_name" varchar(180) NOT NULL,
  "destination_type" varchar(32) NOT NULL,
  "country_code" varchar(2) NOT NULL,
  "latitude" double precision NOT NULL,
  "longitude" double precision NOT NULL,
  "time_zone" varchar(64) NOT NULL,
  "destination_provenance" jsonb NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  CONSTRAINT "trip_stages_date_order" CHECK ("end_date" >= "start_date"),
  CONSTRAINT "trip_stages_latitude_range" CHECK ("latitude" BETWEEN -90 AND 90),
  CONSTRAINT "trip_stages_longitude_range" CHECK ("longitude" BETWEEN -180 AND 180)
);
CREATE INDEX IF NOT EXISTS "trip_stages_trip_dates_idx" ON "trip_stages" ("trip_id", "start_date", "end_date");
