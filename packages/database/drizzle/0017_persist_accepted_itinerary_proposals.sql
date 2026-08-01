ALTER TABLE "itinerary_proposals" DROP CONSTRAINT "itinerary_proposals_status_check";
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" DROP CONSTRAINT "itinerary_proposals_lifecycle_check";
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" DROP CONSTRAINT "itinerary_proposals_content_shape_check";
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" DROP CONSTRAINT "itinerary_proposals_timeline_check";
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD COLUMN "accepted_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD CONSTRAINT "itinerary_proposals_status_check"
CHECK ("status" IN ('requested', 'generating', 'ready', 'accepted', 'rejected', 'expired', 'failed', 'cancelled'));
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD CONSTRAINT "itinerary_proposals_lifecycle_check"
CHECK (
  (
    ("status" = 'requested' AND "generation_started_at" IS NULL AND "generation_method" IS NULL AND "generation_version" IS NULL AND "content_schema_version" IS NULL AND "criteria" IS NULL AND "justifications" IS NULL AND "limitations" IS NULL AND "planning_conflict_ids" IS NULL AND "generated_at" IS NULL AND "valid_until" IS NULL AND "rejected_at" IS NULL AND "expired_at" IS NULL AND "failed_at" IS NULL AND "failure_code" IS NULL AND "cancelled_at" IS NULL AND "updated_at" = "requested_at")
    OR ("status" = 'generating' AND "generation_started_at" IS NOT NULL AND "generation_method" IS NULL AND "generation_version" IS NULL AND "content_schema_version" IS NULL AND "criteria" IS NULL AND "justifications" IS NULL AND "limitations" IS NULL AND "planning_conflict_ids" IS NULL AND "generated_at" IS NULL AND "valid_until" IS NULL AND "rejected_at" IS NULL AND "expired_at" IS NULL AND "failed_at" IS NULL AND "failure_code" IS NULL AND "cancelled_at" IS NULL AND "updated_at" = "generation_started_at")
    OR ("status" = 'ready' AND "generation_started_at" IS NOT NULL AND "generation_method" IS NOT NULL AND "generation_version" IS NOT NULL AND "content_schema_version" = 1 AND "criteria" IS NOT NULL AND "justifications" IS NOT NULL AND "limitations" IS NOT NULL AND "planning_conflict_ids" IS NOT NULL AND "generated_at" IS NOT NULL AND "valid_until" IS NOT NULL AND "rejected_at" IS NULL AND "expired_at" IS NULL AND "failed_at" IS NULL AND "failure_code" IS NULL AND "cancelled_at" IS NULL AND "updated_at" = "generated_at")
    OR ("status" = 'accepted' AND "generation_started_at" IS NOT NULL AND "generation_method" IS NOT NULL AND "generation_version" IS NOT NULL AND "content_schema_version" = 1 AND "criteria" IS NOT NULL AND "justifications" IS NOT NULL AND "limitations" IS NOT NULL AND "planning_conflict_ids" IS NOT NULL AND "generated_at" IS NOT NULL AND "valid_until" IS NOT NULL AND "accepted_at" IS NOT NULL AND "rejected_at" IS NULL AND "expired_at" IS NULL AND "failed_at" IS NULL AND "failure_code" IS NULL AND "cancelled_at" IS NULL AND "updated_at" = "accepted_at")
    OR ("status" = 'rejected' AND "generation_started_at" IS NOT NULL AND "generation_method" IS NOT NULL AND "generation_version" IS NOT NULL AND "content_schema_version" = 1 AND "criteria" IS NOT NULL AND "justifications" IS NOT NULL AND "limitations" IS NOT NULL AND "planning_conflict_ids" IS NOT NULL AND "generated_at" IS NOT NULL AND "valid_until" IS NOT NULL AND "rejected_at" IS NOT NULL AND "expired_at" IS NULL AND "failed_at" IS NULL AND "failure_code" IS NULL AND "cancelled_at" IS NULL AND "updated_at" = "rejected_at")
    OR ("status" = 'expired' AND "generation_started_at" IS NOT NULL AND "generation_method" IS NOT NULL AND "generation_version" IS NOT NULL AND "content_schema_version" = 1 AND "criteria" IS NOT NULL AND "justifications" IS NOT NULL AND "limitations" IS NOT NULL AND "planning_conflict_ids" IS NOT NULL AND "generated_at" IS NOT NULL AND "valid_until" IS NOT NULL AND "rejected_at" IS NULL AND "expired_at" IS NOT NULL AND "failed_at" IS NULL AND "failure_code" IS NULL AND "cancelled_at" IS NULL AND "updated_at" = "expired_at")
    OR ("status" = 'failed' AND "generation_started_at" IS NOT NULL AND "generation_method" IS NULL AND "generation_version" IS NULL AND "content_schema_version" IS NULL AND "criteria" IS NULL AND "justifications" IS NULL AND "limitations" IS NULL AND "planning_conflict_ids" IS NULL AND "generated_at" IS NULL AND "valid_until" IS NULL AND "rejected_at" IS NULL AND "expired_at" IS NULL AND "failed_at" IS NOT NULL AND "failure_code" IS NOT NULL AND "cancelled_at" IS NULL AND "updated_at" = "failed_at")
    OR ("status" = 'cancelled' AND "generation_method" IS NULL AND "generation_version" IS NULL AND "content_schema_version" IS NULL AND "criteria" IS NULL AND "justifications" IS NULL AND "limitations" IS NULL AND "planning_conflict_ids" IS NULL AND "generated_at" IS NULL AND "valid_until" IS NULL AND "rejected_at" IS NULL AND "expired_at" IS NULL AND "failed_at" IS NULL AND "failure_code" IS NULL AND "cancelled_at" IS NOT NULL AND "updated_at" = "cancelled_at")
  )
  AND ("status" = 'accepted' OR "accepted_at" IS NULL)
);
--> statement-breakpoint
ALTER TABLE "itinerary_proposals" ADD CONSTRAINT "itinerary_proposals_content_shape_check"
CHECK (
  "status" NOT IN ('ready', 'accepted', 'rejected', 'expired')
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
  AND ("accepted_at" IS NULL OR ("accepted_at" >= "generated_at" AND "accepted_at" < "valid_until"))
  AND ("rejected_at" IS NULL OR "rejected_at" >= "generated_at")
  AND ("expired_at" IS NULL OR "expired_at" >= "valid_until")
  AND ("failed_at" IS NULL OR "failed_at" >= "generation_started_at")
  AND ("cancelled_at" IS NULL OR "cancelled_at" >= COALESCE("generation_started_at", "requested_at"))
);
