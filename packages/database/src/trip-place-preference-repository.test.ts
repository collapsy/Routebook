import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import { changeTripPlacePreference, createTripPlacePreference } from "@routebook/trip-collection";
import { createSavedPlace } from "@routebook/saved-places";

import { closeDatabase, getDatabase } from "./client";
import { DrizzleSavedPlaceRepository } from "./saved-place-repository";
import { places, savedPlaces, trips } from "./schema";
import { DrizzleTripPlacePreferenceRepository } from "./trip-place-preference-repository";

const database = getDatabase();

afterAll(async () => {
  await closeDatabase();
});

async function createFixture() {
  const tripId = randomUUID();
  const placeId = randomUUID();
  const now = new Date("2026-09-18T12:00:00.000Z");

  await database.insert(trips).values({
    id: tripId,
    accountId: null,
    name: "Viagem de teste TripPlacePreference",
    destinationName: "São Paulo",
    destinationType: "city",
    countryCode: "BR",
    latitude: "-23.5505",
    longitude: "-46.6333",
    timeZone: "America/Sao_Paulo",
    startDate: "2026-09-20",
    endDate: "2026-09-22",
    accommodationName: null,
    accommodationAddress: null,
    accommodationLatitude: null,
    accommodationLongitude: null,
    status: "Planned",
    participants: [],
    contextVersion: 1,
    createdAt: now,
    updatedAt: now,
  });
  await database.insert(places).values({
    id: placeId,
    destinationId: null,
    slug: `trip-place-preference-${placeId}`,
    name: "Lugar de teste",
    summary: "Fixture de persistência de preferência.",
    category: "attraction",
    latitude: -23.5505,
    longitude: -46.6333,
    addressLabel: null,
    priceRange: null,
    primaryImage: null,
    publicationStatus: "draft",
    createdAt: now,
    updatedAt: now,
  });

  return { tripId, placeId };
}

async function cleanup(tripId: string, placeId: string) {
  await database.delete(trips).where(eq(trips.id, tripId));
  await database.delete(places).where(eq(places.id, placeId));
}

describe("DrizzleTripPlacePreferenceRepository", () => {
  it("persiste e reconstitui as três intenções canônicas", async () => {
    const fixture = await createFixture();
    const repository = new DrizzleTripPlacePreferenceRepository();
    const createdAt = new Date("2026-09-18T13:00:00.000Z");

    try {
      for (const intent of ["WANT", "MAYBE", "NOT_INTERESTED"] as const) {
        const preference = createTripPlacePreference(
          { tripId: fixture.tripId, placeId: fixture.placeId, intent },
          { id: randomUUID(), now: createdAt },
        );

        expect(await repository.save(preference)).toEqual(preference);
        expect(await repository.find(fixture.tripId, fixture.placeId)).toEqual(preference);

        await repository.remove(fixture.tripId, fixture.placeId);
      }
    } finally {
      await cleanup(fixture.tripId, fixture.placeId);
    }
  });

  it("atualiza intent e priority preservando id e createdAt", async () => {
    const fixture = await createFixture();
    const repository = new DrizzleTripPlacePreferenceRepository();
    const createdAt = new Date("2026-09-18T13:10:00.000Z");
    const updatedAt = new Date("2026-09-18T14:10:00.000Z");
    const initial = createTripPlacePreference(
      { tripId: fixture.tripId, placeId: fixture.placeId, intent: "MAYBE" },
      { id: randomUUID(), now: createdAt },
    );
    const changed = changeTripPlacePreference(
      initial,
      { intent: "WANT", priority: "MUST_DO" },
      updatedAt,
    );

    try {
      await repository.save(initial);
      const persisted = await repository.save(changed);

      expect(persisted).toEqual(changed);
      expect(persisted.id).toBe(initial.id);
      expect(persisted.createdAt).toEqual(createdAt);
      expect(persisted.updatedAt).toEqual(updatedAt);
      expect(await repository.listByTripId(fixture.tripId)).toEqual([changed]);
    } finally {
      await cleanup(fixture.tripId, fixture.placeId);
    }
  });

  it("protege as invariantes canônicas com constraints do banco", async () => {
    const fixture = await createFixture();
    const createdAt = new Date("2026-09-18T15:00:00.000Z");

    try {
      await expect(
        database.insert(savedPlaces).values({
          id: randomUUID(),
          tripId: fixture.tripId,
          placeId: fixture.placeId,
          intent: "UNRATED",
          priority: null,
          createdAt,
          updatedAt: createdAt,
        }),
      ).rejects.toThrow();

      await expect(
        database.insert(savedPlaces).values({
          id: randomUUID(),
          tripId: fixture.tripId,
          placeId: fixture.placeId,
          intent: "MAYBE",
          priority: "MUST_DO",
          createdAt,
          updatedAt: createdAt,
        }),
      ).rejects.toThrow();
    } finally {
      await cleanup(fixture.tripId, fixture.placeId);
    }
  });

  it("mantém Saved Places como adapter legado somente para WANT", async () => {
    const fixture = await createFixture();
    const canonical = new DrizzleTripPlacePreferenceRepository();
    const legacy = new DrizzleSavedPlaceRepository();
    const createdAt = new Date("2026-09-18T16:00:00.000Z");
    const maybe = createTripPlacePreference(
      { tripId: fixture.tripId, placeId: fixture.placeId, intent: "MAYBE" },
      { id: randomUUID(), now: createdAt },
    );

    try {
      await canonical.save(maybe);

      expect(await legacy.find(fixture.tripId, fixture.placeId)).toBeNull();
      expect(await legacy.listByTripId(fixture.tripId)).toEqual([]);

      const saveRequestedAt = new Date("2026-09-18T17:00:00.000Z");
      const saved = createSavedPlace(
        { tripId: fixture.tripId, placeId: fixture.placeId },
        saveRequestedAt,
      );
      const legacyResult = await legacy.save(saved);
      const canonicalResult = await canonical.find(fixture.tripId, fixture.placeId);

      expect(legacyResult.id).toBe(maybe.id);
      expect(legacyResult.createdAt).toEqual(createdAt);
      expect(canonicalResult).toEqual({
        ...maybe,
        intent: "WANT",
        priority: null,
        updatedAt: saveRequestedAt,
      });
      expect(await legacy.listByTripId(fixture.tripId)).toEqual([legacyResult]);

      await legacy.remove(fixture.tripId, fixture.placeId);
      expect(await canonical.find(fixture.tripId, fixture.placeId)).toBeNull();
    } finally {
      await cleanup(fixture.tripId, fixture.placeId);
    }
  });
});
