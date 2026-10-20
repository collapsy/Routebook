import { describe, expect, it } from "vitest";

import type { Trip, TripStage } from "@routebook/trip-management";

import { resolveSelectedPlaceScope, selectTripDiscoveryScope } from "./trip-stage-discovery";

const trip = {
  id: "trip-1",
  destination: {
    name: "Joinville, SC",
    type: "city",
    countryCode: "BR",
    latitude: -26.304,
    longitude: -48.846,
    timeZone: "America/Sao_Paulo",
  },
  accommodation: { name: "Casa do amigo", coordinate: { latitude: -26.31, longitude: -48.85 } },
} as Trip;
const stage = {
  id: "stage-1",
  tripId: trip.id,
  destination: {
    name: "Itapema, SC",
    type: "city",
    countryCode: "BR",
    latitude: -27.09,
    longitude: -48.61,
    timeZone: "America/Sao_Paulo",
  },
} as TripStage;

describe("Trip discovery scope", () => {
  it("uses the base accommodation only for the main destination", () => {
    const primary = selectTripDiscoveryScope(trip, [stage]);
    const visit = selectTripDiscoveryScope(trip, [stage], stage.id);
    expect(primary?.regionResolution).toMatchObject({
      status: "resolved",
      region: { source: "accommodation", center: trip.accommodation?.coordinate },
    });
    expect(visit?.regionResolution).toMatchObject({
      status: "resolved",
      region: {
        source: "destination",
        center: { latitude: stage.destination.latitude, longitude: stage.destination.longitude },
      },
    });
    expect(visit?.accommodationCoordinate).toBeUndefined();
  });

  it("rejects a stage outside this trip", () => {
    expect(selectTripDiscoveryScope(trip, [stage], "other-stage")).toBeNull();
  });

  it("uses the stage accommodation when its location is confirmed", () => {
    const locatedStage = {
      ...stage,
      accommodation: {
        name: "Pousada Itapema",
        coordinate: { latitude: -27.091, longitude: -48.612 },
      },
    };
    const visit = selectTripDiscoveryScope(trip, [locatedStage], stage.id);
    expect(visit?.regionResolution).toMatchObject({
      status: "resolved",
      region: { source: "accommodation", center: locatedStage.accommodation.coordinate },
    });
    expect(visit?.accommodationCoordinate).toEqual(locatedStage.accommodation.coordinate);
  });

  it("identifies the closest registered region for a place in the trip-wide selection", () => {
    expect(
      resolveSelectedPlaceScope(trip, [stage], { latitude: -27.09, longitude: -48.61 })?.stageId,
    ).toBe(stage.id);
    expect(
      resolveSelectedPlaceScope(trip, [stage], { latitude: -26.304, longitude: -48.846 })?.stageId,
    ).toBeUndefined();
    expect(
      resolveSelectedPlaceScope(trip, [stage], { latitude: -23.55, longitude: -46.63 }),
    ).toBeNull();
  });
});
