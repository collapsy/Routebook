import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import type { ExternalPlaceCandidate } from "@routebook/place-catalog";

import { closeDatabase, getDatabase } from "./client";
import { promoteExternalPlaceCandidate } from "./place-promotion-service";
import { placeExternalReferences, places } from "./schema";

const database = getDatabase();
const destinationId = `promotion-${randomUUID()}`;
const otherDestinationId = `promotion-other-${randomUUID()}`;
const existingPlaceId = randomUUID();
let globalPlaceId: string | undefined;
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
  if (globalPlaceId) await database.delete(places).where(eq(places.id, globalPlaceId));
  await database.delete(places).where(eq(places.destinationId, destinationId));
  await database.delete(places).where(eq(places.destinationId, otherDestinationId));
  await closeDatabase();
});

describe("promoteExternalPlaceCandidate", () => {
  it("promove candidato novo como draft e persiste a referência externa", async () => {
    const result = await promoteExternalPlaceCandidate({
      destinationId,
      candidate: candidate(),
      promotedAt: now,
    });
    expect(result).toMatchObject({ status: "created", publicationStatus: "draft" });

    const [place] = await database
      .select()
      .from(places)
      .where(eq(places.id, result.placeId))
      .limit(1);
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
    const idempotentCandidate = candidate({
      externalId: "idempotent-gers",
      name: "Lugar Idempotente",
      latitude: -6.31,
      longitude: -35.08,
    });
    const first = await promoteExternalPlaceCandidate({
      destinationId,
      candidate: idempotentCandidate,
      promotedAt: now,
    });
    const repeated = await promoteExternalPlaceCandidate({
      destinationId,
      candidate: idempotentCandidate,
      promotedAt: new Date("2026-08-15T15:45:00.000Z"),
    });

    expect(first.status).toBe("created");
    expect(repeated).toMatchObject({
      status: "existing",
      placeId: first.placeId,
      slug: first.slug,
      publicationStatus: "draft",
    });
  });

  it("serializa promoções concorrentes da mesma identidade externa", async () => {
    const concurrentCandidate = candidate({
      externalId: "concurrent-identity",
      name: "Lugar Concorrente",
      latitude: -6.35,
      longitude: -35.12,
    });

    const results = await Promise.all([
      promoteExternalPlaceCandidate({
        destinationId,
        candidate: concurrentCandidate,
        promotedAt: now,
      }),
      promoteExternalPlaceCandidate({
        destinationId,
        candidate: concurrentCandidate,
        promotedAt: new Date("2026-08-15T15:45:00.000Z"),
      }),
    ]);

    expect(results.map((result) => result.status).sort()).toEqual(["created", "existing"]);
    expect(new Set(results.map((result) => result.placeId))).toHaveSize(1);
  });

  it("reutiliza a mesma external identity global entre Viagens/Destinations", async () => {
    const sharedIdentity = candidate({
      externalId: "cross-destination-identity",
      name: "Lugar com identidade global",
      latitude: -6.32,
      longitude: -35.09,
    });
    const first = await promoteExternalPlaceCandidate({
      destinationId,
      candidate: sharedIdentity,
      promotedAt: now,
    });

    await expect(
      promoteExternalPlaceCandidate({
        destinationId: otherDestinationId,
        candidate: sharedIdentity,
        promotedAt: new Date("2026-08-15T15:50:00.000Z"),
      }),
    ).resolves.toMatchObject({
      status: "existing",
      placeId: first.placeId,
    });
  });

  it("materializa candidato zero-seed como Place global sem publicação", async () => {
    const result = await promoteExternalPlaceCandidate({
      candidate: candidate({
        externalId: "global-zero-seed",
        name: "Lugar Global Descoberto",
        latitude: -27.5949,
        longitude: -48.5482,
      }),
      promotedAt: now,
    });
    globalPlaceId = result.placeId;

    const [place] = await database
      .select()
      .from(places)
      .where(eq(places.id, result.placeId))
      .limit(1);
    expect(place).toMatchObject({ destinationId: null, publicationStatus: "draft" });
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
    ).rejects.toMatchObject({
      code: "possible-match",
      matchedPlaceId: existingPlaceId,
    });
  });

  it("rejeita candidato sem categoria canônica", async () => {
    const { category: _category, ...unsupportedCandidate } = candidate({
      externalId: "unsupported-gers",
      providerCategory: "pet_store",
    });
    void _category;

    await expect(
      promoteExternalPlaceCandidate({
        destinationId,
        candidate: unsupportedCandidate,
        promotedAt: now,
      }),
    ).rejects.toMatchObject({ code: "candidate-rejected" });
  });
});
