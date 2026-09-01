import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";

import {
  createRecommendation,
  invalidateRecommendation,
  presentRecommendation,
  RecommendationRepositoryError,
  rejectRecommendation,
  type Recommendation,
} from "@routebook/decision-intelligence";
import { createPlace } from "@routebook/place-catalog";
import { createTrip } from "@routebook/trip-management";

import { closeDatabase, getDatabase } from "./client";
import { DrizzleRecommendationRepository } from "./recommendation-repository";
import { places, recommendations, trips } from "./schema";
import { DrizzleTripRepository } from "./trip-repository";

afterAll(async () => {
  await closeDatabase();
});

function buildRecommendation(
  tripId: string,
  destinationId: string,
  placeId: string,
  generatedAt: Date,
  overrides: Partial<{
    id: string;
    tripContextVersion: number;
  }> = {},
): Recommendation {
  return createRecommendation({
    id: overrides.id ?? randomUUID(),
    snapshot: {
      schemaVersion: 1,
      tripId,
      destinationId,
      tripContextVersion: overrides.tripContextVersion ?? 1,
      travelerProfileVersion: 2,
      itineraryVersion: 3,
      capturedAt: generatedAt,
    },
    target: {
      kind: "place",
      placeId,
      destinationId,
      publicationStatus: "published",
    },
    reasons: [
      {
        code: "interest-category-match",
        message: "A categoria corresponde a um interesse conhecido.",
        evidence: { category: "beach" },
      },
    ],
    limitations: [
      {
        code: "opening-hours-unavailable",
        message: "O horário de funcionamento não está disponível.",
      },
    ],
    score: { value: 130, purpose: "ordering-only" },
    confidence: {
      level: "high",
      basis: ["interesses compatíveis", "distância geodésica disponível"],
    },
    validity: {
      validFrom: generatedAt,
      expiresAt: new Date(generatedAt.getTime() + 86_400_000),
    },
    generation: {
      generator: "deterministic",
      policyVersion: "place-ranking-v1",
      generatedAt,
    },
  });
}

async function createFixture(publicationStatus: "published" | "draft" = "published") {
  const trip = createTrip({
    name: "Persistência de Recommendations",
    destination: {
      name: "Pipa, Tibau do Sul - RN",
      type: "district",
      countryCode: "BR",
      latitude: -6.2302,
      longitude: -35.0503,
      timeZone: "America/Fortaleza",
    },
    startDate: "2026-08-22",
    endDate: "2026-08-24",
    ownerName: "RouteBook QA",
  });
  const destinationId = `destination-${trip.id}`;
  const place = createPlace({
    destinationId,
    slug: `place-${trip.id.slice(0, 8)}`,
    name: "Lugar recomendado",
    summary: "Lugar publicado exclusivamente para testar Recommendations persistidas.",
    category: "beach",
    latitude: -6.228,
    longitude: -35.048,
    publicationStatus,
  });

  await new DrizzleTripRepository().create(trip);
  await getDatabase().insert(places).values(place);
  return { trip, place, destinationId };
}

async function cleanup(tripId: string, placeId: string) {
  const database = getDatabase();
  await database.delete(trips).where(eq(trips.id, tripId));
  await database.delete(places).where(eq(places.id, placeId));
}

