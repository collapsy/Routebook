DROP INDEX "planning_conflicts_active_equivalent_unique";
--> statement-breakpoint
ALTER TABLE "planning_conflicts"
DROP CONSTRAINT "planning_conflicts_severity_check";
--> statement-breakpoint
ALTER TABLE "planning_conflicts"
DROP CONSTRAINT "planning_conflicts_state_check";
--> statement-breakpoint
UPDATE "planning_conflicts"
SET "severity" = CASE
  WHEN "severity" = 'critical' THEN 'error'
  WHEN "severity" = 'warning' THEN 'risk'
  ELSE "severity"
END
WHERE "severity" IN ('critical', 'warning');
--> statement-breakpoint
UPDATE "planning_conflicts"
SET "state" = 'open'
WHERE "state" = 'detected';
--> statement-breakpoint
ALTER TABLE "planning_conflicts"
ADD CONSTRAINT "planning_conflicts_severity_check"
CHECK ("severity" IN ('error', 'risk', 'suggestion'));
--> statement-breakpoint
ALTER TABLE "planning_conflicts"
ADD CONSTRAINT "planning_conflicts_state_check"
CHECK ("state" IN ('open', 'invalidated', 'superseded'));
--> statement-breakpoint
CREATE UNIQUE INDEX "planning_conflicts_active_equivalent_unique"
ON "planning_conflicts" USING btree (
  "trip_id",
  "type",
  "context_fingerprint"
)
WHERE "state" = 'open';
