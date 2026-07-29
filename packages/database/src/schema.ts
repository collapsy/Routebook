import {
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const trips = pgTable("trips", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  destinationName: varchar("destination_name", { length: 180 }).notNull(),
  destinationType: varchar("destination_type", { length: 32 }).notNull(),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  timeZone: varchar("time_zone", { length: 64 }).notNull(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  accommodationName: varchar("accommodation_name", { length: 180 }),
  accommodationAddress: text("accommodation_address"),
  status: varchar("status", { length: 32 }).notNull(),
  participants: jsonb("participants").notNull(),
  contextVersion: integer("context_version").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const travelerProfiles = pgTable(
  "traveler_profiles",
  {
    id: uuid("id").primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    travelerCount: integer("traveler_count").notNull(),
    interests: jsonb("interests").notNull(),
    pace: varchar("pace", { length: 24 }),
    transportPreference: varchar("transport_preference", { length: 32 }),
    budgetTotalCents: integer("budget_total_cents"),
    budgetCurrency: varchar("budget_currency", { length: 3 }),
    version: integer("version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [uniqueIndex("traveler_profiles_trip_id_unique").on(table.tripId)],
);
