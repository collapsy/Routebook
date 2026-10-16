import { afterAll, describe, expect, it } from "vitest";

import { createTrip, createTripStage } from "@routebook/trip-management";

import { closeDatabase } from "./client";
import { DrizzleTripRepository } from "./trip-repository";
import { DrizzleTripStageRepository } from "./trip-stage-repository";

afterAll(async () => {
  await closeDatabase();
});

describe("DrizzleTripStageRepository", () => {
  it("persists a visit in one Trip and increments its context version on add and remove", async () => {
    const tripRepository = new DrizzleTripRepository();
    const stageRepository = new DrizzleTripStageRepository();
    const trip = createTrip({
      name: "Viagem descartável Joinville",
      destination: {
        name: "Joinville, SC",
        type: "city",
        countryCode: "BR",
        latitude: -26.304,
        longitude: -48.846,
        timeZone: "America/Sao_Paulo",
      },
      startDate: "2026-11-06",
      endDate: "2026-11-09",
      ownerName: "Viajante de teste",
    });
    const stage = createTripStage(trip, {
      destination: {
        name: "Itapema, SC",
        type: "city",
        countryCode: "BR",
        latitude: -27.09,
        longitude: -48.61,
        timeZone: "America/Sao_Paulo",
      },
      startDate: "2026-11-07",
      endDate: "2026-11-07",
    });

    await tripRepository.create(trip);
    try {
      await stageRepository.add(stage, {
        provider: "test",
        externalReference: "test:itapema",
        sourceLicense: "test",
        collectedAt: new Date("2026-10-16T12:00:00.000Z"),
        method: "fixture",
        confidenceLevel: "confirmed",
      });
      expect(await stageRepository.listByTripId(trip.id)).toMatchObject([
        { id: stage.id, destination: { name: "Itapema, SC" }, startDate: "2026-11-07" },
      ]);
      expect((await tripRepository.findById(trip.id))?.contextVersion).toBe(2);
      expect(await stageRepository.remove(trip.id, stage.id)).toBe(true);
      expect(await stageRepository.listByTripId(trip.id)).toEqual([]);
      expect((await tripRepository.findById(trip.id))?.contextVersion).toBe(3);
    } finally {
      await tripRepository.deleteById(trip.id);
    }
  });
});
