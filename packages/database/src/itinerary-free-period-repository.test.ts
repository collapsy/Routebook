import { afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import {
  addFreePeriod,
  createItinerary,
  createTrip,
  removeFreePeriod,
  updateFreePeriod,
} from "@routebook/trip-management";

import { closeDatabase, getDatabase } from "./client";
import { DrizzleItineraryRepository } from "./itinerary-repository";
import { trips } from "./schema";
import { DrizzleTripRepository } from "./trip-repository";

afterAll(async () => {
  await closeDatabase();
});

describe("DrizzleItineraryRepository com períodos livres", () => {
  it("preserva criação, edição, remoção, opcionais, ordem e cascata", async () => {
    const trip = createTrip({
      name: "Persistência de períodos livres",
      destination: {
        name: "Pipa, Tibau do Sul - RN",
        type: "district",
        countryCode: "BR",
        latitude: -6.2302,
        longitude: -35.0503,
        timeZone: "America/Fortaleza",
      },
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
      itinerary = addFreePeriod(itinerary, {
        dayDate: "2026-08-22",
        mode: "flexible",
        startTime: "17:00",
        durationMinutes: 60,
      });
      const firstFreePeriod = itinerary.days[0]?.freePeriods[0];
      const removedFreePeriod = itinerary.days[0]?.freePeriods[1];
      const lastFreePeriod = itinerary.days[0]?.freePeriods[2];
      itinerary = updateFreePeriod(itinerary, {
        freePeriodId: firstFreePeriod!.id,
        mode: "protected",
      });
      itinerary = removeFreePeriod(itinerary, { freePeriodId: removedFreePeriod!.id });

      await repository.save(itinerary);
      const persisted = await repository.findByTripId(trip.id);

      expect(persisted).toEqual(itinerary);
      expect(persisted?.days[0]?.freePeriods.map((item) => item.order)).toEqual([1, 2]);
      expect(persisted?.days[0]?.freePeriods.map((item) => item.id)).toEqual([
        firstFreePeriod?.id,
        lastFreePeriod?.id,
      ]);
      expect(persisted?.days[0]?.freePeriods[0]).toMatchObject({
        id: firstFreePeriod?.id,
        mode: "protected",
        order: 1,
        createdAt: firstFreePeriod?.createdAt,
      });
      expect(persisted?.days[0]?.freePeriods[0]?.startTime).toBeUndefined();
      expect(persisted?.days[0]?.freePeriods[0]?.durationMinutes).toBeUndefined();
      expect(persisted?.days[0]?.freePeriods[1]).toMatchObject({
        id: lastFreePeriod?.id,
        mode: "flexible",
        order: 2,
        startTime: "17:00",
        durationMinutes: 60,
      });
      expect(
        persisted?.days[0]?.freePeriods.some((item) => item.id === removedFreePeriod?.id),
      ).toBe(false);
      expect(persisted?.days[1]?.freePeriods).toEqual([]);

      await database.delete(trips).where(eq(trips.id, trip.id));
      expect(await repository.findByTripId(trip.id)).toBeNull();
    } finally {
      await database.delete(trips).where(eq(trips.id, trip.id));
    }
  });
});
