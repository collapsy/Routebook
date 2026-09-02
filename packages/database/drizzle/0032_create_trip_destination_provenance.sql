CREATE TABLE "trip_destination_provenance" (
  "id" uuid PRIMARY KEY NOT NULL,
  "trip_id" uuid NOT NULL,
  "provider" varchar(80) NOT NULL,
  "external_reference" varchar(240) NOT NULL,
  "source_license" text NOT NULL,
  "source_url" text,
  "collected_at" timestamp with time zone NOT NULL,
  "method" varchar(120) NOT NULL,
  "confidence_level" varchar(16) NOT NULL,
  "metadata" jsonb NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  CONSTRAINT "trip_destination_provenance_trip_id_trips_id_fk"
    FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "trip_destination_provenance_trip_id_idx"
  ON "trip_destination_provenance" USING btree ("trip_id");
