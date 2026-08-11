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
});
