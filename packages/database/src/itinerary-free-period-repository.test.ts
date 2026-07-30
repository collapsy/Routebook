import { afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import { addFreePeriod, createItinerary, createTrip } from "@routebook/trip-management";

import { closeDatabase, getDatabase } from "./client";
import { DrizzleItineraryRepository } from "./itinerary-repository";
import { trips } from "./schema";
import { DrizzleTripRepository } from "./trip-repository";

afterAll(async () => {
  await closeDatabase();
});

describe("DrizzleItineraryRepository com períodos livres", () => {
  it("preserva modos, opcionais, ordem e cascata", async () => {
    const trip = createTrip({
      name: "Persistência de períodos livres",
      startDate: "2026-08-22",
      endDate: "2026-08-24",
      ownerName: "RouteBook QA",
    });
    const database = getDatabase();
    const repository = new DrizzleItineraryRepository();

    try {
      await new DrizzleTripRepository().create(trip);

      let itinerary = createItinerary({ tripId: trip.id, period: trip.period });
      itinerary = addFreePeriod(itinerary, {
        dayDate: "2026-08-22",
        mode: "flexible",
        startTime: "13:30",
        durationMinutes: 90,
      });
      itinerary = addFreePeriod(itinerary, {
        dayDate: "2026-08-22",
        mode: "protected",
      });

      await repository.save(itinerary);
      const persisted = await repository.findByTripId(trip.id);

      expect(persisted).toEqual(itinerary);
      expect(persisted?.days[0]?.freePeriods.map((item) => item.order)).toEqual([1, 2]);
      expect(persisted?.days[0]?.freePeriods[0]).toMatchObject({
        mode: "flexible",
        startTime: "13:30",
        durationMinutes: 90,
      });
      expect(persisted?.days[0]?.freePeriods[1]).toMatchObject({ mode: "protected" });
      expect(persisted?.days[0]?.freePeriods[1]?.startTime).toBeUndefined();
      expect(persisted?.days[0]?.freePeriods[1]?.durationMinutes).toBeUndefined();
      expect(persisted?.days[1]?.freePeriods).toEqual([]);

      await database.delete(trips).where(eq(trips.id, trip.id));
      expect(await repository.findByTripId(trip.id)).toBeNull();
    } finally {
      await database.delete(trips).where(eq(trips.id, trip.id));
    }
  });
});
