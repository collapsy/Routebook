import { describe, expect, it } from "vitest";

import { createTripStage, stagesForDate, TripStageValidationError } from "./trip-stage";

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
});
