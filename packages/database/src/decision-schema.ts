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
} from "drizzle-orm/pg-core";

export const decisions = pgTable(
  "decisions",
  {
    id: uuid("id").primaryKey(),
    tripId: uuid("trip_id").notNull(),
    recommendationId: uuid("recommendation_id"),
    actorParticipantId: varchar("actor_participant_id", { length: 160 }).notNull(),
    decidedAt: timestamp("decided_at", { withTimezone: true, mode: "date" }).notNull(),
    type: varchar("type", { length: 32 }).notNull(),
    chosenOption: jsonb("chosen_option").notNull(),
    contextSnapshot: jsonb("context_snapshot").notNull(),
    effect: jsonb("effect").notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 180 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    check(
      "decisions_type_check",
      sql`${table.type} in ('save-place', 'add-to-itinerary', 'ignore-planning-risk')`,
    ),
    uniqueIndex("decisions_trip_idempotency_unique").on(table.tripId, table.idempotencyKey),
    index("decisions_trip_id_idx").on(table.tripId),
    index("decisions_recommendation_id_idx").on(table.recommendationId),
  ],
);
