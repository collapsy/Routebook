CREATE TABLE "itinerary_proposals" (
  "id" uuid PRIMARY KEY NOT NULL,
  "trip_id" uuid NOT NULL,
  "itinerary_id" uuid NOT NULL,
  "base_trip_context_version" integer NOT NULL,
  "base_itinerary_version" integer NOT NULL,
  "context_snapshot_id" varchar(160) NOT NULL,
  "status" varchar(24) NOT NULL,
  "requested_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "generation_started_at" timestamp with time zone,
  "failed_at" timestamp with time zone,
  "failure_code" varchar(160),
  "cancelled_at" timestamp with time zone,
  CONSTRAINT "itinerary_proposals_status_check"
    CHECK ("status" IN ('requested', 'generating', 'failed', 'cancelled')),
  CONSTRAINT "itinerary_proposals_versions_check"
    CHECK ("base_trip_context_version" > 0 AND "base_itinerary_version" > 0),
  CONSTRAINT "itinerary_proposals_lifecycle_check"
    CHECK (
      ("status" = 'requested' AND "generation_started_at" IS NULL AND "failed_at" IS NULL AND "failure_code" IS NULL AND "cancelled_at" IS NULL AND "updated_at" = "requested_at")
      OR ("status" = 'generating' AND "generation_started_at" IS NOT NULL AND "failed_at" IS NULL AND "failure_code" IS NULL AND "cancelled_at" IS NULL AND "updated_at" = "generation_started_at")
      OR ("status" = 'failed' AND "generation_started_at" IS NOT NULL AND "failed_at" IS NOT NULL AND "failure_code" IS NOT NULL AND "cancelled_at" IS NULL AND "updated_at" = "failed_at")
      OR ("status" = 'cancelled' AND "failed_at" IS NULL AND "failure_code" IS NULL AND "cancelled_at" IS NOT NULL AND "updated_at" = "cancelled_at")
    ),
  CONSTRAINT "itinerary_proposals_timeline_check"
    CHECK (
      "updated_at" >= "requested_at"
      AND ("generation_started_at" IS NULL OR "generation_started_at" >= "requested_at")
      AND ("failed_at" IS NULL OR "failed_at" >= "generation_started_at")
      AND ("cancelled_at" IS NULL OR "cancelled_at" >= COALESCE("generation_started_at", "requested_at"))
    )
);
--> statement-breakpoint
ALTER TABLE "itinerary_proposals"
ADD CONSTRAINT "itinerary_proposals_trip_id_trips_id_fk"
FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id")
ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "itinerary_proposals"
ADD CONSTRAINT "itinerary_proposals_itinerary_id_itineraries_id_fk"
FOREIGN KEY ("itinerary_id") REFERENCES "public"."itineraries"("id")
ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE INDEX "itinerary_proposals_trip_requested_idx"
ON "itinerary_proposals" USING btree ("trip_id", "requested_at", "id");
--> statement-breakpoint
CREATE INDEX "itinerary_proposals_trip_status_idx"
ON "itinerary_proposals" USING btree ("trip_id", "status");
