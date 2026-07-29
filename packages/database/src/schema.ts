import {
  date,
  doublePrecision,
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
  accommodationLatitude: doublePrecision("accommodation_latitude"),
  accommodationLongitude: doublePrecision("accommodation_longitude"),
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

export const places = pgTable(
  "places",
  {
    id: uuid("id").primaryKey(),
    destinationId: varchar("destination_id", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    summary: text("summary").notNull(),
    category: varchar("category", { length: 32 }).notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    addressLabel: text("address_label"),
    publicationStatus: varchar("publication_status", { length: 24 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [uniqueIndex("places_destination_slug_unique").on(table.destinationId, table.slug)],
);

export const savedPlaces = pgTable(
  "saved_places",
  {
    id: uuid("id").primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    placeId: uuid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [uniqueIndex("saved_places_trip_place_unique").on(table.tripId, table.placeId)],
);