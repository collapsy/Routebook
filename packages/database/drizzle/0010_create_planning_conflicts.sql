CREATE TABLE "planning_conflicts" (
  "id" uuid PRIMARY KEY NOT NULL,
  "trip_id" uuid NOT NULL,
  "type" varchar(64) NOT NULL,
  "severity" varchar(24) NOT NULL,
  "state" varchar(24) NOT NULL,
  "context_snapshot" jsonb NOT NULL,
  "evidence" jsonb NOT NULL,
  "related_day_ids" jsonb NOT NULL,
  "related_activity_ids" jsonb NOT NULL,
  "detected_at" timestamp with time zone NOT NULL,
  "policy_version" varchar(80) NOT NULL,
  "context_fingerprint" varchar(64) NOT NULL,
  "lineage_key" varchar(64) NOT NULL,
  "invalidated_at" timestamp with time zone,
  "superseded_at" timestamp with time zone,
  "superseded_by_planning_conflict_id" uuid,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "planning_conflicts_type_check" CHECK (
    "type" IN (
      'activity-time-overlap',
      'activity-outside-trip-period',
      'activity-day-mismatch',
      'invalid-activity-interval',
      'day-overloaded'
    )
  ),
  CONSTRAINT "planning_conflicts_severity_check" CHECK (
    "severity" IN ('warning', 'critical')
  ),
  CONSTRAINT "planning_conflicts_state_check" CHECK (
    "state" IN ('detected', 'invalidated', 'superseded')
  )
);
--> statement-breakpoint
ALTER TABLE "planning_conflicts"
ADD CONSTRAINT "planning_conflicts_trip_id_trips_id_fk"
FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id")
ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "planning_conflicts"
ADD CONSTRAINT "planning_conflicts_superseded_by_fk"
FOREIGN KEY ("superseded_by_planning_conflict_id")
REFERENCES "public"."planning_conflicts"("id")
ON DELETE SET NULL ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE UNIQUE INDEX "planning_conflicts_active_equivalent_unique"
ON "planning_conflicts" USING btree (
  "trip_id",
  "type",
  "context_fingerprint"
)
WHERE "state" = 'detected';
--> statement-breakpoint
CREATE INDEX "planning_conflicts_trip_state_idx"
ON "planning_conflicts" USING btree ("trip_id", "state");
--> statement-breakpoint
CREATE INDEX "planning_conflicts_trip_lineage_idx"
ON "planning_conflicts" USING btree ("trip_id", "lineage_key");
