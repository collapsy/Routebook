import { describe, expect, it } from "vitest";

import {
  createTripStage,
  stagesForDate,
  TripStageValidationError,
  updateTripStageAccommodation,
} from "./trip-stage";
import { TripValidationError } from "./trip";

const trip = {
  id: "00000000-0000-4000-8000-000000000001",
  period: { startDate: "2026-11-06", endDate: "2026-11-09", timeZone: "America/Sao_Paulo" },
};
const destination = {
  name: " Itapema, SC ",
  type: "city" as const,
  countryCode: "br",
  latitude: -27.09,
  longitude: -48.61,
  timeZone: "America/Sao_Paulo",
};

describe("Trip Stage", () => {
  it("accepts a one-day visit without accommodation", () => {
    const stage = createTripStage(trip, {
      destination,
      startDate: "2026-11-07",
      endDate: "2026-11-07",
    });
    expect(stage.destination.name).toBe("Itapema, SC");
    expect(stage.destination.countryCode).toBe("BR");
    expect(stagesForDate([stage], "2026-11-07")).toEqual([stage]);
    expect(stagesForDate([stage], "2026-11-08")).toEqual([]);
  });

  it("rejects dates outside the trip and malformed calendar dates", () => {
    expect(() =>
      createTripStage(trip, {
        destination,
        startDate: "2026-11-31",
        endDate: "2026-12-01",
      }),
    ).toThrow(TripStageValidationError);
  });

  it("rejects invalid destination coordinates", () => {
    expect(() =>
      createTripStage(trip, {
        destination: { ...destination, latitude: 91 },
        startDate: "2026-11-07",
        endDate: "2026-11-07",
      }),
    ).toThrow(TripStageValidationError);
  });

  it("rejects a different time zone until cross-zone stages are supported", () => {
    expect(() =>
      createTripStage(trip, {
        destination: { ...destination, timeZone: "America/Fortaleza" },
        startDate: "2026-11-07",
        endDate: "2026-11-07",
      }),
    ).toThrow(TripStageValidationError);
  });

  it("adds and removes accommodation from one stage without changing the trip", () => {
    const stage = createTripStage(trip, {
      destination,
      startDate: "2026-11-07",
      endDate: "2026-11-08",
    });
    const located = updateTripStageAccommodation(stage, {
      accommodationName: " Pousada Itapema ",
      accommodationAddress: " Centro, Itapema ",
      accommodationLatitude: -27.0905,
      accommodationLongitude: -48.6112,
    });
    expect(located.accommodation).toEqual({
      name: "Pousada Itapema",
      address: "Centro, Itapema",
      coordinate: { latitude: -27.0905, longitude: -48.6112 },
    });
    expect(stage.accommodation).toBeUndefined();
    expect(
      updateTripStageAccommodation(located, { accommodationName: "" }).accommodation,
    ).toBeUndefined();
  });

  it("rejects incomplete or invalid accommodation coordinates", () => {
    const stage = createTripStage(trip, {
      destination,
      startDate: "2026-11-07",
      endDate: "2026-11-07",
    });
    expect(() =>
      updateTripStageAccommodation(stage, {
        accommodationName: "Pousada",
        accommodationLatitude: -27.09,
      }),
    ).toThrow(TripValidationError);
  });
});
