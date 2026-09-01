import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import { createTrip } from "@routebook/trip-management";

import { closeDatabase, getDatabase } from "./client";
import { itineraries, travelerProfiles } from "./schema";
import { DrizzleTripRepository } from "./trip-repository";

const database = getDatabase();
const repository = new DrizzleTripRepository();

function disposableTrip() {
  return createTrip(
    {
      name: "Viagem descartável RB-INC-138",
      destination: {
        name: "Pipa, Tibau do Sul - RN",
        type: "district",
        countryCode: "BR",
        latitude: -6.2302,
        longitude: -35.0503,
        timeZone: "America/Fortaleza",
      },
      startDate: "2026-08-22",
      endDate: "2026-08-29",
      ownerName: "Owner RB-INC-138",
    },
    new Date("2026-08-15T00:00:00.000Z"),
  );
}

afterAll(async () => {
  await closeDatabase();
});

describe("DrizzleTripRepository", () => {
  it("reidrata Destination e TripPeriod usando os valores persistidos", async () => {
    const trip = createTrip({
      name: "Florianópolis round-trip RB-INC-173",
      destination: {
        name: "Florianópolis, SC",
        type: "city",
        countryCode: "BR",
        latitude: -27.5949,
        longitude: -48.5482,
        timeZone: "America/Sao_Paulo",
      },
      startDate: "2026-11-10",
      endDate: "2026-11-17",
      ownerName: "Owner RB-INC-173",
    });

    await repository.create(trip);
    const restored = await repository.findById(trip.id);

    expect(restored?.destination).toEqual(trip.destination);
    expect(restored?.period.timeZone).toBe("America/Sao_Paulo");
    await repository.deleteById(trip.id);
  });

  it("remove a Trip e dados dependentes protegidos por cascade", async () => {
    const trip = disposableTrip();
    const now = new Date("2026-08-15T00:00:00.000Z");

    await repository.create(trip);
    await database.insert(travelerProfiles).values({
      id: randomUUID(),
      tripId: trip.id,
      travelerCount: 1,
      interests: ["beaches"],
      pace: "balanced",
      transportPreference: "walking",
      budgetTotalCents: null,
      budgetCurrency: null,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    await database.insert(itineraries).values({
      id: randomUUID(),
      tripId: trip.id,
      startDate: trip.period.startDate,
      endDate: trip.period.endDate,
      timeZone: trip.period.timeZone,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });

    await expect(repository.deleteById(trip.id)).resolves.toBe(true);
    await expect(repository.findById(trip.id)).resolves.toBeNull();

    const profiles = await database
      .select({ id: travelerProfiles.id })
      .from(travelerProfiles)
      .where(eq(travelerProfiles.tripId, trip.id));
    const itineraryRows = await database
      .select({ id: itineraries.id })
      .from(itineraries)
      .where(eq(itineraries.tripId, trip.id));

    expect(profiles).toHaveLength(0);
    expect(itineraryRows).toHaveLength(0);
    await expect(repository.deleteById(trip.id)).resolves.toBe(false);
  });
});
