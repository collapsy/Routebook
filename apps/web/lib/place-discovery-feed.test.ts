import { createPlace, type ExternalPlaceCandidate } from "@routebook/place-catalog";
import { describe, expect, it } from "vitest";

import { buildPlaceDiscoveryFeed } from "./place-discovery-feed";

const reference = { latitude: -6.23, longitude: -35.05 } as const;
const published = createPlace({
  destinationId: "pipa-rn-br",
  slug: "praia-publicada",
  name: "Praia publicada",
  summary: "Lugar canônico do RouteBook.",
  category: "beach",
  latitude: -6.24,
  longitude: -35.05,
  publicationStatus: "published",
});
const external: ExternalPlaceCandidate = {
  provider: "overture",
  externalId: "external-nearby",
  name: "Descoberta próxima",
  latitude: -6.231,
  longitude: -35.05,
  providerCategory: "restaurant",
  category: "gastronomy",
  sourceUrl: "https://docs.overturemaps.org/guides/places/",
  sourceLicense: "Apache-2.0",
  collectedAt: new Date("2026-08-17T00:00:00.000Z"),
};

describe("buildPlaceDiscoveryFeed", () => {
  it("combines sources and orders every visible item by the same spatial reference", () => {
    const result = buildPlaceDiscoveryFeed({
      publishedPlaces: [published],
      externalCandidates: [external],
      reference,
    });

    expect(result.map((item) => item.kind)).toEqual(["external", "published"]);
    expect(result[0]?.distanceMeters).toBeLessThan(result[1]!.distanceMeters);
    expect(result.map((item) => item.id)).toEqual([
      "external:overture:external-nearby",
      `published:${published.id}`,
    ]);
  });

  it("uses a deterministic identity tie-breaker without changing canonical state", () => {
    const sameCoordinateExternal = { ...external, latitude: published.latitude };
    const result = buildPlaceDiscoveryFeed({
      publishedPlaces: [published],
      externalCandidates: [sameCoordinateExternal],
      reference,
    });

    expect(result.map((item) => item.kind)).toEqual(["external", "published"]);
    expect(result.find((item) => item.kind === "external")).not.toHaveProperty("place");
    expect(result.find((item) => item.kind === "published")).not.toHaveProperty("candidate");
  });

  it("degrades to the published catalog when external discovery is unavailable", () => {
    const result = buildPlaceDiscoveryFeed({
      publishedPlaces: [published],
      externalCandidates: [],
      reference,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ kind: "published", place: published });
  });
});
