import { describe, expect, it } from "vitest";

import type { Place } from "@routebook/place-catalog";

import { filterPlaces, listAvailablePlaceCategories, parseMaximumDistance } from "./filters";

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
  {
    id: "attraction",
    destinationId: "florianopolis-sc-br",
    slug: "projeto-tamar",
    name: "Projeto Tamar",
    summary: "Ponto turístico voltado à conservação marinha e à visitação educativa.",
    category: "attraction",
    latitude: -27.5747,
    longitude: -48.4242,
    priceRange: "moderate",
    publicationStatus: "published",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "viewpoint",
    destinationId: "florianopolis-sc-br",
    slug: "mirante-da-lagoa",
    name: "Mirante da Lagoa",
    summary: "Mirante com vista panorâmica usado como parada rápida durante a viagem.",
    category: "viewpoint",
    latitude: -27.601,
    longitude: -48.468,
    priceRange: "free",
    publicationStatus: "published",
    createdAt: now,
    updatedAt: now,
  },
];

describe("listAvailablePlaceCategories", () => {
  it("retorna somente categorias presentes, sem duplicar e na ordem canônica", () => {
    expect(
      listAvailablePlaceCategories([
        "viewpoint",
        "nightlife",
        "gastronomy",
        "gastronomy",
        "attraction",
        "nature",
      ]),
    ).toEqual(["gastronomy", "nature", "nightlife", "attraction", "viewpoint"]);
  });

  it("não oferece praia quando a cobertura da viagem não possui beach", () => {
    expect(listAvailablePlaceCategories(["gastronomy", "nature", "nightlife"])).toEqual([
      "gastronomy",
      "nature",
      "nightlife",
    ]);
  });

  it("inclui as categorias novas somente quando a cobertura real as contém", () => {
    expect(
      listAvailablePlaceCategories([undefined, "beach", "attraction", "viewpoint"]),
    ).toEqual(["beach", "attraction", "viewpoint"]);
  });
});

describe("filterPlaces", () => {
  it("pesquisa sem diferenciar acentos e preserva filtros combinados", () => {
    expect(
      filterPlaces(places, { search: "gastronomico", priceRange: "moderate" }).map(
        ({ place }) => place.id,
      ),
    ).toEqual(["food"]);
  });

  it("encontra Pontos turísticos e Mirantes pelos rótulos das categorias", () => {
    expect(filterPlaces(places, { search: "pontos turisticos" }).map(({ place }) => place.id)).toEqual([
      "attraction",
    ]);
    expect(filterPlaces(places, { search: "mirantes" }).map(({ place }) => place.id)).toEqual([
      "viewpoint",
    ]);
  });

  it("filtra diretamente as novas categorias", () => {
    expect(filterPlaces(places, { category: "attraction" }).map(({ place }) => place.id)).toEqual([
      "attraction",
    ]);
    expect(filterPlaces(places, { category: "viewpoint" }).map(({ place }) => place.id)).toEqual([
      "viewpoint",
    ]);
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
    const results = filterPlaces(places.slice(0, 2), {}, {
      latitude: -6.2297,
      longitude: -35.0536,
    });

    expect(results.map(({ place }) => place.id)).toEqual(["food", "beach"]);
    expect(results[0]?.distanceMeters).toBe(0);
    expect(results[1]?.distanceMeters).toBeGreaterThan(0);
  });

  it("preserva a ordem original quando não há coordenadas da hospedagem", () => {
    expect(filterPlaces(places, {}).map(({ place }) => place.id)).toEqual([
      "beach",
      "food",
      "attraction",
      "viewpoint",
    ]);
  });

  it("não aplica distância sem coordenada da hospedagem", () => {
    expect(filterPlaces(places, { maximumDistanceMeters: 3_000 })).toEqual([]);
  });

  it("aceita somente as opções de distância publicadas", () => {
    expect(parseMaximumDistance("3")).toBe(3_000);
    expect(parseMaximumDistance("2")).toBeUndefined();
  });
});
