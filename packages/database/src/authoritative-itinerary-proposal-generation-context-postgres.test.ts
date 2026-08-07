import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { inArray } from "drizzle-orm";

import {
  PostgresAuthoritativeItineraryProposalGenerationContextError,
  createPostgresAuthoritativeItineraryProposalGenerationContextPort,
} from "./authoritative-itinerary-proposal-generation-context";
import { closeDatabase, getDatabase } from "./client";
import {
  itineraries,
  itineraryActivities,
  itineraryDays,
  places,
  recommendations,
  trips,
} from "./schema";

const database = getDatabase();
const now = new Date("2026-08-06T12:00:00.000Z");
const tripId = randomUUID();
const tripWithoutItineraryId = randomUUID();
const tripWithoutDaysId = randomUUID();
const itineraryId = randomUUID();
const itineraryWithoutDaysId = randomUUID();
const firstDayId = randomUUID();
const secondDayId = randomUUID();
const activityId = randomUUID();
const firstPlaceId = randomUUID();
const secondPlaceId = randomUUID();
const firstRecommendationId = randomUUID();
const secondRecommendationId = randomUUID();
const tripIds = [tripId, tripWithoutItineraryId, tripWithoutDaysId];
const placeIds = [firstPlaceId, secondPlaceId];

function tripRow(id: string, name: string) {
  return {
    id,
    accountId: null,
    name,
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
    contextVersion: 1,
    createdAt: now,
    updatedAt: now,
  };
}

