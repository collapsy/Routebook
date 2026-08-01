import { afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import { addActivity, createItinerary, createTrip } from "@routebook/trip-management";

import { closeDatabase, getDatabase } from "./client";
import { DrizzleItineraryRepository } from "./itinerary-repository";
import { evaluatePlanningConflicts } from "./planning-conflict-evaluation-service";
import { DrizzlePlanningConflictRepository } from "./planning-conflict-repository";
import { trips } from "./schema";
import { DrizzleTripRepository } from "./trip-repository";

afterAll(async () => {
  await closeDatabase();
});

describe("DrizzlePlanningConflictRepository", () => {
  it("preserva estado open e severidade risk no round trip", async () => {
    const trip = createTrip({
      name: "VocabulÃ¡rio canÃ´nico de Planning Conflict",
      startDate: "2026-08-22",
      endDate: "2026-08-24",
      ownerName: "RouteBook QA",
    });

    try {
      await new DrizzleTripRepository().create(trip);
      let itinerary = createItinerary({ tripId: trip.id, period: trip.period });
      itinerary = addActivity(itinerary, {
        dayDate: "2026-08-22",
        title: "Primeira atividade",
        type: "tour",
        startTime: "09:00",
        durationMinutes: 120,
      });
      itinerary = addActivity(itinerary, {
        dayDate: "2026-08-22",
        title: "Atividade sobreposta",
        type: "tour",
        startTime: "10:00",
        durationMinutes: 60,
      });
      await new DrizzleItineraryRepository().save(itinerary);

      const evaluated = await evaluatePlanningConflicts(
        trip.id,
        new Date("2026-07-31T23:00:00.000Z"),
      );
      const overlap = evaluated.activeConflicts.find(
        (conflict) => conflict.type === "activity-time-overlap",
      );

      expect(overlap).toMatchObject({ state: "open", severity: "risk" });
      expect(
        await new DrizzlePlanningConflictRepository().listActiveByTripId(trip.id),
      ).toContainEqual(overlap);
    } finally {
      await getDatabase().delete(trips).where(eq(trips.id, trip.id));
    }
  });
});
