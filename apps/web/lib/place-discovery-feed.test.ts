import {
  createPlace,
  type ExternalPlaceCandidate,
  type ExternalPlaceReconciliation,
  type Place,
} from "@routebook/place-catalog";
import { describe, expect, it } from "vitest";

import { buildPlaceDiscoveryFeed } from "./place-discovery-feed";

const reference = { latitude: -6.23, longitude: -35.05 } as const;

function publishedPlace(overrides: Partial<Place> = {}): Place {
  return createPlace({
    destinationId: "pipa-rn-br",
    slug: "praia-publicada",
    name: "Praia publicada",
    summary: "Lugar canônico do RouteBook.",
    category: "beach",
    latitude: -6.24,
    longitude: -35.05,
    publicationStatus: "published",
    ...overrides,
  });
}

function externalCandidate(
  overrides: Partial<ExternalPlaceCandidate> = {},
): ExternalPlaceCandidate {
  return {
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
    confidence: 0.9,
    ...overrides,
  };
}

function reconciliation(
  candidate: ExternalPlaceCandidate,
  overrides: Partial<ExternalPlaceReconciliation> = {},
): ExternalPlaceReconciliation {
  return {
    candidate,
    status: "new",
    reason: "fixture",
    ...overrides,
  };
}

describe("buildPlaceDiscoveryFeed", () => {
  it("mantém published-only e external-only distintos quando não há equivalência", () => {
    const published = publishedPlace();
    const external = externalCandidate();
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

  it("colapsa referência linked em um único item enriquecido", () => {
    const published = publishedPlace({
      name: "Praia do Amor",
      slug: "praia-do-amor",
      latitude: -6.2386,
      longitude: -35.0455,
    });
    const external = externalCandidate({
      externalId: "praia-do-amor-overture",
      name: "Praia do Amor",
      providerCategory: "beach",
      category: "beach",
      latitude: -6.2387,
      longitude: -35.0456,
    });

    const result = buildPlaceDiscoveryFeed({
      publishedPlaces: [published],
      externalReconciliations: [
        reconciliation(external, {
          status: "linked",
          matchedPlaceId: published.id,
        }),
      ],
      reference,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      kind: "enriched",
      place: published,
      candidate: external,
      matchKind: "linked",
    });
  });

  it("colapsa variante nominal forte em um único item enriquecido", () => {
    const published = publishedPlace({
      name: "Camarão na Fazenda",
      slug: "camarao-na-fazenda",
      category: "gastronomy",
      latitude: -6.229,
      longitude: -35.048,
    });
    const external = externalCandidate({
      name: "Camarão na Fazenda Pipa",
      providerCategory: "restaurant",
      category: "gastronomy",
      latitude: -6.2292,
      longitude: -35.0481,
    });

    const result = buildPlaceDiscoveryFeed({
      publishedPlaces: [published],
      externalReconciliations: [
        reconciliation(external, {
          status: "possible_match",
          matchedPlaceId: published.id,
          distanceMeters: 25,
        }),
      ],
      reference,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ kind: "enriched", matchKind: "strong" });
  });

  it("retém possible match fraco sem reapresentá-lo como card externo", () => {
    const published = publishedPlace({
      name: "Restaurante Horizonte",
      slug: "restaurante-horizonte",
      category: "gastronomy",
      latitude: -6.23,
      longitude: -35.05,
    });
    const nearbyDifferentBusiness = externalCandidate({
      name: "Restaurante Maré Alta",
      providerCategory: "restaurant",
      category: "gastronomy",
      latitude: -6.23005,
      longitude: -35.05005,
    });

    const result = buildPlaceDiscoveryFeed({
      publishedPlaces: [published],
      externalReconciliations: [
        reconciliation(nearbyDifferentBusiness, {
          status: "possible_match",
          matchedPlaceId: published.id,
          distanceMeters: 8,
        }),
      ],
      reference,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ kind: "published", place: published });
  });

  it("prefere referência linked quando múltiplos candidatos equivalem ao mesmo Place", () => {
    const published = publishedPlace({
      name: "Camarão na Fazenda",
      slug: "camarao-na-fazenda",
      category: "gastronomy",
      latitude: -6.229,
      longitude: -35.048,
    });
    const inferred = externalCandidate({
      externalId: "inferred",
      name: "Camarão na Fazenda Pipa",
      latitude: -6.2291,
      longitude: -35.0481,
      confidence: 0.99,
    });
    const linked = externalCandidate({
      externalId: "linked",
      name: "Camarão na Fazenda",
      latitude: -6.2292,
      longitude: -35.0482,
      confidence: 0.7,
    });

    const result = buildPlaceDiscoveryFeed({
      publishedPlaces: [published],
      externalReconciliations: [
        reconciliation(inferred, {
          status: "possible_match",
          matchedPlaceId: published.id,
        }),
        reconciliation(linked, {
          status: "linked",
          matchedPlaceId: published.id,
        }),
      ],
      reference,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      kind: "enriched",
      candidate: linked,
      matchKind: "linked",
    });
  });

  it("deduplica candidatos externos equivalentes antes de aplicar limite", () => {
    const first = externalCandidate({
      externalId: "camarao-1",
      name: "Camarão na Fazenda",
      latitude: -6.229,
      longitude: -35.048,
      confidence: 0.8,
    });
    const duplicatePreferred = externalCandidate({
      externalId: "camarao-2",
      name: "Camarão na Fazenda Pipa",
      latitude: -6.2291,
      longitude: -35.0481,
      confidence: 0.95,
      addressLabel: "Pipa, Tibau do Sul — RN",
    });
    const second = externalCandidate({
      externalId: "segundo",
      name: "Macoco Cozinha Artesanal",
      latitude: -6.231,
      longitude: -35.051,
    });
    const third = externalCandidate({
      externalId: "terceiro",
      name: "Moka Cafés Especiais",
      latitude: -6.232,
      longitude: -35.052,
    });

    const result = buildPlaceDiscoveryFeed({
      publishedPlaces: [],
      externalCandidates: [first, duplicatePreferred, second, third],
      reference,
      externalLimit: 2,
    });

    expect(result).toHaveLength(2);
    expect(result.every((item) => item.kind === "external")).toBe(true);
    expect(result.filter((item) => item.kind === "external").map((item) => item.candidate.externalId))
      .toContain("camarao-2");
    expect(result.filter((item) => item.kind === "external").map((item) => item.candidate.externalId))
      .not.toContain("camarao-1");
  });

  it("não aplica limite aos Places canônicos ou enriquecidos", () => {
    const published = publishedPlace({
      name: "Praia do Amor",
      slug: "praia-do-amor",
    });
    const external = externalCandidate({
      name: "Praia do Amor",
      providerCategory: "beach",
      category: "beach",
      latitude: published.latitude,
      longitude: published.longitude,
    });

    const result = buildPlaceDiscoveryFeed({
      publishedPlaces: [published],
      externalReconciliations: [
        reconciliation(external, { status: "linked", matchedPlaceId: published.id }),
        reconciliation(
          externalCandidate({ externalId: "new-1", name: "Lugar novo 1" }),
        ),
      ],
      reference,
      externalLimit: 0,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.kind).toBe("enriched");
  });

  it("degrada para o catálogo publicado quando a descoberta externa está indisponível", () => {
    const published = publishedPlace();
    const result = buildPlaceDiscoveryFeed({
      publishedPlaces: [published],
      externalCandidates: [],
      reference,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ kind: "published", place: published });
  });

  it("recusa limite externo inválido", () => {
    expect(() =>
      buildPlaceDiscoveryFeed({
        publishedPlaces: [],
        externalCandidates: [],
        reference,
        externalLimit: -1,
      }),
    ).toThrow("inteiro não negativo");
  });
});
