import { describe, expect, it } from "vitest";

import { createSavedPlace, SavedPlaceValidationError } from "./saved-place";

describe("createSavedPlace", () => {
  it("cria uma seleção vinculada à viagem e ao lugar", () => {
    const selection = createSavedPlace(
      { tripId: "trip-1", placeId: "place-1" },
      new Date("2026-07-29T00:00:00Z"),
    );

    expect(selection.tripId).toBe("trip-1");
    expect(selection.placeId).toBe("place-1");
    expect(selection.createdAt.toISOString()).toBe("2026-07-29T00:00:00.000Z");
  });

  it("normaliza espaços nos identificadores", () => {
    const selection = createSavedPlace({ tripId: " trip-1 ", placeId: " place-1 " });

    expect(selection.tripId).toBe("trip-1");
    expect(selection.placeId).toBe("place-1");
  });

  it("rejeita viagem ausente", () => {
    expect(() => createSavedPlace({ tripId: "", placeId: "place-1" })).toThrow(
      SavedPlaceValidationError,
    );
  });

  it("rejeita lugar ausente", () => {
    expect(() => createSavedPlace({ tripId: "trip-1", placeId: "" })).toThrow(
      SavedPlaceValidationError,
    );
  });
});
