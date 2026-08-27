import { createPlace, type ExternalPlaceCandidate } from "@routebook/place-catalog";
import { describe, expect, it } from "vitest";

import type { PlaceDiscoveryItem } from "./place-discovery-feed";
import { parsePlaceDiscoveryOrder, rankPlaceDiscoveryItems } from "./place-discovery-ranking";

function published(id: string, name: string, distanceMeters: number): PlaceDiscoveryItem {
  const place = createPlace({
    destinationId: "pipa-rn-br",
    slug: id,
    name,
    summary: "Place de teste do ranking.",
    category: "gastronomy",
    latitude: -6.23,
    longitude: -35.05,
    publicationStatus: "published",
  });
  return {
    id: `published:${place.id}`,
    kind: "published",
    place,
    distanceMeters,
  };
}

function external(externalId: string, name: string, distanceMeters: number): PlaceDiscoveryItem {
  const candidate: ExternalPlaceCandidate = {
    provider: "overture",
    externalId,
    name,
    latitude: -6.23,
    longitude: -35.05,
    providerCategory: "restaurant",
    category: "gastronomy",
    sourceLicense: "Apache-2.0",
    collectedAt: new Date("2026-08-27T12:00:00.000Z"),
  };
  return {
    id: `external:overture:${externalId}`,
    kind: "external",
    candidate,
    distanceMeters,
  };
}

function qualityMatch(
  targetId: string,
  overrides: Readonly<{
    rating?: { value: number; scaleMax: number; reviewCount?: number };
    popularity?: { value: number; scaleMax: number };
  }> = {},
) {
  return {
    targetId,
    signals: {
      provider: "quality-provider",
      externalId: targetId,
      rating: overrides.rating ?? { value: 4.8, scaleMax: 5, reviewCount: 1_000 },
      ...(overrides.popularity ? { popularity: overrides.popularity } : {}),
      collectedAt: new Date("2026-08-27T12:00:00.000Z"),
    },
  } as const;
}

describe("rankPlaceDiscoveryItems", () => {
  it("mantém distância como fallback quando não há cobertura de qualidade", () => {
    const far = published("longe", "Lugar longe", 3_000);
    const near = external("perto", "Lugar perto", 300);

    const result = rankPlaceDiscoveryItems({
      items: [far, near],
      order: "recommended",
    });

    expect(result.order).toBe("distance");
    expect(result.hasQualityCoverage).toBe(false);
    expect(result.availableOrders).toEqual(["distance"]);
    expect(result.items.map((entry) => entry.item.id)).toEqual([near.id, far.id]);
  });

  it("ordena recomendados pelo RouteBook Score quando existem sinais", () => {
    const sparsePerfect = published("perfeito", "Perfeito com pouca evidência", 500);
    const established = external("consolidado", "Excelente consolidado", 1_500);

    const result = rankPlaceDiscoveryItems({
      items: [sparsePerfect, established],
      order: "recommended",
      qualityMatches: [
        qualityMatch(sparsePerfect.id, {
          rating: { value: 5, scaleMax: 5, reviewCount: 3 },
        }),
        qualityMatch(established.id, {
          rating: { value: 4.8, scaleMax: 5, reviewCount: 1_500 },
        }),
      ],
    });

    expect(result.items[0]?.item.id).toBe(established.id);
    expect(result.items[0]?.position).toBe(1);
  });

  it("expõe rating e popularidade somente quando há evidência correspondente", () => {
    const ratingOnly = published("rating", "Só rating", 500);
    const popularityOnly = external("popular", "Só popularidade", 600);

    const result = rankPlaceDiscoveryItems({
      items: [ratingOnly, popularityOnly],
      qualityMatches: [
        qualityMatch(ratingOnly.id),
        {
          targetId: popularityOnly.id,
          signals: {
            provider: "quality-provider",
            externalId: popularityOnly.id,
            popularity: { value: 0.9, scaleMax: 1 },
            collectedAt: new Date("2026-08-27T12:00:00.000Z"),
          },
        },
      ],
    });

    expect(result.availableOrders).toEqual(["recommended", "rating", "popularity", "distance"]);
  });

  it("coloca itens sem o sinal solicitado depois dos itens com evidência", () => {
    const withPopularity = external("popular", "Popular", 2_000);
    const withoutPopularity = published("sem-popularidade", "Sem popularidade", 100);

    const result = rankPlaceDiscoveryItems({
      items: [withoutPopularity, withPopularity],
      order: "popularity",
      qualityMatches: [
        qualityMatch(withPopularity.id, {
          popularity: { value: 0.88, scaleMax: 1 },
        }),
        qualityMatch(withoutPopularity.id),
      ],
    });

    expect(result.items[0]?.item.id).toBe(withPopularity.id);
  });

  it("faz parse fail-safe de ordenação desconhecida", () => {
    expect(parsePlaceDiscoveryOrder("recommended")).toBe("recommended");
    expect(parsePlaceDiscoveryOrder("qualquer-coisa")).toBe("distance");
    expect(parsePlaceDiscoveryOrder()).toBe("distance");
  });
});
