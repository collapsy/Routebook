ALTER TABLE "decisions"
DROP CONSTRAINT "decisions_type_check";
--> statement-breakpoint
ALTER TABLE "decisions"
ADD CONSTRAINT "decisions_type_check"
CHECK ("type" IN ('save-place', 'add-to-itinerary', 'ignore-planning-risk'));
--> statement-breakpoint
DROP INDEX "planning_conflicts_active_equivalent_unique";
--> statement-breakpoint
ALTER TABLE "planning_conflicts"
DROP CONSTRAINT "planning_conflicts_state_check";
--> statement-breakpoint
ALTER TABLE "planning_conflicts"
ADD COLUMN "ignored_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "planning_conflicts"
ADD COLUMN "ignored_decision_id" uuid;
--> statement-breakpoint
ALTER TABLE "planning_conflicts"
ADD CONSTRAINT "planning_conflicts_ignored_decision_id_decisions_id_fk"
FOREIGN KEY ("ignored_decision_id") REFERENCES "public"."decisions"("id")
ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "planning_conflicts"
ADD CONSTRAINT "planning_conflicts_state_check"
CHECK ("state" IN ('open', 'ignored', 'invalidated', 'superseded'));
--> statement-breakpoint
ALTER TABLE "planning_conflicts"
ADD CONSTRAINT "planning_conflicts_lifecycle_metadata_check"
CHECK (
  (
    "state" = 'open'
    AND "ignored_at" IS NULL
    AND "ignored_decision_id" IS NULL
    AND "invalidated_at" IS NULL
    AND "superseded_at" IS NULL
    AND "superseded_by_planning_conflict_id" IS NULL
  )
  OR (
    "state" = 'ignored'
    AND "ignored_at" IS NOT NULL
    AND "ignored_decision_id" IS NOT NULL
    AND "invalidated_at" IS NULL
    AND "superseded_at" IS NULL
    AND "superseded_by_planning_conflict_id" IS NULL
  )
  OR (
    "state" = 'invalidated'
    AND "invalidated_at" IS NOT NULL
    AND "superseded_at" IS NULL
    AND "superseded_by_planning_conflict_id" IS NULL
    AND (
      ("ignored_at" IS NULL AND "ignored_decision_id" IS NULL)
      OR ("ignored_at" IS NOT NULL AND "ignored_decision_id" IS NOT NULL)
    )
  )
  OR (
    "state" = 'superseded'
    AND "invalidated_at" IS NULL
    AND "superseded_at" IS NOT NULL
    AND "superseded_by_planning_conflict_id" IS NOT NULL
    AND (
      ("ignored_at" IS NULL AND "ignored_decision_id" IS NULL)
      OR ("ignored_at" IS NOT NULL AND "ignored_decision_id" IS NOT NULL)
    )
  )
);
--> statement-breakpoint
CREATE UNIQUE INDEX "planning_conflicts_active_equivalent_unique"
ON "planning_conflicts" USING btree (
  "trip_id",
  "type",
  "context_fingerprint"
)
WHERE "state" IN ('open', 'ignored');
--> statement-breakpoint
CREATE UNIQUE INDEX "planning_conflicts_ignored_decision_unique"
ON "planning_conflicts" USING btree ("ignored_decision_id")
WHERE "ignored_decision_id" IS NOT NULL;
