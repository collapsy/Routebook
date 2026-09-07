import { describe, expect, it, vi } from "vitest";

import type { TravelerInterest } from "@routebook/decision-intelligence";
import type { ExternalPlaceCandidate } from "@routebook/place-catalog";
import { createTrip } from "@routebook/trip-management";

import type { PlaceDiscoveryItem } from "./place-discovery-feed";
import {
  buildContextualExternalSuggestions,
  buildRecommendationDiscoverySuggestions,
  loadRecommendationDiscoverySuggestions,
} from "./recommendation-discovery-suggestions";

function candidate(
  id: string,
  name: string,
  category: NonNullable<ExternalPlaceCandidate["category"]>,
): ExternalPlaceCandidate {
  return {
    provider: "overture",
    externalId: id,
    name,
    latitude: -29.37,
    longitude: -50.87,
    providerCategory: category,
    category,
    addressLabel: `Endereço ${name}`,
    sourceLicense: "ODbL",
    collectedAt: new Date("2026-09-07T12:00:00.000Z"),
    confidence: 0.95,
  };
}

function externalItem(
  id: string,
  name: string,
  category: NonNullable<ExternalPlaceCandidate["category"]>,
  distanceMeters: number,
): Extract<PlaceDiscoveryItem, { kind: "external" }> {
  return {
    id: `external:overture:${id}`,
    kind: "external",
    candidate: candidate(id, name, category),
    distanceMeters,
  };
}

const trip = createTrip(
  {
    name: "Gramado contextual",
    destination: {
      name: "Gramado, RS, Brasil",
      type: "city",
      countryCode: "BR",
      latitude: -29.3788,
      longitude: -50.872,
      timeZone: "America/Sao_Paulo",
    },
    startDate: "2026-11-10",
    endDate: "2026-11-13",
    ownerName: "RouteBook QA",
  },
  new Date("2026-09-07T12:00:00.000Z"),
);

describe("contextual external suggestions", () => {
  it("prioriza categoria compatível com interesse antes da menor distância", () => {
    const items: PlaceDiscoveryItem[] = [
      externalItem("cafe", "Café mais perto", "gastronomy", 120),
      externalItem("park", "Parque de interesse", "nature", 850),
      externalItem("bar", "Bar intermediário", "nightlife", 300),
    ];

    const suggestions = buildContextualExternalSuggestions({
      tripId: "trip-gramado",
      items,
      interests: ["nature"],
    });

    expect(suggestions.map((suggestion) => suggestion.name)).toEqual([
      "Parque de interesse",
      "Café mais perto",
      "Bar intermediário",
    ]);
    expect(suggestions[0]?.reasons).toContain(
      "A categoria corresponde a um interesse informado para esta Viagem.",
    );
    expect(suggestions[0]?.geodesicDistanceLabel).toBe("850 m em linha reta");
  });

  it("sem interesses usa proximidade sem fabricar preferência", () => {
    const suggestions = buildContextualExternalSuggestions({
      tripId: "trip-gramado",
      items: [
        externalItem("far", "Mais distante", "nature", 1_500),
        externalItem("near", "Mais próximo", "gastronomy", 250),
      ],
      interests: [],
    });

    expect(suggestions.map((suggestion) => suggestion.name)).toEqual([
      "Mais próximo",
      "Mais distante",
    ]);
    expect(suggestions[0]?.reasons).not.toContain(
      "A categoria corresponde a um interesse informado para esta Viagem.",
    );
    expect(suggestions[0]?.limitations).toContain(
      "Nenhum interesse foi informado; a ordem usa proximidade sem inferir preferência.",
    );
  });

  it("ignora itens canônicos e limita a projeção externa sem mutar a entrada", () => {
    const external = Array.from({ length: 8 }, (_, index) =>
      externalItem(
        `external-${index + 1}`,
        `Descoberta ${index + 1}`,
        "gastronomy",
        (index + 1) * 100,
      ),
    );
    const published = {
      id: "published:place-1",
      kind: "published" as const,
      place: {
        id: "place-1",
        destinationId: "gramado",
        slug: "place-1",
        name: "Place publicado",
        summary: "Resumo",
        category: "gastronomy" as const,
        latitude: -29.37,
        longitude: -50.87,
        publicationStatus: "published" as const,
        createdAt: new Date("2026-09-07T12:00:00.000Z"),
        updatedAt: new Date("2026-09-07T12:00:00.000Z"),
      },
      distanceMeters: 50,
    } satisfies Extract<PlaceDiscoveryItem, { kind: "published" }>;
    const items: PlaceDiscoveryItem[] = [published, ...external];
    const originalIds = items.map((item) => item.id);

    const suggestions = buildContextualExternalSuggestions({
      tripId: "trip-gramado",
      items,
      interests: ["gastronomy"],
    });

    expect(suggestions).toHaveLength(6);
    expect(suggestions.some((suggestion) => suggestion.name === "Place publicado")).toBe(false);
    expect(items.map((item) => item.id)).toEqual(originalIds);
    expect(suggestions[0]?.limitations).toContain(
      "Esta é uma descoberta externa e ainda não é um Place publicado no catálogo do RouteBook.",
    );
    expect(() =>
      buildContextualExternalSuggestions({
        tripId: "trip-gramado",
        items,
        interests: ["gastronomy"],
        limit: 0,
      }),
    ).toThrow(RangeError);
  });

  it("retém possible_match ambíguo e rejected usando o feed reconciliado", () => {
    const safe = candidate("safe", "Descoberta segura", "nature");
    const possible = candidate("possible", "Possível duplicidade", "nature");
    const rejected = candidate("rejected", "Descoberta rejeitada", "nature");

    const result = buildRecommendationDiscoverySuggestions({
      trip,
      publishedPlaces: [],
      externalReconciliations: [
        { candidate: safe, status: "new", reason: "novo" },
        { candidate: possible, status: "possible_match", reason: "ambíguo" },
        { candidate: rejected, status: "rejected", reason: "rejeitado" },
      ],
      reference: { latitude: -29.3788, longitude: -50.872 },
      interests: ["nature"],
      discoveryStatus: "success",
    });

    expect(result.availableCount).toBe(1);
    expect(result.suggestions.map((suggestion) => suggestion.name)).toEqual([
      "Descoberta segura",
    ]);
  });

  it("degrada falha do Provider para coleção vazia sem erro fatal", async () => {
    const search = vi.fn(async () => {
      throw new Error("provider indisponível");
    });
    const result = await loadRecommendationDiscoverySuggestions(trip, [] as TravelerInterest[], {
      placeRepository: {
        listPublishedWithinRadius: vi.fn(async () => []),
      },
      externalReferenceRepository: {
        listByPlaceIds: vi.fn(async () => []),
      },
      placeSearchPort: { search },
      bootstrapPolicy: {
        discovery: { enabled: true, maxAttempts: 1, candidateLimit: 20 },
        quality: { enabled: false, maxAttempts: 1, targetLimit: 1 },
        media: { enabled: false, maxAttempts: 1, previewBudget: 0 },
      },
    });

    expect(search).toHaveBeenCalledTimes(1);
    expect(result.discoveryStatus).toBe("failed");
    expect(result.suggestions).toEqual([]);
    expect(result.availableCount).toBe(0);
  });
});
