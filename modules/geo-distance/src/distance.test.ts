import { describe, expect, it } from "vitest";

import { calculateGeodesicDistance, createGeoCoordinate } from "./index";

describe("geo distance", () => {
  it("rejects coordinates outside valid ranges", () => {
    expect(() => createGeoCoordinate({ latitude: 91, longitude: 0 })).toThrow(
      "latitude must be between -90 and 90",
    );
    expect(() => createGeoCoordinate({ latitude: 0, longitude: 181 })).toThrow(
      "longitude must be between -180 and 180",
    );
  });

  it("returns zero for the same coordinate", () => {
    const coordinate = { latitude: -6.228, longitude: -35.055 };
    expect(calculateGeodesicDistance(coordinate, coordinate).meters).toBe(0);
  });

  it("calculates a deterministic geodesic distance", () => {
    const distance = calculateGeodesicDistance(
      { latitude: -6.228, longitude: -35.055 },
      { latitude: -6.2265, longitude: -35.0475 },
    );

    expect(distance.meters).toBeGreaterThan(800);
    expect(distance.meters).toBeLessThan(900);
    expect(distance.kilometers).toBeCloseTo(distance.meters / 1_000, 10);
  });
});
