import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import { closeDatabase, getDatabase } from "./client";
import { DrizzlePlaceRepository } from "./place-repository";
import { places } from "./schema";

const database = getDatabase();
const destinationId = `test-${randomUUID()}`;
const now = new Date("2026-08-11T00:00:00Z");

beforeAll(async () => {
  await database.insert(places).values([
    {
      id: randomUUID(),
      destinationId,
      slug: "lugar-com-faixa",
      name: "Lugar com faixa",
      summary: "Lugar publicado com uma faixa qualitativa aproximada para teste.",
      category: "gastronomy",
      latitude: -6.23,
      longitude: -35.05,
      priceRange: "moderate",
      publicationStatus: "published",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      destinationId,
      slug: "lugar-sem-faixa",
      name: "Lugar sem faixa",
      summary: "Lugar publicado sem informação de preço para preservar o estado desconhecido.",
      category: "nature",
      latitude: -6.24,
      longitude: -35.04,
      priceRange: null,
      publicationStatus: "published",
      createdAt: now,
      updatedAt: now,
    },
  ]);
});

afterAll(async () => {
  await database.delete(places).where(eq(places.destinationId, destinationId));
  await closeDatabase();
});

describe("DrizzlePlaceRepository", () => {
  it("mapeia Price Range qualitativo e omite o estado desconhecido", async () => {
    const result = await new DrizzlePlaceRepository().listPublished({ destinationId });

    expect(result.find((place) => place.slug === "lugar-com-faixa")?.priceRange).toBe("moderate");
    expect(result.find((place) => place.slug === "lugar-sem-faixa")).not.toHaveProperty(
      "priceRange",
    );
  });

  it("carrega o catálogo curado de Pipa com cobertura nas quatro categorias", async () => {
    const result = await new DrizzlePlaceRepository().listPublished({
      destinationId: "pipa-rn-br",
    });
    const slugs = result.map((place) => place.slug);
    const countsByCategory = result.reduce<Record<string, number>>((counts, place) => {
      counts[place.category] = (counts[place.category] ?? 0) + 1;
      return counts;
    }, {});

    expect(result).toHaveLength(13);
    expect(new Set(slugs).size).toBe(result.length);
    expect(countsByCategory).toEqual({
      beach: 3,
      gastronomy: 4,
      nature: 3,
      nightlife: 3,
    });
    expect(slugs).toEqual(
      expect.arrayContaining([
        "praia-do-amor",
        "praia-do-centro",
        "praia-do-madeiro",
        "baia-dos-golfinhos",
        "chapadao-de-pipa",
        "santuario-ecologico-de-pipa",
        "centro-gastronomico-de-pipa",
        "camarao-na-fazenda-pipa",
        "atelier-de-massas",
        "o-tal-do-escondidinho",
        "avenida-baia-dos-golfinhos-noite",
        "mirante-sunset-bar",
        "agora-club",
      ]),
    );

    for (const place of result) {
      expect(place.publicationStatus).toBe("published");
      expect(place.latitude).toBeGreaterThanOrEqual(-90);
      expect(place.latitude).toBeLessThanOrEqual(90);
      expect(place.longitude).toBeGreaterThanOrEqual(-180);
      expect(place.longitude).toBeLessThanOrEqual(180);
    }
  });
});