beforeAll(async () => {
  await database
    .insert(trips)
    .values([
      tripRow(tripId, "Viagem com contexto"),
      tripRow(tripWithoutItineraryId, "Viagem sem itinerary"),
      tripRow(tripWithoutDaysId, "Viagem sem dias"),
    ]);
  await database.insert(places).values([
    {
      id: secondPlaceId,
      destinationId: "pipa-rn",
      slug: `praia-do-amor-${secondPlaceId}`,
      name: "Praia do Amor",
      summary: "Praia com falésias e ondas.",
      category: "beach",
      latitude: -6.235,
      longitude: -35.045,
      addressLabel: "Pipa, Tibau do Sul - RN",
      publicationStatus: "published",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: firstPlaceId,
      destinationId: "pipa-rn",
      slug: `baia-dos-golfinhos-${firstPlaceId}`,
      name: "Baía dos Golfinhos",
      summary: "Encontro com golfinhos em mar calmo.",
      category: "beach",
      latitude: -6.221,
      longitude: -35.046,
      addressLabel: "Pipa, Tibau do Sul - RN",
      publicationStatus: "published",
      createdAt: now,
      updatedAt: now,
    },
  ]);
  await database.insert(itineraries).values([
    {
      id: itineraryId,
      tripId,
      startDate: "2026-08-22",
      endDate: "2026-08-29",
      timeZone: "America/Fortaleza",
      version: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: itineraryWithoutDaysId,
      tripId: tripWithoutDaysId,
      startDate: "2026-08-22",
      endDate: "2026-08-29",
      timeZone: "America/Fortaleza",
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
  ]);
  await database.insert(itineraryDays).values([
    { id: secondDayId, itineraryId, date: "2026-08-23", position: 2 },
    { id: firstDayId, itineraryId, date: "2026-08-22", position: 1 },
  ]);
  await database.insert(itineraryActivities).values({
    id: activityId,
    itineraryDayId: firstDayId,
    title: "Check-in",
    type: "logistics",
    status: "planned",
    flexibility: "fixed",
    startTime: "14:00",
    durationMinutes: 60,
    order: 1,
    placeId: null,
    createdAt: now,
    updatedAt: now,
  });
  await database.insert(recommendations).values([
    {
      id: secondRecommendationId,
      tripId,
      placeId: secondPlaceId,
      status: "generated",
      contextSnapshot: { schemaVersion: 1, tripId },
      contextFingerprint: "b".repeat(64),
      reasons: [{ code: "scenic", message: "Boa opção para o segundo dia.", evidence: {} }],
      limitations: [],
      score: 0.8,
      confidenceLevel: "high",
      confidenceBasis: ["published-place"],
      validFrom: new Date("2026-08-06T11:00:00.000Z"),
      expiresAt: null,
      generator: "deterministic",
      policyVersion: "rb-inc-098",
      generatedAt: new Date("2026-08-06T11:00:00.000Z"),
      presentedAt: null,
      resolvedAt: null,
      linkedDecisionId: null,
      statusReason: null,
      supersededByRecommendationId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: firstRecommendationId,
      tripId,
      placeId: firstPlaceId,
      status: "presented",
      contextSnapshot: { schemaVersion: 1, tripId },
      contextFingerprint: "a".repeat(64),
      reasons: [{ code: "wildlife", message: "Chance de observar golfinhos.", evidence: {} }],
      limitations: [],
      score: 0.9,
      confidenceLevel: "high",
      confidenceBasis: ["published-place"],
      validFrom: new Date("2026-08-06T10:00:00.000Z"),
      expiresAt: new Date("2026-08-07T10:00:00.000Z"),
      generator: "deterministic",
      policyVersion: "rb-inc-098",
      generatedAt: new Date("2026-08-06T10:00:00.000Z"),
      presentedAt: new Date("2026-08-06T10:30:00.000Z"),
      resolvedAt: null,
      linkedDecisionId: null,
      statusReason: null,
      supersededByRecommendationId: null,
      createdAt: now,
      updatedAt: now,
    },
  ]);
});

afterAll(async () => {
  await database.delete(trips).where(inArray(trips.id, tripIds));
  await database.delete(places).where(inArray(places.id, placeIds));
  await closeDatabase();
});

describe("PostgresAuthoritativeItineraryProposalGenerationContextPort", () => {
  it("carrega um snapshot autoritativo e determinístico da Trip", async () => {
    const port = createPostgresAuthoritativeItineraryProposalGenerationContextPort(database);

    const context = await port.load({ tripId, asOf: now });

    expect(context.itinerary).toEqual({
      tripId,
      days: [
        {
          tripDayId: firstDayId,
          date: "2026-08-22",
          activities: [{ activityId }],
        },
        {
          tripDayId: secondDayId,
          date: "2026-08-23",
          activities: [],
        },
      ],
    });
    expect(
      context.recommendations.map((recommendation) => recommendation.recommendationId),
    ).toEqual([firstRecommendationId, secondRecommendationId]);
    expect(context.recommendations[0]).toMatchObject({
      tripId,
      placeId: firstPlaceId,
      status: "presented",
      score: 0.9,
      reason: "Chance de observar golfinhos.",
    });
    expect(context.places).toEqual(
      [...context.places].sort((left, right) => left.placeId.localeCompare(right.placeId)),
    );
    expect(context.places).toEqual(
      expect.arrayContaining([
        {
          placeId: firstPlaceId,
          title: "Baía dos Golfinhos",
          description: "Encontro com golfinhos em mar calmo.",
        },
        {
          placeId: secondPlaceId,
          title: "Praia do Amor",
          description: "Praia com falésias e ondas.",
        },
      ]),
    );
  });

  it("retorna códigos estáveis para Trip e Itinerary ausentes", async () => {
    const port = createPostgresAuthoritativeItineraryProposalGenerationContextPort(database);

    await expect(port.load({ tripId: randomUUID(), asOf: now })).rejects.toMatchObject({
      code: "trip-not-found",
    });
    await expect(port.load({ tripId: tripWithoutItineraryId, asOf: now })).rejects.toMatchObject({
      code: "itinerary-not-found",
    });
    await expect(port.load({ tripId: tripWithoutDaysId, asOf: now })).rejects.toMatchObject({
      code: "itinerary-days-not-found",
    });
  });

  it("rejeita entradas inválidas antes de consultar o PostgreSQL", async () => {
    const port = createPostgresAuthoritativeItineraryProposalGenerationContextPort(database);

    await expect(port.load({ tripId: "trip-invalida", asOf: now })).rejects.toEqual(
      expect.objectContaining({
        name: "PostgresAuthoritativeItineraryProposalGenerationContextError",
        code: "invalid-trip-id",
      }),
    );
    await expect(port.load({ tripId, asOf: new Date("invalid") })).rejects.toBeInstanceOf(
      PostgresAuthoritativeItineraryProposalGenerationContextError,
    );
    await expect(port.load({ tripId, asOf: new Date("invalid") })).rejects.toMatchObject({
      code: "invalid-as-of",
    });
  });
});
