import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import { closeDatabase, getDatabase } from "./client";
import { DrizzlePlaceExternalReferenceRepository } from "./place-external-reference-repository";
import { places } from "./schema";

const database = getDatabase();
const placeId = randomUUID();
const destinationId = `external-ref-${randomUUID()}`;
const now = new Date("2026-08-15T15:30:00.000Z");

beforeAll(async () => {
  await database.insert(places).values({
    id: placeId,
    destinationId,
    slug: "lugar-referencia-externa",
    name: "Lugar Referência Externa",
    summary: "Fixture de integração para vínculo de identidade externa de um Place.",
    category: "nature",
    latitude: -6.23,
    longitude: -35.05,
    publicationStatus: "draft",
    createdAt: now,
    updatedAt: now,
  });
});

afterAll(async () => {
  await database.delete(places).where(eq(places.id, placeId));
  await closeDatabase();
});

describe("DrizzlePlaceExternalReferenceRepository", () => {
  it("persiste e recupera Provenance pela identidade externa", async () => {
    const repository = new DrizzlePlaceExternalReferenceRepository();
    const created = await repository.create({
      placeId,
      provider: "overture",
      externalId: "gers-reference-fixture",
      sourceLicense: "Apache-2.0",
      sourceUrl: "https://overturemaps.org/",
      collectedAt: now,
      now,
    });

    const loaded = await repository.findByExternalIdentity("overture", "gers-reference-fixture");

    expect(loaded).toEqual(created);
    expect(loaded).toMatchObject({
      placeId,
      provider: "overture",
      externalId: "gers-reference-fixture",
      sourceLicense: "Apache-2.0",
      sourceUrl: "https://overturemaps.org/",
    });
  });

  it("impede duas referências para a mesma identidade do Provider", async () => {
    const repository = new DrizzlePlaceExternalReferenceRepository();
    await repository.create({
      placeId,
      provider: "overture",
      externalId: "unique-external-fixture",
      sourceLicense: "Apache-2.0",
      collectedAt: now,
      now,
    });

    await expect(
      repository.create({
        placeId,
        provider: "overture",
        externalId: "unique-external-fixture",
        sourceLicense: "Apache-2.0",
        collectedAt: now,
        now,
      }),
    ).rejects.toThrow();
  });
});
