import { sql } from "drizzle-orm";
import {
  char,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { itineraries, trips } from "./schema";

export const itineraryProposals = pgTable(
  "itinerary_proposals",
  {
    id: uuid("id").primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    itineraryId: uuid("itinerary_id")
      .notNull()
      .references(() => itineraries.id, { onDelete: "cascade" }),
    baseTripContextVersion: integer("base_trip_context_version").notNull(),
    baseItineraryVersion: integer("base_itinerary_version").notNull(),
    contextSnapshotId: varchar("context_snapshot_id", { length: 160 }).notNull(),
    status: varchar("status", { length: 24 }).notNull(),
    requestedAt: timestamp("requested_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
    generationStartedAt: timestamp("generation_started_at", { withTimezone: true, mode: "date" }),
    generationMethod: varchar("generation_method", { length: 64 }),
    generationVersion: varchar("generation_version", { length: 80 }),
    contentSchemaVersion: integer("content_schema_version"),
    criteria: jsonb("criteria"),
    justifications: jsonb("justifications"),
    limitations: jsonb("limitations"),
    planningConflictIds: jsonb("planning_conflict_ids"),
    generatedAt: timestamp("generated_at", { withTimezone: true, mode: "date" }),
    validUntil: timestamp("valid_until", { withTimezone: true, mode: "date" }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true, mode: "date" }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true, mode: "date" }),
    expiredAt: timestamp("expired_at", { withTimezone: true, mode: "date" }),
    failedAt: timestamp("failed_at", { withTimezone: true, mode: "date" }),
    failureCode: varchar("failure_code", { length: 160 }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    check(
      "itinerary_proposals_status_check",
      sql`${table.status} in ('requested', 'generating', 'ready', 'accepted', 'rejected', 'expired', 'failed', 'cancelled')`,
    ),
    check(
      "itinerary_proposals_versions_check",
      sql`${table.baseTripContextVersion} > 0 and ${table.baseItineraryVersion} > 0`,
    ),
    check(
      "itinerary_proposals_lifecycle_check",
      sql`(
        (${table.status} = 'requested' AND ${table.generationStartedAt} IS NULL AND ${table.generationMethod} IS NULL AND ${table.generationVersion} IS NULL AND ${table.contentSchemaVersion} IS NULL AND ${table.criteria} IS NULL AND ${table.justifications} IS NULL AND ${table.limitations} IS NULL AND ${table.planningConflictIds} IS NULL AND ${table.generatedAt} IS NULL AND ${table.validUntil} IS NULL AND ${table.rejectedAt} IS NULL AND ${table.expiredAt} IS NULL AND ${table.failedAt} IS NULL AND ${table.failureCode} IS NULL AND ${table.cancelledAt} IS NULL AND ${table.updatedAt} = ${table.requestedAt})
        OR (${table.status} = 'generating' AND ${table.generationStartedAt} IS NOT NULL AND ${table.generationMethod} IS NULL AND ${table.generationVersion} IS NULL AND ${table.contentSchemaVersion} IS NULL AND ${table.criteria} IS NULL AND ${table.justifications} IS NULL AND ${table.limitations} IS NULL AND ${table.planningConflictIds} IS NULL AND ${table.generatedAt} IS NULL AND ${table.validUntil} IS NULL AND ${table.rejectedAt} IS NULL AND ${table.expiredAt} IS NULL AND ${table.failedAt} IS NULL AND ${table.failureCode} IS NULL AND ${table.cancelledAt} IS NULL AND ${table.updatedAt} = ${table.generationStartedAt})
        OR (${table.status} = 'ready' AND ${table.generationStartedAt} IS NOT NULL AND ${table.generationMethod} IS NOT NULL AND ${table.generationVersion} IS NOT NULL AND ${table.contentSchemaVersion} = 1 AND ${table.criteria} IS NOT NULL AND ${table.justifications} IS NOT NULL AND ${table.limitations} IS NOT NULL AND ${table.planningConflictIds} IS NOT NULL AND ${table.generatedAt} IS NOT NULL AND ${table.validUntil} IS NOT NULL AND ${table.rejectedAt} IS NULL AND ${table.expiredAt} IS NULL AND ${table.failedAt} IS NULL AND ${table.failureCode} IS NULL AND ${table.cancelledAt} IS NULL AND ${table.updatedAt} = ${table.generatedAt})
        OR (${table.status} = 'accepted' AND ${table.generationStartedAt} IS NOT NULL AND ${table.generationMethod} IS NOT NULL AND ${table.generationVersion} IS NOT NULL AND ${table.contentSchemaVersion} = 1 AND ${table.criteria} IS NOT NULL AND ${table.justifications} IS NOT NULL AND ${table.limitations} IS NOT NULL AND ${table.planningConflictIds} IS NOT NULL AND ${table.generatedAt} IS NOT NULL AND ${table.validUntil} IS NOT NULL AND ${table.acceptedAt} IS NOT NULL AND ${table.rejectedAt} IS NULL AND ${table.expiredAt} IS NULL AND ${table.failedAt} IS NULL AND ${table.failureCode} IS NULL AND ${table.cancelledAt} IS NULL AND ${table.updatedAt} = ${table.acceptedAt})
        OR (${table.status} = 'rejected' AND ${table.generationStartedAt} IS NOT NULL AND ${table.generationMethod} IS NOT NULL AND ${table.generationVersion} IS NOT NULL AND ${table.contentSchemaVersion} = 1 AND ${table.criteria} IS NOT NULL AND ${table.justifications} IS NOT NULL AND ${table.limitations} IS NOT NULL AND ${table.planningConflictIds} IS NOT NULL AND ${table.generatedAt} IS NOT NULL AND ${table.validUntil} IS NOT NULL AND ${table.rejectedAt} IS NOT NULL AND ${table.expiredAt} IS NULL AND ${table.failedAt} IS NULL AND ${table.failureCode} IS NULL AND ${table.cancelledAt} IS NULL AND ${table.updatedAt} = ${table.rejectedAt})
        OR (${table.status} = 'expired' AND ${table.generationStartedAt} IS NOT NULL AND ${table.generationMethod} IS NOT NULL AND ${table.generationVersion} IS NOT NULL AND ${table.contentSchemaVersion} = 1 AND ${table.criteria} IS NOT NULL AND ${table.justifications} IS NOT NULL AND ${table.limitations} IS NOT NULL AND ${table.planningConflictIds} IS NOT NULL AND ${table.generatedAt} IS NOT NULL AND ${table.validUntil} IS NOT NULL AND ${table.rejectedAt} IS NULL AND ${table.expiredAt} IS NOT NULL AND ${table.failedAt} IS NULL AND ${table.failureCode} IS NULL AND ${table.cancelledAt} IS NULL AND ${table.updatedAt} = ${table.expiredAt})
        OR (${table.status} = 'failed' AND ${table.generationStartedAt} IS NOT NULL AND ${table.generationMethod} IS NULL AND ${table.generationVersion} IS NULL AND ${table.contentSchemaVersion} IS NULL AND ${table.criteria} IS NULL AND ${table.justifications} IS NULL AND ${table.limitations} IS NULL AND ${table.planningConflictIds} IS NULL AND ${table.generatedAt} IS NULL AND ${table.validUntil} IS NULL AND ${table.rejectedAt} IS NULL AND ${table.expiredAt} IS NULL AND ${table.failedAt} IS NOT NULL AND ${table.failureCode} IS NOT NULL AND ${table.cancelledAt} IS NULL AND ${table.updatedAt} = ${table.failedAt})
        OR (${table.status} = 'cancelled' AND ${table.generationMethod} IS NULL AND ${table.generationVersion} IS NULL AND ${table.contentSchemaVersion} IS NULL AND ${table.criteria} IS NULL AND ${table.justifications} IS NULL AND ${table.limitations} IS NULL AND ${table.planningConflictIds} IS NULL AND ${table.generatedAt} IS NULL AND ${table.validUntil} IS NULL AND ${table.rejectedAt} IS NULL AND ${table.expiredAt} IS NULL AND ${table.failedAt} IS NULL AND ${table.failureCode} IS NULL AND ${table.cancelledAt} IS NOT NULL AND ${table.updatedAt} = ${table.cancelledAt})
      ) AND (${table.status} = 'accepted' OR ${table.acceptedAt} IS NULL)`,
    ),
    check(
      "itinerary_proposals_content_shape_check",
      sql`(
        ${table.status} NOT IN ('ready', 'accepted', 'rejected', 'expired')
        OR (
          jsonb_typeof(${table.criteria}) = 'array'
          AND jsonb_array_length(${table.criteria}) > 0
          AND jsonb_typeof(${table.justifications}) = 'array'
          AND jsonb_array_length(${table.justifications}) > 0
          AND jsonb_typeof(${table.limitations}) = 'array'
          AND jsonb_typeof(${table.planningConflictIds}) = 'array'
        )
      )`,
    ),
    check(
      "itinerary_proposals_timeline_check",
      sql`${table.updatedAt} >= ${table.requestedAt}
        AND (${table.generationStartedAt} IS NULL OR ${table.generationStartedAt} >= ${table.requestedAt})
        AND (${table.generatedAt} IS NULL OR ${table.generatedAt} >= ${table.generationStartedAt})
        AND (${table.validUntil} IS NULL OR ${table.validUntil} >= ${table.generatedAt})
        AND (${table.acceptedAt} IS NULL OR (${table.acceptedAt} >= ${table.generatedAt} AND ${table.acceptedAt} < ${table.validUntil}))
        AND (${table.rejectedAt} IS NULL OR ${table.rejectedAt} >= ${table.generatedAt})
        AND (${table.expiredAt} IS NULL OR ${table.expiredAt} >= ${table.validUntil})
        AND (${table.failedAt} IS NULL OR ${table.failedAt} >= ${table.generationStartedAt})
        AND (${table.cancelledAt} IS NULL OR ${table.cancelledAt} >= COALESCE(${table.generationStartedAt}, ${table.requestedAt}))`,
    ),
    index("itinerary_proposals_trip_requested_idx").on(table.tripId, table.requestedAt, table.id),
    index("itinerary_proposals_trip_status_idx").on(table.tripId, table.status),
  ],
);

export const proposedActivities = pgTable(
  "proposed_activities",
  {
    id: uuid("id").primaryKey(),
    itineraryProposalId: uuid("itinerary_proposal_id")
      .notNull()
      .references(() => itineraryProposals.id, { onDelete: "cascade" }),
    targetTripDayId: uuid("target_trip_day_id"),
    sourceActivityId: uuid("source_activity_id"),
    placeId: uuid("place_id"),
    title: varchar("title", { length: 220 }).notNull(),
    description: text("description"),
    proposedStartTime: time("proposed_start_time"),
    durationMinutes: integer("duration_minutes"),
    proposedOrder: integer("proposed_order"),
    operationType: varchar("operation_type", { length: 32 }).notNull(),
    flexibility: varchar("flexibility", { length: 32 }),
    estimatedCostAmount: numeric("estimated_cost_amount", { precision: 19, scale: 4 }),
    estimatedCostCurrency: char("estimated_cost_currency", { length: 3 }),
    reason: text("reason"),
  },
  (table) => [
    check(
      "proposed_activities_operation_type_check",
      sql`${table.operationType} in ('add', 'move', 'update', 'remove')`,
    ),
    check(
      "proposed_activities_duration_check",
      sql`${table.durationMinutes} IS NULL OR ${table.durationMinutes} > 0`,
    ),
    check(
      "proposed_activities_order_check",
      sql`${table.proposedOrder} IS NULL OR ${table.proposedOrder} >= 0`,
    ),
    check(
      "proposed_activities_cost_check",
      sql`${table.estimatedCostAmount} IS NULL OR ${table.estimatedCostAmount} >= 0`,
    ),
    check(
      "proposed_activities_currency_check",
      sql`${table.estimatedCostCurrency} IS NULL OR ${table.estimatedCostCurrency} ~ '^[A-Z]{3}$'`,
    ),
    index("proposed_activities_proposal_order_idx").on(
      table.itineraryProposalId,
      table.proposedOrder,
      table.id,
    ),
  ],
);
