import {
  date,
  doublePrecision,
  index,
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
  accountId: uuid("account_id"),
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
    priceRange: varchar("price_range", { length: 24 }),
    primaryImage: jsonb("primary_image"),
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

export const recommendations = pgTable(
  "recommendations",
  {
    id: uuid("id").primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    placeId: uuid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 24 }).notNull(),
    contextSnapshot: jsonb("context_snapshot").notNull(),
    contextFingerprint: varchar("context_fingerprint", { length: 64 }).notNull(),
    reasons: jsonb("reasons").notNull(),
    limitations: jsonb("limitations").notNull(),
    score: doublePrecision("score").notNull(),
    confidenceLevel: varchar("confidence_level", { length: 16 }).notNull(),
    confidenceBasis: jsonb("confidence_basis").notNull(),
    validFrom: timestamp("valid_from", { withTimezone: true, mode: "date" }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }),
    generator: varchar("generator", { length: 24 }).notNull(),
    policyVersion: varchar("policy_version", { length: 80 }).notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true, mode: "date" }).notNull(),
    presentedAt: timestamp("presented_at", { withTimezone: true, mode: "date" }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true, mode: "date" }),
    linkedDecisionId: uuid("linked_decision_id"),
    statusReason: varchar("status_reason", { length: 160 }),
    supersededByRecommendationId: uuid("superseded_by_recommendation_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    index("recommendations_trip_id_idx").on(table.tripId),
    index("recommendations_trip_status_idx").on(table.tripId, table.status),
  ],
);

export const itineraries = pgTable(
  "itineraries",
  {
    id: uuid("id").primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }).notNull(),
    timeZone: varchar("time_zone", { length: 64 }).notNull(),
    version: integer("version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [uniqueIndex("itineraries_trip_id_unique").on(table.tripId)],
);

export const itineraryDays = pgTable(
  "itinerary_days",
  {
    id: uuid("id").primaryKey(),
    itineraryId: uuid("itinerary_id")
      .notNull()
      .references(() => itineraries.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    position: integer("position").notNull(),
  },
  (table) => [
    uniqueIndex("itinerary_days_itinerary_date_unique").on(table.itineraryId, table.date),
    uniqueIndex("itinerary_days_itinerary_position_unique").on(table.itineraryId, table.position),
  ],
);

export const itineraryActivities = pgTable(
  "itinerary_activities",
  {
    id: uuid("id").primaryKey(),
    itineraryDayId: uuid("itinerary_day_id")
      .notNull()
      .references(() => itineraryDays.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    type: varchar("type", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    flexibility: varchar("flexibility", { length: 24 }).notNull(),
    startTime: varchar("start_time", { length: 5 }),
    durationMinutes: integer("duration_minutes"),
    order: integer("order").notNull(),
    placeId: uuid("place_id").references(() => places.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("itinerary_activities_day_order_unique").on(table.itineraryDayId, table.order),
  ],
);

export const itineraryFreePeriods = pgTable(
  "itinerary_free_periods",
  {
    id: uuid("id").primaryKey(),
    itineraryDayId: uuid("itinerary_day_id")
      .notNull()
      .references(() => itineraryDays.id, { onDelete: "cascade" }),
    mode: varchar("mode", { length: 24 }).notNull(),
    startTime: varchar("start_time", { length: 5 }),
    durationMinutes: integer("duration_minutes"),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("itinerary_free_periods_day_order_unique").on(table.itineraryDayId, table.order),
  ],
);

export const placeExternalReferences = pgTable(
  "place_external_references",
  {
    id: uuid("id").primaryKey(),
    placeId: uuid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 80 }).notNull(),
    externalId: varchar("external_id", { length: 200 }).notNull(),
    sourceLicense: text("source_license").notNull(),
    sourceUrl: text("source_url"),
    collectedAt: timestamp("collected_at", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("place_external_references_provider_external_id_unique").on(
      table.provider,
      table.externalId,
    ),
    index("place_external_references_place_id_idx").on(table.placeId),
  ],
);
