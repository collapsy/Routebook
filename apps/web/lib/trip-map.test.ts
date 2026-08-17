import { describe, expect, it } from "vitest";

import { deriveTripMapBounds, isValidTripMapPoint, type TripMapPoint } from "./trip-map";

const accommodation: TripMapPoint = {
  id: "accommodation",
  label: "Condomínio Solar Água",
  kind: "accommodation",
  latitude: -6.2302,
  longitude: -35.0503,
};

describe("deriveTripMapBounds", () => {
  it("returns undefined without points", () => {
    expect(deriveTripMapBounds([])).toBeUndefined();
  });

  it("adds padding around a single point", () => {
    expect(deriveTripMapBounds([accommodation])).toEqual({
      north: -6.2202,
      south: -6.2402,
      east: -35.0403,
      west: -35.0603,
    });
  });

  it("contains all visible points", () => {
    expect(
      deriveTripMapBounds([
        accommodation,
        {
          id: "place",
          label: "Praia do Amor",
          kind: "published-place",
          latitude: -6.244,
          longitude: -35.041,
        },
      ]),
    ).toEqual({
      north: -6.2302,
      south: -6.244,
      east: -35.041,
      west: -35.0503,
    });
  });
});

describe("isValidTripMapPoint", () => {
  it("accepts valid coordinates", () => {
    expect(isValidTripMapPoint(accommodation)).toBe(true);
    expect(
      isValidTripMapPoint({
        ...accommodation,
        id: "external:overture:place-1",
        kind: "external-place",
      }),
    ).toBe(true);
  });

  it("rejects coordinates outside the globe", () => {
    expect(isValidTripMapPoint({ ...accommodation, latitude: 91 })).toBe(false);
    expect(isValidTripMapPoint({ ...accommodation, longitude: -181 })).toBe(false);
  });
});
