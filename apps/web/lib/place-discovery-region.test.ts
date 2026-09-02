import { describe, expect, it } from "vitest";

import { resolvePlaceDiscoveryRegion } from "./place-discovery-region";

describe("resolvePlaceDiscoveryRegion", () => {
  it("prioriza a Hospedagem coordenada", () => {
    const result = resolvePlaceDiscoveryRegion({
      destination: { latitude: -27.5949, longitude: -48.5482 },
      accommodationCoordinate: { latitude: -27.603, longitude: -48.55 },
    });

    expect(result).toEqual({
      status: "resolved",
      region: {
        source: "accommodation",
        center: { latitude: -27.603, longitude: -48.55 },
        externalRadiusMeters: 8_000,
        curatedRadiusMeters: 25_000,
        distanceReferenceLabel: "da hospedagem",
      },
    });
  });

  it("usa Destination como fallback sem regra regional", () => {
    const result = resolvePlaceDiscoveryRegion({
      destination: { latitude: -27.5949, longitude: -48.5482 },
    });

    expect(result).toMatchObject({
      status: "resolved",
      region: {
        source: "destination",
        center: { latitude: -27.5949, longitude: -48.5482 },
        distanceReferenceLabel: "do destino",
      },
    });
  });

  it("limita o raio externo governado", () => {
    const result = resolvePlaceDiscoveryRegion({
      destination: { latitude: -6.2302, longitude: -35.0503 },
      requestedRadiusMeters: 10_000,
    });

    expect(result).toMatchObject({
      status: "resolved",
      region: { externalRadiusMeters: 8_000 },
    });
  });

  it("degrada explicitamente quando nenhuma referência espacial é válida", () => {
    expect(resolvePlaceDiscoveryRegion({})).toEqual({
      status: "unavailable",
      reason: "missing-spatial-reference",
    });
  });
});
