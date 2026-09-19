import { describe, expect, it } from "vitest";

import type {
  TripPlacePreference,
  TripPlacePreferenceRepository,
} from "@routebook/trip-collection";

import {
  clearTripPlacePreference,
  setTripPlaceMustDo,
  setTripPlacePreference,
} from "./trip-place-preference";

class MemoryPreferenceRepository implements TripPlacePreferenceRepository {
  readonly records = new Map<string, TripPlacePreference>();
  saveCalls = 0;

  private key(tripId: string, placeId: string): string {
    return `${tripId}:${placeId}`;
  }

  async find(tripId: string, placeId: string): Promise<TripPlacePreference | null> {
    return this.records.get(this.key(tripId, placeId)) ?? null;
  }

  async listByTripId(tripId: string): Promise<TripPlacePreference[]> {
    return [...this.records.values()].filter((item) => item.tripId === tripId);
  }

  async save(preference: TripPlacePreference): Promise<TripPlacePreference> {
    this.saveCalls += 1;
    this.records.set(this.key(preference.tripId, preference.placeId), preference);
    return preference;
  }

  async remove(tripId: string, placeId: string): Promise<void> {
    this.records.delete(this.key(tripId, placeId));
  }
}

describe("trip-place-preference web application helper", () => {
  it("cria e troca intenção preservando identidade", async () => {
    const repository = new MemoryPreferenceRepository();
    const createdAt = new Date("2026-09-18T20:00:00.000Z");
    const updatedAt = new Date("2026-09-18T21:00:00.000Z");

    const created = await setTripPlacePreference(
      repository,
      { tripId: "trip-1", placeId: "place-1", intent: "WANT" },
      createdAt,
    );
    const changed = await setTripPlacePreference(
      repository,
      { tripId: "trip-1", placeId: "place-1", intent: "MAYBE" },
      updatedAt,
    );

    expect(changed.id).toBe(created.id);
    expect(changed.createdAt).toEqual(createdAt);
    expect(changed.updatedAt).toEqual(updatedAt);
    expect(changed.intent).toBe("MAYBE");
  });

  it("preserva Imperdível ao repetir Quero ir e limpa ao trocar intenção", async () => {
    const repository = new MemoryPreferenceRepository();
    const created = await setTripPlacePreference(
      repository,
      {
        tripId: "trip-1",
        placeId: "place-1",
        intent: "WANT",
        priority: "MUST_DO",
      },
      new Date("2026-09-18T20:00:00.000Z"),
    );
    const savesAfterCreation = repository.saveCalls;

    const repeated = await setTripPlacePreference(
      repository,
      { tripId: "trip-1", placeId: "place-1", intent: "WANT" },
      new Date("2026-09-18T21:00:00.000Z"),
    );

    expect(repeated).toBe(created);
    expect(repeated.priority).toBe("MUST_DO");
    expect(repository.saveCalls).toBe(savesAfterCreation);

    const changed = await setTripPlacePreference(
      repository,
      { tripId: "trip-1", placeId: "place-1", intent: "MAYBE" },
      new Date("2026-09-18T22:00:00.000Z"),
    );

    expect(changed.intent).toBe("MAYBE");
    expect(changed.priority).toBeNull();
  });

  it("permite Imperdível somente sobre Quero ir", async () => {
    const repository = new MemoryPreferenceRepository();

    await setTripPlacePreference(
      repository,
      { tripId: "trip-1", placeId: "place-1", intent: "MAYBE" },
      new Date("2026-09-18T20:00:00.000Z"),
    );

    await expect(
      setTripPlaceMustDo(
        repository,
        { tripId: "trip-1", placeId: "place-1", enabled: true },
        new Date("2026-09-18T21:00:00.000Z"),
      ),
    ).rejects.toThrow("Marque Quero ir");

    await setTripPlacePreference(
      repository,
      { tripId: "trip-1", placeId: "place-1", intent: "WANT" },
      new Date("2026-09-18T22:00:00.000Z"),
    );
    const mustDo = await setTripPlaceMustDo(
      repository,
      { tripId: "trip-1", placeId: "place-1", enabled: true },
      new Date("2026-09-18T23:00:00.000Z"),
    );

    expect(mustDo.priority).toBe("MUST_DO");
  });

  it("limpa somente a preferência", async () => {
    const repository = new MemoryPreferenceRepository();
    await setTripPlacePreference(
      repository,
      { tripId: "trip-1", placeId: "place-1", intent: "NOT_INTERESTED" },
      new Date("2026-09-18T20:00:00.000Z"),
    );

    await clearTripPlacePreference(repository, "trip-1", "place-1");

    expect(await repository.find("trip-1", "place-1")).toBeNull();
  });
});
