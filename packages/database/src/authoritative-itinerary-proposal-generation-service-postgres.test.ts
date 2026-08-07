import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import { closeDatabase, getDatabase } from "./client";
import { createPostgresAuthoritativeItineraryProposalGenerationService } from "./authoritative-itinerary-proposal-generation-service";
import { DrizzleItineraryProposalRepository } from "./proposal-repository";
import { itineraries, itineraryDays, places, recommendations, trips } from "./schema";

const database = getDatabase();
const tripId = randomUUID();
const itineraryId = randomUUID();
const dayId = randomUUID();
const placeId = randomUUID();
const recommendationId = randomUUID();
const proposalId = randomUUID();
const proposedActivityId = randomUUID();
const requestedAt = new Date("2026-08-07T10:00:00.000Z");
const startedAt = new Date("2026-08-07T10:00:01.000Z");
const generatedAt = new Date("2026-08-07T10:00:02.000Z");
const failedAt = new Date("2026-08-07T10:00:03.000Z");
const asOf = new Date("2026-08-07T10:00:00.000Z");

beforeAll(async () => {
  await database.insert(trips).values({
    id: tripId,
    accountId: null,
    name: "Viagem para geração autoritativa",
    destinationName: "Pipa",
    destinationType: "city",
    countryCode: "BR",
    latitude: "-6.2292",
    longitude: "-35.0486",
    timeZone: "America/Fortaleza",
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    accommodationName: "Condomínio Solar Água",
    accommodationAddress: "Pipa, Tibau do Sul - RN",
    accommodationLatitude: -6.2301,
    accommodationLongitude: -35.049,
    status: "planning",
    participants: [],
    contextVersion: 4,
    createdAt: requestedAt,
    updatedAt: requestedAt,
  });
  await database.insert(itineraries).values({
    id: itineraryId,
    tripId,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    timeZone: "America/Fortaleza",
    version: 7,
    createdAt: requestedAt,
    updatedAt: requestedAt,
  });
  await database.insert(itineraryDays).values({
    id: dayId,
    itineraryId,
    date: "2026-08-22",
    position: 1,
  });
  await database.insert(places).values({
    id: placeId,
    destinationId: "pipa-rn",
    slug: `praia-do-amor-${placeId}`,
    name: "Praia do Amor",
    summary: "Praia com falésias e ondas.",
    category: "beach",
    latitude: -6.235,
    longitude: -35.045,
    addressLabel: "Pipa, Tibau do Sul - RN",
    publicationStatus: "published",
    createdAt: requestedAt,
    updatedAt: requestedAt,
  });
  await database.insert(recommendations).values({
    id: recommendationId,
    tripId,
    placeId,
    status: "presented",
    contextSnapshot: { schemaVersion: 1, tripId },
    contextFingerprint: "c".repeat(64),
    reasons: [{ code: "scenic", message: "Boa opção para o roteiro.", evidence: {} }],
    limitations: [],
    score: 0.9,
    confidenceLevel: "high",
    confidenceBasis: ["published-place"],
    validFrom: new Date("2026-08-07T09:00:00.000Z"),
    expiresAt: new Date("2026-08-08T09:00:00.000Z"),
    generator: "deterministic",
    policyVersion: "rb-inc-099",
    generatedAt: new Date("2026-08-07T09:00:00.000Z"),
    presentedAt: new Date("2026-08-07T09:10:00.000Z"),
    resolvedAt: null,
    linkedDecisionId: null,
    statusReason: null,
    supersededByRecommendationId: null,
    createdAt: requestedAt,
    updatedAt: requestedAt,
  });
});

afterAll(async () => {
  await database.delete(trips).where(eq(trips.id, tripId));
  await database.delete(places).where(eq(places.id, placeId));
  await closeDatabase();
});

describe("createPostgresAuthoritativeItineraryProposalGenerationService", () => {
  it("compõe contexto, generator e repository PostgreSQL no lifecycle completo", async () => {
    const service = createPostgresAuthoritativeItineraryProposalGenerationService(database);

    const result = await service.generate({
      request: {
        id: proposalId,
        tripId,
        itineraryId,
        baseTripContextVersion: 4,
        baseItineraryVersion: 7,
        contextSnapshotId: `authoritative:${tripId}:4:7`,
        requestedAt,
      },
      startedAt,
      failedAt,
      asOf,
      generatedAt,
      createProposedActivityId: () => proposedActivityId,
    });

    expect(result).toMatchObject({
      id: proposalId,
      tripId,
      itineraryId,
      status: "ready",
      generationMethod: "deterministic-candidate-balancing",
      generationVersion: "1",
      proposedActivities: [
        expect.objectContaining({
          proposedActivityId,
          targetTripDayId: dayId,
          placeId,
          title: "Praia do Amor",
          operationType: "add",
        }),
      ],
    });

    const persisted = await new DrizzleItineraryProposalRepository(database).findById(
      tripId,
      proposalId,
    );
    expect(persisted).toEqual(result);
  });

  it("preserva códigos estáveis do contexto autoritativo", async () => {
    const service = createPostgresAuthoritativeItineraryProposalGenerationService(database);

    await expect(
      service.generate({
        request: {
          id: randomUUID(),
          tripId: randomUUID(),
          itineraryId: randomUUID(),
          baseTripContextVersion: 1,
          baseItineraryVersion: 1,
          contextSnapshotId: "missing-trip",
          requestedAt,
        },
        startedAt,
        failedAt,
        asOf,
        generatedAt,
        createProposedActivityId: () => randomUUID(),
      }),
    ).rejects.toMatchObject({
      name: "PostgresAuthoritativeItineraryProposalGenerationContextError",
      code: "trip-not-found",
    });
  });
});
