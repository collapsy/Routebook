import { sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

import { trips } from "./schema";

export const planningConflicts = pgTable(
  "planning_conflicts",
  {
    id: uuid("id").primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 64 }).notNull(),
    severity: varchar("severity", { length: 24 }).notNull(),
    state: varchar("state", { length: 24 }).notNull(),
    contextSnapshot: jsonb("context_snapshot").notNull(),
    evidence: jsonb("evidence").notNull(),
    relatedDayIds: jsonb("related_day_ids").notNull(),
    relatedActivityIds: jsonb("related_activity_ids").notNull(),
    detectedAt: timestamp("detected_at", { withTimezone: true, mode: "date" }).notNull(),
    policyVersion: varchar("policy_version", { length: 80 }).notNull(),
    contextFingerprint: varchar("context_fingerprint", { length: 64 }).notNull(),
    lineageKey: varchar("lineage_key", { length: 64 }).notNull(),
    invalidatedAt: timestamp("invalidated_at", { withTimezone: true, mode: "date" }),
    supersededAt: timestamp("superseded_at", { withTimezone: true, mode: "date" }),
    supersededByPlanningConflictId: uuid("superseded_by_planning_conflict_id").references(
      (): AnyPgColumn => planningConflicts.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    check(
      "planning_conflicts_type_check",
      sql`${table.type} in ('activity-time-overlap', 'activity-outside-trip-period', 'activity-day-mismatch', 'invalid-activity-interval', 'day-overloaded')`,
    ),
    check("planning_conflicts_severity_check", sql`${table.severity} in ('warning', 'critical')`),
    check(
      "planning_conflicts_state_check",
      sql`${table.state} in ('detected', 'invalidated', 'superseded')`,
    ),
    uniqueIndex("planning_conflicts_active_equivalent_unique")
      .on(table.tripId, table.type, table.contextFingerprint)
      .where(sql`${table.state} = 'detected'`),
    index("planning_conflicts_trip_state_idx").on(table.tripId, table.state),
    index("planning_conflicts_trip_lineage_idx").on(table.tripId, table.lineageKey),
  ],
);