describe("DrizzleRecommendationRepository", () => {
  it("preserva snapshot, motivos, limitações, score, confiança e rejeição no round trip", async () => {
    const fixture = await createFixture();
    const repository = new DrizzleRecommendationRepository();
    const generatedAt = new Date("2026-07-30T20:00:00.000Z");

    try {
      const generated = buildRecommendation(
        fixture.trip.id,
        fixture.destinationId,
        fixture.place.id,
        generatedAt,
      );
      await repository.saveGenerated(generated);
      const presented = presentRecommendation(generated, new Date("2026-07-30T20:01:00.000Z"));
      await repository.save(presented);
      const rejected = rejectRecommendation(presented, new Date("2026-07-30T20:02:00.000Z"));
      await repository.save(rejected);

      const persisted = await repository.findById(fixture.trip.id, generated.id);
      expect(persisted).toEqual(rejected);
      expect(persisted?.reasons).toEqual(generated.reasons);
      expect(persisted?.limitations).toEqual(generated.limitations);
      expect(persisted?.score).toEqual({ value: 130, purpose: "ordering-only" });
      expect(persisted?.confidence.level).toBe("high");
    } finally {
      await cleanup(fixture.trip.id, fixture.place.id);
    }
  });

  it("reutiliza uma avaliação ativa equivalente e permite supersession explícita", async () => {
    const fixture = await createFixture();
    const repository = new DrizzleRecommendationRepository();

    try {
      const first = buildRecommendation(
        fixture.trip.id,
        fixture.destinationId,
        fixture.place.id,
        new Date("2026-07-30T20:00:00.000Z"),
      );
      const equivalent = buildRecommendation(
        fixture.trip.id,
        fixture.destinationId,
        fixture.place.id,
        new Date("2026-07-30T21:00:00.000Z"),
      );

      expect(await repository.saveGenerated(first)).toEqual(first);
      expect(await repository.saveGenerated(equivalent)).toEqual(first);
      expect(await repository.listByTripId(fixture.trip.id)).toHaveLength(1);

      const replacement = await repository.saveGenerated(equivalent, "supersede-active");
      expect(replacement).toEqual(equivalent);

      const persisted = await repository.listByTripId(fixture.trip.id);
      expect(persisted).toHaveLength(2);
      expect(persisted[0]).toMatchObject({
        id: first.id,
        status: "superseded",
        supersededByRecommendationId: equivalent.id,
      });
      expect(persisted[1]).toMatchObject({ id: equivalent.id, status: "generated" });
    } finally {
      await cleanup(fixture.trip.id, fixture.place.id);
    }
  });

  it("isola leituras por TripId e persiste invalidação por mudança de contexto", async () => {
    const fixture = await createFixture();
    const otherTrip = createTrip({
      name: "Outra Viagem",
      destination: {
        name: "Pipa, Tibau do Sul - RN",
        type: "district",
        countryCode: "BR",
        latitude: -6.2302,
        longitude: -35.0503,
        timeZone: "America/Fortaleza",
      },
      startDate: "2026-09-01",
      endDate: "2026-09-02",
      ownerName: "RouteBook QA",
    });
    const repository = new DrizzleRecommendationRepository();

    try {
      await new DrizzleTripRepository().create(otherTrip);
      const generated = buildRecommendation(
        fixture.trip.id,
        fixture.destinationId,
        fixture.place.id,
        new Date("2026-07-30T20:00:00.000Z"),
      );
      await repository.saveGenerated(generated);
      const invalidated = invalidateRecommendation(
        generated,
        "trip-context-version-changed",
        new Date("2026-07-30T20:01:00.000Z"),
      );
      await repository.save(invalidated);

      expect(await repository.findById(otherTrip.id, generated.id)).toBeNull();
      expect(await repository.findById(fixture.trip.id, generated.id)).toEqual(invalidated);
    } finally {
      await getDatabase().delete(trips).where(eq(trips.id, otherTrip.id));
      await cleanup(fixture.trip.id, fixture.place.id);
    }
  });

  it("rejeita Lugar não publicado e Destino incompatível", async () => {
    const draftFixture = await createFixture("draft");
    const repository = new DrizzleRecommendationRepository();

    try {
      const draftRecommendation = buildRecommendation(
        draftFixture.trip.id,
        draftFixture.destinationId,
        draftFixture.place.id,
        new Date("2026-07-30T20:00:00.000Z"),
      );
      await expect(repository.saveGenerated(draftRecommendation)).rejects.toMatchObject({
        code: "place-not-published",
      } satisfies Partial<RecommendationRepositoryError>);

      const wrongDestination = buildRecommendation(
        draftFixture.trip.id,
        "another-destination",
        draftFixture.place.id,
        new Date("2026-07-30T20:00:00.000Z"),
      );
      await expect(repository.saveGenerated(wrongDestination)).rejects.toMatchObject({
        code: "place-not-published",
      } satisfies Partial<RecommendationRepositoryError>);
    } finally {
      await cleanup(draftFixture.trip.id, draftFixture.place.id);
    }

    const publishedFixture = await createFixture();
    try {
      const wrongDestination = buildRecommendation(
        publishedFixture.trip.id,
        "another-destination",
        publishedFixture.place.id,
        new Date("2026-07-30T20:00:00.000Z"),
      );
      await expect(repository.saveGenerated(wrongDestination)).rejects.toMatchObject({
        code: "destination-mismatch",
      } satisfies Partial<RecommendationRepositoryError>);
    } finally {
      await cleanup(publishedFixture.trip.id, publishedFixture.place.id);
    }
  });

  it("acompanha a cascata da Trip e restringe a exclusão do Place enquanto referenciado", async () => {
    const fixture = await createFixture();
    const repository = new DrizzleRecommendationRepository();
    const database = getDatabase();

    const recommendation = buildRecommendation(
      fixture.trip.id,
      fixture.destinationId,
      fixture.place.id,
      new Date("2026-07-30T20:00:00.000Z"),
    );
    await repository.saveGenerated(recommendation);

    await expect(database.delete(places).where(eq(places.id, fixture.place.id))).rejects.toThrow();
    await database.delete(trips).where(eq(trips.id, fixture.trip.id));
    expect(
      await database
        .select({ id: recommendations.id })
        .from(recommendations)
        .where(
          and(
            eq(recommendations.tripId, fixture.trip.id),
            eq(recommendations.id, recommendation.id),
          ),
        ),
    ).toEqual([]);
    await database.delete(places).where(eq(places.id, fixture.place.id));
  });
});
