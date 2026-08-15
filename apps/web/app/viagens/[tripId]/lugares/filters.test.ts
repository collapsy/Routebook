import { describe, expect, it } from "vitest";

import type { Place } from "@routebook/place-catalog";

import { filterPlaces, parseMaximumDistance } from "./filters";

const now = new Date("2026-08-11T00:00:00Z");
const places: Place[] = [
  {
    id: "beach",
    destinationId: "pipa-rn-br",
    slug: "praia-do-amor",
    name: "Praia do Amor",
    summary: "Praia cercada por falésias e com acesso pelo centro de Pipa.",
    category: "beach",
    latitude: -6.2366,
    longitude: -35.0465,
    addressLabel: "Pipa, Tibau do Sul — RN",
    priceRange: "free",
    publicationStatus: "published",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "food",
    destinationId: "pipa-rn-br",
    slug: "centro-gastronomico",
    name: "Centro Gastronômico",
    summary: "Restaurantes e opções variadas para refeições durante a viagem.",
    category: "gastronomy",
    latitude: -6.2297,
    longitude: -35.0536,
    priceRange: "moderate",
    publicationStatus: "published",
    createdAt: now,
    updatedAt: now,
  },
];

describe("filterPlaces", () => {
  it("pesquisa sem diferenciar acentos e preserva filtros combinados", () => {
    expect(
      filterPlaces(places, { search: "gastronomico", priceRange: "moderate" }).map(
        ({ place }) => place.id,
      ),
    ).toEqual(["food"]);
  });

  it("combina categoria, Price Range e distância geodésica", () => {
    expect(
      filterPlaces(
        places,
        { category: "beach", priceRange: "free", maximumDistanceMeters: 2_000 },
        { latitude: -6.2289, longitude: -35.053 },
      ).map(({ place }) => place.id),
    ).toEqual(["beach"]);
  });

  it("prefere lugares mais próximos quando a hospedagem possui coordenadas", () => {
    const results = filterPlaces(places, {}, { latitude: -6.2297, longitude: -35.0536 });

    expect(results.map(({ place }) => place.id)).toEqual(["food", "beach"]);
    expect(results[0]?.distanceMeters).toBe(0);
    expect(results[1]?.distanceMeters).toBeGreaterThan(0);
  });

  it("preserva a ordem original quando não há coordenadas da hospedagem", () => {
    expect(filterPlaces(places, {}).map(({ place }) => place.id)).toEqual(["beach", "food"]);
  });

  it("não aplica distância sem coordenada da hospedagem", () => {
    expect(filterPlaces(places, { maximumDistanceMeters: 3_000 })).toEqual([]);
  });

  it("aceita somente as opções de distância publicadas", () => {
    expect(parseMaximumDistance("3")).toBe(3_000);
    expect(parseMaximumDistance("2")).toBeUndefined();
  });
});
