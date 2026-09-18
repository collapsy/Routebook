import { describe, expect, it } from "vitest";

import {
  changeTripPlacePreference,
  createTripPlacePreference,
  TripPlacePreferenceValidationError,
  type TripPlaceIntent,
  type TripPlacePriority,
} from "./trip-place-preference";

const createdAt = new Date("2026-09-18T12:00:00.000Z");
const factoryOptions = { id: "preference-1", now: createdAt } as const;

describe("TripPlacePreference", () => {
  it.each(["WANT", "MAYBE", "NOT_INTERESTED"] as const)(
    "cria a intenção %s com identidade e relógio injetados",
    (intent) => {
      const preference = createTripPlacePreference(
        { tripId: " trip-1 ", placeId: " place-1 ", intent },
        { id: " preference-1 ", now: createdAt },
      );

      expect(preference).toEqual({
        id: "preference-1",
        tripId: "trip-1",
        placeId: "place-1",
        intent,
        priority: null,
        createdAt,
        updatedAt: createdAt,
      });
    },
  );

  it("aceita MUST_DO somente sobre WANT", () => {
    const preference = createTripPlacePreference(
      { tripId: "trip-1", placeId: "place-1", intent: "WANT", priority: "MUST_DO" },
      factoryOptions,
    );

    expect(preference.priority).toBe("MUST_DO");
  });

  it.each(["MAYBE", "NOT_INTERESTED"] as const)("rejeita MUST_DO sobre %s", (intent) => {
    expect(() =>
      createTripPlacePreference(
        {
          tripId: "trip-1",
          placeId: "place-1",
          intent,
          priority: "MUST_DO",
        },
        factoryOptions,
      ),
    ).toThrow(TripPlacePreferenceValidationError);
  });

  it.each([
    ["tripId", { tripId: " ", placeId: "place-1", intent: "WANT" }],
    ["placeId", { tripId: "trip-1", placeId: " ", intent: "WANT" }],
  ] as const)("rejeita %s ausente", (_field, input) => {
    expect(() => createTripPlacePreference(input, factoryOptions)).toThrow(
      TripPlacePreferenceValidationError,
    );
  });

  it("rejeita identidade ausente", () => {
    expect(() =>
      createTripPlacePreference(
        { tripId: "trip-1", placeId: "place-1", intent: "WANT" },
        { id: " ", now: createdAt },
      ),
    ).toThrow(TripPlacePreferenceValidationError);
  });

  it("rejeita intenção desconhecida em runtime", () => {
    expect(() =>
      createTripPlacePreference(
        {
          tripId: "trip-1",
          placeId: "place-1",
          intent: "UNRATED" as TripPlaceIntent,
        },
        factoryOptions,
      ),
    ).toThrow(TripPlacePreferenceValidationError);
  });

  it("rejeita prioridade desconhecida em runtime", () => {
    expect(() =>
      createTripPlacePreference(
        {
          tripId: "trip-1",
          placeId: "place-1",
          intent: "WANT",
          priority: "HIGH" as TripPlacePriority,
        },
        factoryOptions,
      ),
    ).toThrow(TripPlacePreferenceValidationError);
  });

  it("é idempotente quando intenção e prioridade não mudam", () => {
    const preference = createTripPlacePreference(
      { tripId: "trip-1", placeId: "place-1", intent: "WANT" },
      factoryOptions,
    );

    expect(
      changeTripPlacePreference(preference, { intent: "WANT" }, new Date("2026-09-19T12:00:00Z")),
    ).toBe(preference);
  });

  it("preserva identidade e criação ao alterar a preferência", () => {
    const preference = createTripPlacePreference(
      { tripId: "trip-1", placeId: "place-1", intent: "MAYBE" },
      factoryOptions,
    );
    const updatedAt = new Date("2026-09-19T12:00:00.000Z");

    const changed = changeTripPlacePreference(
      preference,
      { intent: "WANT", priority: "MUST_DO" },
      updatedAt,
    );

    expect(changed).not.toBe(preference);
    expect(changed).toEqual({
      ...preference,
      intent: "WANT",
      priority: "MUST_DO",
      updatedAt,
    });
    expect(preference.intent).toBe("MAYBE");
  });
});
