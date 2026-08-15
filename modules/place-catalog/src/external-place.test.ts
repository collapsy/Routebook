import { describe, expect, it } from "vitest";

import type { Place } from "./place";
import {
  mapOverturePlaceCategory,
  reconcileExternalPlaceCandidate,
  validatePlaceSearchQuery,
  type ExternalPlaceCandidate,
} from "./external-place";

function place(overrides: Partial<Place> = {}): Place {
  const now = new Date("2026-08-15T15:00:00.000Z");
  return {
    id: "10000000-0000-4000-8000-000000000001",
    destinationId: "pipa-rn-br",
    slug: "praia-do-amor",
    name: "Praia do Amor",
    summary: "Praia conhecida de Pipa usada no catálogo canônico do RouteBook.",
    category: "beach",
    latitude: -6.2386,
    longitude: -35.0455,
    publicationStatus: "published",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function candidate(overrides: Partial<ExternalPlaceCandidate> = {}): ExternalPlaceCandidate {
  return {
    provider: "overture",
    externalId: "08b2-example",
    name: "Praia do Amor",
    latitude: -6.2387,
    longitude: -35.0456,
    providerCategory: "beach",
    category: "beach",
    sourceUrl: "https://overturemaps.org/",
    sourceLicense: "Apache-2.0",
    collectedAt: new Date("2026-08-15T15:00:00.000Z"),
    confidence: 0.98,
    ...overrides,
  };
}

describe("mapOverturePlaceCategory", () => {
  it.each([
    ["beach", "beach"],
    ["restaurant", "gastronomy"],
    ["coffee_shop", "gastronomy"],
    ["bar", "nightlife"],
    ["night_club", "nightlife"],
    ["scenic_viewpoint", "nature"],
  ] as const)("mapeia %s para %s", (externalCategory, canonicalCategory) => {
    expect(mapOverturePlaceCategory(externalCategory)).toBe(canonicalCategory);
  });

  it("não inventa categoria canônica para categoria desconhecida", () => {
    expect(mapOverturePlaceCategory("pet_store")).toBeUndefined();
  });
});

describe("validatePlaceSearchQuery", () => {
  it("aceita uma busca geográfica limitada", () => {
    expect(() =>
      validatePlaceSearchQuery({
        destinationId: "pipa-rn-br",
        center: { latitude: -6.23, longitude: -35.05 },
        radiusMeters: 15_000,
        categories: ["beach", "gastronomy"],
        limit: 100,
      }),
    ).not.toThrow();
  });

  it("rejeita raio que permitiria varredura não governada", () => {
    expect(() =>
      validatePlaceSearchQuery({
        destinationId: "pipa-rn-br",
        center: { latitude: -6.23, longitude: -35.05 },
        radiusMeters: 100_000,
      }),
    ).toThrow("entre 1 e 50000 metros");
  });
});

describe("reconcileExternalPlaceCandidate", () => {
  it("reconhece referência externa já vinculada", () => {
    const result = reconcileExternalPlaceCandidate(candidate(), [place()], [
      {
        placeId: "10000000-0000-4000-8000-000000000001",
        provider: "overture",
        externalId: "08b2-example",
      },
    ]);

    expect(result).toMatchObject({
      status: "linked",
      matchedPlaceId: "10000000-0000-4000-8000-000000000001",
    });
  });

  it("não promove automaticamente candidato com provável duplicata", () => {
    const result = reconcileExternalPlaceCandidate(candidate(), [place()]);

    expect(result.status).toBe("possible_match");
    expect(result.matchedPlaceId).toBe("10000000-0000-4000-8000-000000000001");
    expect(result.distanceMeters).toBeLessThan(500);
  });

  it("classifica candidato distante e sem vínculo como novo", () => {
    const result = reconcileExternalPlaceCandidate(
      candidate({
        externalId: "new-place",
        name: "Mirante Novo",
        providerCategory: "scenic_viewpoint",
        category: "nature",
        latitude: -6.2101,
        longitude: -35.0712,
      }),
      [place()],
    );

    expect(result.status).toBe("new");
  });

  it("falha fechado quando a categoria externa não possui mapeamento", () => {
    const result = reconcileExternalPlaceCandidate(
      candidate({ providerCategory: "pet_store", category: undefined }),
      [place()],
    );

    expect(result.status).toBe("rejected");
    expect(result.reason).toContain("não possui mapeamento canônico");
  });

  it("rejeita candidato sem Provenance licenciável", () => {
    const result = reconcileExternalPlaceCandidate(candidate({ sourceLicense: "" }), [place()]);

    expect(result.status).toBe("rejected");
    expect(result.reason).toContain("licença");
  });
});
