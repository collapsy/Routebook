import { describe, expect, it } from "vitest";

import {
  clearTripPlacePreference,
  createTripCollection,
  getTripPlacePreference,
  listTripPlacePreferences,
  setTripPlacePreference,
} from "./trip-collection";
import { TripPlacePreferenceValidationError } from "./trip-place-preference";

const createdAt = new Date("2026-09-18T12:00:00.000Z");

function emptyCollection() {
  return createTripCollection(
    { tripId: "trip-1" },
    { id: "collection-1", now: createdAt },
  );
}

describe("TripCollection", () => {
  it("inicia uma coleção vazia para a viagem", () => {
    const collection = createTripCollection(
      { tripId: " trip-1 " },
      { id: " collection-1 ", now: createdAt },
    );

    expect(collection).toEqual({
      id: "collection-1",
      tripId: "trip-1",
      preferences: [],
      createdAt,
      updatedAt: createdAt,
    });
  });

  it("inclui uma preferência usando a identidade da coleção", () => {
    const collection = emptyCollection();
    const updatedAt = new Date("2026-09-19T12:00:00.000Z");

    const changed = setTripPlacePreference(
      collection,
      { placeId: " place-1 ", intent: "WANT", priority: "MUST_DO" },
      { preferenceId: " preference-1 ", now: updatedAt },
    );

    expect(collection.preferences).toEqual([]);
    expect(changed.updatedAt).toBe(updatedAt);
    expect(getTripPlacePreference(changed, "place-1")).toEqual({
      id: "preference-1",
      tripId: "trip-1",
      placeId: "place-1",
      intent: "WANT",
      priority: "MUST_DO",
      createdAt: updatedAt,
      updatedAt,
    });
  });

  it("exige identidade injetada ao criar uma preferência", () => {
    expect(() =>
      setTripPlacePreference(
        emptyCollection(),
        { placeId: "place-1", intent: "WANT" },
        { now: createdAt },
      ),
    ).toThrow(TripPlacePreferenceValidationError);
  });

  it("mantém uma única preferência por viagem e lugar ao alterar intenção", () => {
    const withMaybe = setTripPlacePreference(
      emptyCollection(),
      { placeId: "place-1", intent: "MAYBE" },
      { preferenceId: "preference-1", now: createdAt },
    );
    const updatedAt = new Date("2026-09-19T12:00:00.000Z");

    const withWant = setTripPlacePreference(
      withMaybe,
      { placeId: " place-1 ", intent: "WANT" },
      { preferenceId: "ignored-new-id", now: updatedAt },
    );

    expect(listTripPlacePreferences(withWant)).toHaveLength(1);
    expect(getTripPlacePreference(withWant, "place-1")).toMatchObject({
      id: "preference-1",
      intent: "WANT",
      createdAt,
      updatedAt,
    });
  });

  it("é idempotente ao definir a mesma preferência", () => {
    const selected = setTripPlacePreference(
      emptyCollection(),
      { placeId: "place-1", intent: "WANT" },
      { preferenceId: "preference-1", now: createdAt },
    );

    const unchanged = setTripPlacePreference(
      selected,
      { placeId: "place-1", intent: "WANT" },
      { now: new Date("2026-09-20T12:00:00.000Z") },
    );

    expect(unchanged).toBe(selected);
  });

  it("limpa somente a preferência indicada e retorna o lugar a não avaliado", () => {
    const withFirst = setTripPlacePreference(
      emptyCollection(),
      { placeId: "place-1", intent: "WANT" },
      { preferenceId: "preference-1", now: createdAt },
    );
    const withBoth = setTripPlacePreference(
      withFirst,
      { placeId: "place-2", intent: "NOT_INTERESTED" },
      { preferenceId: "preference-2", now: createdAt },
    );
    const updatedAt = new Date("2026-09-19T12:00:00.000Z");

    const cleared = clearTripPlacePreference(withBoth, " place-1 ", updatedAt);

    expect(getTripPlacePreference(cleared, "place-1")).toBeNull();
    expect(getTripPlacePreference(cleared, "place-2")?.intent).toBe("NOT_INTERESTED");
    expect(cleared.updatedAt).toBe(updatedAt);
  });

  it("é idempotente ao limpar uma preferência ausente", () => {
    const collection = emptyCollection();

    expect(clearTripPlacePreference(collection, "place-1", createdAt)).toBe(collection);
  });
});
