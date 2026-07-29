CREATE TABLE "saved_places" (
  "id" uuid PRIMARY KEY NOT NULL,
  "trip_id" uuid NOT NULL,
  "place_id" uuid NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  CONSTRAINT "saved_places_trip_id_trips_id_fk"
    FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id")
    ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "saved_places_place_id_places_id_fk"
    FOREIGN KEY ("place_id") REFERENCES "public"."places"("id")
    ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX "saved_places_trip_place_unique"
  ON "saved_places" USING btree ("trip_id", "place_id");
