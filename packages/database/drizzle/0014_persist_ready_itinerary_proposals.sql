ALTER TABLE "itinerary_proposals" DROP CONSTRAINT "itinerary_proposals_status_check";
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" DROP CONSTRAINT "itinerary_proposals_lifecycle_check";
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" DROP CONSTRAINT "itinerary_proposals_timeline_check";
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD COLUMN "generation_method" varchar(64);
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD COLUMN "generation_version" varchar(80);
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD COLUMN "content_schema_version" integer;
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD COLUMN "criteria" jsonb;
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD COLUMN "justifications" jsonb;
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD COLUMN "limitations" jsonb;
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD COLUMN "planning_conflict_ids" jsonb;
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD COLUMN "generated_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD COLUMN "valid_until" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD CONSTRAINT "itinerary_proposals_status_check"
CHECK ("status" IN ('requested', 'generating', 'ready', 'failed', 'cancelled'));
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD CONSTRAINT "itinerary_proposals_lifecycle_check"
CHECK (
  ("status" = 'requested' AND "generation_started_at" IS NULL AND "generation_method" IS NULL AND "generation_version" IS NULL AND "content_schema_version" IS NULL AND "criteria" IS NULL AND "justifications" IS NULL AND "limitations" IS NULL AND "planning_conflict_ids" IS NULL AND "generated_at" IS NULL AND "valid_until" IS NULL AND "failed_at" IS NULL AND "failure_code" IS NULL AND "cancelled_at" IS NULL AND "updated_at" = "requested_at")
  OR ("status" = 'generating' AND "generation_started_at" IS NOT NULL AND "generation_method" IS NULL AND "generation_version" IS NULL AND "content_schema_version" IS NULL AND "criteria" IS NULL AND "justifications" IS NULL AND "limitations" IS NULL AND "planning_conflict_ids" IS NULL AND "generated_at" IS NULL AND "valid_until" IS NULL AND "failed_at" IS NULL AND "failure_code" IS NULL AND "cancelled_at" IS NULL AND "updated_at" = "generation_started_at")
  OR ("status" = 'ready' AND "generation_started_at" IS NOT NULL AND "generation_method" IS NOT NULL AND "generation_version" IS NOT NULL AND "content_schema_version" = 1 AND "criteria" IS NOT NULL AND "justifications" IS NOT NULL AND "limitations" IS NOT NULL AND "planning_conflict_ids" IS NOT NULL AND "generated_at" IS NOT NULL AND "valid_until" IS NOT NULL AND "failed_at" IS NULL AND "failure_code" IS NULL AND "cancelled_at" IS NULL AND "updated_at" = "generated_at")
  OR ("status" = 'failed' AND "generation_started_at" IS NOT NULL AND "generation_method" IS NULL AND "generation_version" IS NULL AND "content_schema_version" IS NULL AND "criteria" IS NULL AND "justifications" IS NULL AND "limitations" IS NULL AND "planning_conflict_ids" IS NULL AND "generated_at" IS NULL AND "valid_until" IS NULL AND "failed_at" IS NOT NULL AND "failure_code" IS NOT NULL AND "cancelled_at" IS NULL AND "updated_at" = "failed_at")
  OR ("status" = 'cancelled' AND "generation_method" IS NULL AND "generation_version" IS NULL AND "content_schema_version" IS NULL AND "criteria" IS NULL AND "justifications" IS NULL AND "limitations" IS NULL AND "planning_conflict_ids" IS NULL AND "generated_at" IS NULL AND "valid_until" IS NULL AND "failed_at" IS NULL AND "failure_code" IS NULL AND "cancelled_at" IS NOT NULL AND "updated_at" = "cancelled_at")
);
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD CONSTRAINT "itinerary_proposals_content_shape_check"
CHECK (
  "status" <> 'ready'
  OR (
    jsonb_typeof("criteria") = 'array'
    AND jsonb_array_length("criteria") > 0
    AND jsonb_typeof("justifications") = 'array'
    AND jsonb_array_length("justifications") > 0
    AND jsonb_typeof("limitations") = 'array'
    AND jsonb_typeof("planning_conflict_ids") = 'array'
  )
);
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD CONSTRAINT "itinerary_proposals_timeline_check"
CHECK (
  "updated_at" >= "requested_at"
  AND ("generation_started_at" IS NULL OR "generation_started_at" >= "requested_at")
  AND ("generated_at" IS NULL OR "generated_at" >= "generation_started_at")
  AND ("valid_until" IS NULL OR "valid_until" >= "generated_at")
  AND ("failed_at" IS NULL OR "failed_at" >= "generation_started_at")
  AND ("cancelled_at" IS NULL OR "cancelled_at" >= COALESCE("generation_started_at", "requested_at"))
);
--> statement-breakpoint
CREATE TABLE "proposed_activities" (
  "id" uuid PRIMARY KEY NOT NULL,
  "itinerary_proposal_id" uuid NOT NULL,
  "target_trip_day_id" uuid,
  "source_activity_id" uuid,
  "place_id" uuid,
  "title" varchar(220) NOT NULL,
  "description" text,
  "proposed_start_time" time,
  "duration_minutes" integer,
  "proposed_order" integer,
  "operation_type" varchar(32) NOT NULL,
  "flexibility" varchar(32),
  "estimated_cost_amount" numeric(19,4),
  "estimated_cost_currency" char(3),
  "reason" text,
  CONSTRAINT "proposed_activities_operation_type_check" CHECK ("operation_type" IN ('add', 'move', 'update', 'remove')),
  CONSTRAINT "proposed_activities_duration_check" CHECK ("duration_minutes" IS NULL OR "duration_minutes" > 0),
  CONSTRAINT "proposed_activities_order_check" CHECK ("proposed_order" IS NULL OR "proposed_order" >= 0),
  CONSTRAINT "proposed_activities_cost_check" CHECK ("estimated_cost_amount" IS NULL OR "estimated_cost_amount" >= 0),
  CONSTRAINT "proposed_activities_currency_check" CHECK ("estimated_cost_currency" IS NULL OR "estimated_cost_currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
ALTER TABLE "proposed_activities" ADD CONSTRAINT "proposed_activities_itinerary_proposal_id_itinerary_proposals_id_fk"
FOREIGN KEY ("itinerary_proposal_id") REFERENCES "public"."itinerary_proposals"("id")
ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE INDEX "proposed_activities_proposal_order_idx"
ON "proposed_activities" USING btree ("itinerary_proposal_id", "proposed_order", "id");
