import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import type { ExternalPlaceCandidate } from "@routebook/place-catalog";

import { closeDatabase, getDatabase } from "./client";
import {
  PlacePromotionServiceError,
  promoteExternalPlaceCandidate,
} from "./place-promotion-service";
import { placeExternalReferences, places } from "./schema";

const database = getDatabase();
const destinationId = `promotion-${randomUUID()}`;
const existingPlaceId = randomUUID();
const now = new Date("2026-08-15T15:40:00.000Z");

function candidate(overrides: Partial<ExternalPlaceCandidate> = {}): ExternalPlaceCandidate {
  return {
    provider: "overture",
    externalId: "new-gers-fixture",
    name: "Mirante Descoberto",
    latitude: -6.18,
    longitude: -35.1,
    providerCategory: "scenic_viewpoint",
    providerCategoryHierarchy: ["attractions_and_activities", "scenic_viewpoint"],
    category: "nature",
    sourceUrl: "https://overturemaps.org/",
    sourceLicense: "Apache-2.0",
    collectedAt: now,
    confidence: 0.97,
    ...overrides,
  };
}

beforeAll(async () => {
  await database.insert(places).values({
    id: existingPlaceId,
    destinationId,
    slug: "praia-conhecida",
    name: "Praia Conhecida",
    summary: "Place canônico usado para comprovar o bloqueio de uma provável duplicata.",
    category: "beach",
    latitude: -6.231,
    longitude: -35.051,
    publicationStatus: "published",
    createdAt: now,
    updatedAt: now,
  });
});

afterAll(async () => {
  await database.delete(places).where(eq(places.destinationId, destinationId));
  await closeDatabase();
});

describe("promoteExternalPlaceCandidate", () => {
  it("promove candidato novo como draft e persiste a referência externa", async () => {
    const result = await promoteExternalPlaceCandidate({ destinationId, candidate: candidate(), promotedAt: now });

    expect(result).toMatchObject({ status: "created", publicationStatus: "draft" });

    const [place] = await database.select().from(places).where(eq(places.id, result.placeId)).limit(1);
    const [reference] = await database
      .select()
      .from(placeExternalReferences)
      .where(eq(placeExternalReferences.placeId, result.placeId))
      .limit(1);

    expect(place).toMatchObject({
      destinationId,
      slug: "mirante-descoberto",
      name: "Mirante Descoberto",
      category: "nature",
      publicationStatus: "draft",
    });
    expect(reference).toMatchObject({
      provider: "overture",
      externalId: "new-gers-fixture",
      sourceLicense: "Apache-2.0",
    });
  });

  it("é idempotente para a mesma identidade externa", async () => {
    const first = await promoteExternalPlaceCandidate({
      destinationId,
      candidate: candidate({ externalId: "idempotent-gers", name: "Lugar Idempotente" }),
      promotedAt: now,
    });
    const repeated = await promoteExternalPlaceCandidate({
      destinationId,
      candidate: candidate({ externalId: "idempotent-gers", name: "Lugar Idempotente" }),
      promotedAt: new Date("2026-08-15T15:45:00.000Z"),
    });

    expect(first.status).toBe("created");
    expect(repeated).toMatchObject({ status: "existing", placeId: first.placeId, slug: first.slug });
  });

  it("bloqueia possível duplicata em vez de criar outro Place", async () => {
    await expect(
      promoteExternalPlaceCandidate({
        destinationId,
        candidate: candidate({
          externalId: "duplicate-gers",
          name: "Praia Conhecida",
          providerCategory: "beach",
          providerCategoryHierarchy: ["attractions_and_activities", "beach"],
          category: "beach",
          latitude: -6.2311,
          longitude: -35.0511,
        }),
        promotedAt: now,
      }),
    ).rejects.toMatchObject<Partial<PlacePromotionServiceError>>({
      code: "possible-match",
      matchedPlaceId: existingPlaceId,
    });
  });

  it("rejeita candidato sem categoria canônica", async () => {
    await expect(
      promoteExternalPlaceCandidate({
        destinationId,
        candidate: candidate({
          externalId: "unsupported-gers",
          providerCategory: "pet_store",
          category: undefined,
        }),
        promotedAt: now,
      }),
    ).rejects.toMatchObject<Partial<PlacePromotionServiceError>>({ code: "candidate-rejected" });
  });
});
