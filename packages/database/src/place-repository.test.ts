import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import { closeDatabase, getDatabase } from "./client";
import { DrizzlePlaceRepository } from "./place-repository";
import { places } from "./schema";

const database = getDatabase();
const destinationId = `test-${randomUUID()}`;
const now = new Date("2026-08-11T00:00:00Z");
const primaryImage = {
  assetPath: "/place-images/tests/lugar-com-faixa.webp",
  altText: "Imagem de teste de um lugar gastronômico.",
  sourceName: "Fixture RouteBook",
  sourceUrl: "https://example.com/fixture",
  license: "fixture de teste",
  attribution: "Imagem de teste",
};

const baselinePipaSlugs = [
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
] as const;

const expandedPipaSlugs = [
  "praia-das-minas",
  "praia-de-cacimbinhas",
  "praia-de-sibauma",
  "praia-de-tibau-do-sul",
  "caxanga-restaurante",
  "macoco-cozinha-artesanal",
  "aprecie-restaurante",
  "el-farolito",
  "moka-cafes-especiais",
  "caju-cafeteria",
  "sorveteria-real-de-14",
  "pipa-beach-club",
  "lagoa-de-guarairas",
  "tribus-in-pipa",
  "bakana",
  "birring-in-paradise",
  "umi-bar",
] as const;

const curatedPipaImages = {
  "praia-do-amor": "/place-images/pipa/praia-do-amor.jpg",
  "baia-dos-golfinhos": "/place-images/pipa/baia-dos-golfinhos.jpg",
  "chapadao-de-pipa": "/place-images/pipa/chapadao-de-pipa.jpg",
  "praia-do-centro": "/place-images/pipa/praia-do-centro.jpg",
  "praia-do-madeiro": "/place-images/pipa/praia-do-madeiro.jpg",
  "santuario-ecologico-de-pipa": "/place-images/pipa/santuario-ecologico-de-pipa.jpg",
  "praia-de-cacimbinhas": "/place-images/pipa/praia-de-cacimbinhas.jpg",
  "praia-de-tibau-do-sul": "/place-images/pipa/praia-de-tibau-do-sul.jpg",
  "lagoa-de-guarairas": "/place-images/pipa/lagoa-de-guarairas.jpg",
} as const;

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
      primaryImage,
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
      primaryImage: null,
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

  it("mapeia imagem principal governada e omite imagem ausente", async () => {
    const repository = new DrizzlePlaceRepository();
    const withImage = await repository.findPublishedBySlug(destinationId, "lugar-com-faixa");
    const withoutImage = await repository.findPublishedBySlug(destinationId, "lugar-sem-faixa");

    expect(withImage?.primaryImage).toEqual(primaryImage);
    expect(withoutImage).not.toHaveProperty("primaryImage");
  });

  it("carrega o catálogo curado expandido de Pipa com cobertura nas quatro categorias", async () => {
    const result = await new DrizzlePlaceRepository().listPublished({
      destinationId: "pipa-rn-br",
    });
    const slugs = result.map((place) => place.slug);
    const countsByCategory = result.reduce<Record<string, number>>((counts, place) => {
      counts[place.category] = (counts[place.category] ?? 0) + 1;
      return counts;
    }, {});

    expect(result).toHaveLength(30);
    expect(new Set(slugs).size).toBe(result.length);
    expect(countsByCategory).toEqual({
      beach: 7,
      gastronomy: 12,
      nature: 4,
      nightlife: 7,
    });
    expect(slugs).toEqual(expect.arrayContaining([...baselinePipaSlugs, ...expandedPipaSlugs]));

    for (const place of result) {
      expect(place.publicationStatus).toBe("published");
      expect(place.latitude).toBeGreaterThanOrEqual(-90);
      expect(place.latitude).toBeLessThanOrEqual(90);
      expect(place.longitude).toBeGreaterThanOrEqual(-180);
      expect(place.longitude).toBeLessThanOrEqual(180);
    }
  });

  it("carrega nove imagens curadas de Pipa e mantém fallback quando a mídia não é segura", async () => {
    const result = await new DrizzlePlaceRepository().listPublished({
      destinationId: "pipa-rn-br",
    });
    const withImages = result.filter((place) => place.primaryImage);

    expect(withImages).toHaveLength(9);
    for (const [slug, assetPath] of Object.entries(curatedPipaImages)) {
      const place = result.find((candidate) => candidate.slug === slug);
      expect(place?.primaryImage).toMatchObject({
        assetPath,
        sourceName: "Wikimedia Commons",
      });
      expect(place?.primaryImage?.sourceUrl).toMatch(
        /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/,
      );
      expect(place?.primaryImage?.license).toMatch(/^CC BY-SA /);
      expect(place?.primaryImage?.attribution).toBeTruthy();
    }

    expect(result.find((place) => place.slug === "praia-de-sibauma")).not.toHaveProperty(
      "primaryImage",
    );
    expect(result.find((place) => place.slug === "praia-das-minas")).not.toHaveProperty(
      "primaryImage",
    );
  });
});
