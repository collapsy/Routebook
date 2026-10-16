ALTER TABLE "trip_stages" ADD COLUMN IF NOT EXISTS "accommodation_name" varchar(180);
ALTER TABLE "trip_stages" ADD COLUMN IF NOT EXISTS "accommodation_address" text;
ALTER TABLE "trip_stages" ADD COLUMN IF NOT EXISTS "accommodation_latitude" double precision;
ALTER TABLE "trip_stages" ADD COLUMN IF NOT EXISTS "accommodation_longitude" double precision;
ALTER TABLE "trip_stages" ADD CONSTRAINT "trip_stages_accommodation_requires_name"
  CHECK ("accommodation_name" IS NOT NULL OR ("accommodation_address" IS NULL AND "accommodation_latitude" IS NULL AND "accommodation_longitude" IS NULL));
ALTER TABLE "trip_stages" ADD CONSTRAINT "trip_stages_accommodation_coordinates_pair"
  CHECK (("accommodation_latitude" IS NULL) = ("accommodation_longitude" IS NULL));
ALTER TABLE "trip_stages" ADD CONSTRAINT "trip_stages_accommodation_latitude_range"
  CHECK ("accommodation_latitude" IS NULL OR "accommodation_latitude" BETWEEN -90 AND 90);
ALTER TABLE "trip_stages" ADD CONSTRAINT "trip_stages_accommodation_longitude_range"
  CHECK ("accommodation_longitude" IS NULL OR "accommodation_longitude" BETWEEN -180 AND 180);
