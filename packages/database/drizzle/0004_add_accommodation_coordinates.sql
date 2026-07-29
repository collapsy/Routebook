ALTER TABLE "trips" ADD COLUMN "accommodation_latitude" double precision;
--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "accommodation_longitude" double precision;
--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_accommodation_coordinates_complete" CHECK (("accommodation_latitude" IS NULL AND "accommodation_longitude" IS NULL) OR ("accommodation_latitude" IS NOT NULL AND "accommodation_longitude" IS NOT NULL));
