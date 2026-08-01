import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

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
    failedAt: timestamp("failed_at", { withTimezone: true, mode: "date" }),
    failureCode: varchar("failure_code", { length: 160 }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    check(
      "itinerary_proposals_status_check",
      sql`${table.status} in ('requested', 'generating', 'failed', 'cancelled')`,
    ),
    check(
      "itinerary_proposals_versions_check",
      sql`${table.baseTripContextVersion} > 0 and ${table.baseItineraryVersion} > 0`,
    ),
    check(
      "itinerary_proposals_lifecycle_check",
      sql`(
        (${table.status} = 'requested' AND ${table.generationStartedAt} IS NULL AND ${table.failedAt} IS NULL AND ${table.failureCode} IS NULL AND ${table.cancelledAt} IS NULL AND ${table.updatedAt} = ${table.requestedAt})
        OR (${table.status} = 'generating' AND ${table.generationStartedAt} IS NOT NULL AND ${table.failedAt} IS NULL AND ${table.failureCode} IS NULL AND ${table.cancelledAt} IS NULL AND ${table.updatedAt} = ${table.generationStartedAt})
        OR (${table.status} = 'failed' AND ${table.generationStartedAt} IS NOT NULL AND ${table.failedAt} IS NOT NULL AND ${table.failureCode} IS NOT NULL AND ${table.cancelledAt} IS NULL AND ${table.updatedAt} = ${table.failedAt})
        OR (${table.status} = 'cancelled' AND ${table.failedAt} IS NULL AND ${table.failureCode} IS NULL AND ${table.cancelledAt} IS NOT NULL AND ${table.updatedAt} = ${table.cancelledAt})
      )`,
    ),
    check(
      "itinerary_proposals_timeline_check",
      sql`${table.updatedAt} >= ${table.requestedAt}
        AND (${table.generationStartedAt} IS NULL OR ${table.generationStartedAt} >= ${table.requestedAt})
        AND (${table.failedAt} IS NULL OR ${table.failedAt} >= ${table.generationStartedAt})
        AND (${table.cancelledAt} IS NULL OR ${table.cancelledAt} >= COALESCE(${table.generationStartedAt}, ${table.requestedAt}))`,
    ),
    index("itinerary_proposals_trip_requested_idx").on(table.tripId, table.requestedAt, table.id),
    index("itinerary_proposals_trip_status_idx").on(table.tripId, table.status),
  ],
);
