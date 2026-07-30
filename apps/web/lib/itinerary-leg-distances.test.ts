import { describe, expect, it } from "vitest";

import type { ItineraryDaySpatialContext } from "./itinerary-spatial-context";
import { deriveItineraryDayLegSummary, formatGeodesicDistance } from "./itinerary-leg-distances";

function createContext(): ItineraryDaySpatialContext {
  return {
    dayId: "day-1",
    dayDate: "2026-08-22",
    accommodation: {
      status: "available",
      point: {
        id: "accommodation",
        label: "Hospedagem",
        kind: "accommodation",
        coordinate: { latitude: 0, longitude: 0 },
      },
    },
    activitySteps: [
      {
        activityId: "activity-1",
        title: "Primeira Atividade",
        order: 1,
        status: "available",
        point: {
          id: "activity-1",
          label: "Primeira Atividade",
          kind: "activity",
          coordinate: { latitude: 0, longitude: 0 },
          sequence: 1,
          activityId: "activity-1",
        },
      },
      {
        activityId: "activity-2",
        title: "Segunda Atividade",
        order: 2,
        status: "available",
        point: {
          id: "activity-2",
          label: "Segunda Atividade",
          kind: "activity",
          coordinate: { latitude: 0, longitude: 0.01 },
          sequence: 2,
          activityId: "activity-2",
        },
      },
    ],
  };
}

describe("deriveItineraryDayLegSummary", () => {
  it("calculates outbound, consecutive activity and return legs with a valid total", () => {
    const summary = deriveItineraryDayLegSummary(createContext());

    expect(summary.legs.map((leg) => [leg.kind, leg.status])).toEqual([
      ["outbound", "available"],
      ["between-activities", "available"],
      ["return", "available"],
    ]);
    expect(summary.legs[0]).toMatchObject({ distanceMeters: 0 });
    expect(summary.totalMeters).toBeGreaterThan(2000);
  });

  it("does not connect activities across an unavailable canonical step", () => {
    const context = createContext();
    context.activitySteps.splice(1, 0, {
      activityId: "activity-gap",
      title: "Atividade manual",
      order: 2,
      status: "unavailable",
      reason: "manual-activity",
    });
    context.activitySteps[2]!.order = 3;

    const summary = deriveItineraryDayLegSummary(context);

    expect(summary.legs).toHaveLength(4);
    expect(summary.legs[1]).toMatchObject({
      status: "unavailable",
      originLabel: "Primeira Atividade",
      destinationLabel: "Atividade manual",
      reason: "destination-unavailable",
    });
    expect(summary.legs[2]).toMatchObject({
      status: "unavailable",
      originLabel: "Atividade manual",
      destinationLabel: "Segunda Atividade",
      reason: "origin-unavailable",
    });
    expect(summary.totalMeters).toBeUndefined();
    expect(
      summary.legs.some(
        (leg) =>
          leg.status === "available" &&
          leg.origin.label === "Primeira Atividade" &&
          leg.destination.label === "Segunda Atividade",
      ),
    ).toBe(false);
  });

  it("calculates only consecutive activities when accommodation is unavailable", () => {
    const context = createContext();
    context.accommodation = { status: "not-provided" };

    const summary = deriveItineraryDayLegSummary(context);

    expect(summary.legs).toHaveLength(1);
    expect(summary.legs[0]).toMatchObject({ kind: "between-activities", status: "available" });
    expect(summary.totalMeters).toBeGreaterThan(1000);
  });

  it("returns no total when there is no calculable pair", () => {
    const context = createContext();
    context.accommodation = { status: "not-provided" };
    context.activitySteps = [context.activitySteps[0]!];

    expect(deriveItineraryDayLegSummary(context)).toEqual({ legs: [] });
  });
});

describe("formatGeodesicDistance", () => {
  it("formats zero, meters and kilometers without false precision", () => {
    expect(formatGeodesicDistance(0)).toBe("0 m");
    expect(formatGeodesicDistance(850.4)).toBe("850 m");
    expect(formatGeodesicDistance(1250)).toBe("1,3 km");
  });

  it("rejects invalid distances", () => {
    expect(() => formatGeodesicDistance(Number.NaN)).toThrow(RangeError);
    expect(() => formatGeodesicDistance(-1)).toThrow(RangeError);
  });
});
