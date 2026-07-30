CREATE TABLE "itineraries" (
  "id" uuid PRIMARY KEY NOT NULL,
  "trip_id" uuid NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "time_zone" varchar(64) NOT NULL,
  "version" integer NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "itineraries_trip_id_trips_id_fk"
    FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id")
    ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "itineraries_period_check" CHECK ("end_date" >= "start_date"),
  CONSTRAINT "itineraries_version_check" CHECK ("version" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "itineraries_trip_id_unique"
  ON "itineraries" USING btree ("trip_id");
--> statement-breakpoint
CREATE TABLE "itinerary_days" (
  "id" uuid PRIMARY KEY NOT NULL,
  "itinerary_id" uuid NOT NULL,
  "date" date NOT NULL,
  "position" integer NOT NULL,
  CONSTRAINT "itinerary_days_itinerary_id_itineraries_id_fk"
    FOREIGN KEY ("itinerary_id") REFERENCES "public"."itineraries"("id")
    ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "itinerary_days_position_check" CHECK ("position" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "itinerary_days_itinerary_date_unique"
  ON "itinerary_days" USING btree ("itinerary_id", "date");
--> statement-breakpoint
CREATE UNIQUE INDEX "itinerary_days_itinerary_position_unique"
  ON "itinerary_days" USING btree ("itinerary_id", "position");
--> statement-breakpoint
CREATE TABLE "itinerary_activities" (
  "id" uuid PRIMARY KEY NOT NULL,
  "itinerary_day_id" uuid NOT NULL,
  "title" varchar(180) NOT NULL,
  "type" varchar(32) NOT NULL,
  "status" varchar(32) NOT NULL,
  "flexibility" varchar(24) NOT NULL,
  "start_time" varchar(5),
  "duration_minutes" integer,
  "order" integer NOT NULL,
  "place_id" uuid,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "itinerary_activities_itinerary_day_id_itinerary_days_id_fk"
    FOREIGN KEY ("itinerary_day_id") REFERENCES "public"."itinerary_days"("id")
    ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "itinerary_activities_place_id_places_id_fk"
    FOREIGN KEY ("place_id") REFERENCES "public"."places"("id")
    ON DELETE set null ON UPDATE no action,
  CONSTRAINT "itinerary_activities_duration_check"
    CHECK ("duration_minutes" IS NULL OR "duration_minutes" > 0),
  CONSTRAINT "itinerary_activities_order_check" CHECK ("order" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "itinerary_activities_day_order_unique"
  ON "itinerary_activities" USING btree ("itinerary_day_id", "order");
