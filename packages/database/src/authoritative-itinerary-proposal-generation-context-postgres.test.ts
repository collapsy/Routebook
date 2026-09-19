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
  itineraryFreePeriods,
  places,
  savedPlaces,
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
const activeActivityId = randomUUID();
const removedActivityId = randomUUID();
const flexibleFreePeriodId = randomUUID();
const protectedFreePeriodId = randomUUID();
const plannedPlaceId = randomUUID();
const wantedPlaceId = randomUUID();
const removedPlaceId = randomUUID();
const notInterestedPlaceId = randomUUID();
const plannedPreferenceId = randomUUID();
const wantedPreferenceId = randomUUID();
const removedPreferenceId = randomUUID();
const notInterestedPreferenceId = randomUUID();
const tripIds = [tripId, tripWithoutItineraryId, tripWithoutDaysId];
const placeIds = [plannedPlaceId, wantedPlaceId, removedPlaceId, notInterestedPlaceId];

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

function placeRow(id: string, name: string, category: string, latitude: number) {
  return {
    id,
    destinationId: "pipa-rn",
    slug: `${name.toLowerCase().replaceAll(" ", "-")}-${id}`,
    name,
    summary: `Resumo de ${name}.`,
    category,
    latitude,
    longitude: -35.045,
    addressLabel: "Pipa, Tibau do Sul - RN",
    publicationStatus: "published",
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
  await database
    .insert(places)
    .values([
      placeRow(plannedPlaceId, "Baía planejada", "beach", -6.221),
      placeRow(wantedPlaceId, "Praia do Amor", "beach", -6.235),
      placeRow(removedPlaceId, "Passeio removido", "beach", -6.24),
      placeRow(notInterestedPlaceId, "Loja sem interesse", "beach", -6.23),
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
  await database.insert(itineraryActivities).values([
    {
      id: activeActivityId,
      itineraryDayId: firstDayId,
      title: "Praia já planejada",
      type: "place-visit",
      status: "planned",
      flexibility: "flexible",
      startTime: "14:00",
      durationMinutes: 60,
      order: 1,
      placeId: plannedPlaceId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: removedActivityId,
      itineraryDayId: firstDayId,
      title: "Passeio removido",
      type: "tour",
      status: "removed",
      flexibility: "flexible",
      startTime: "16:00",
      durationMinutes: 60,
      order: 2,
      placeId: removedPlaceId,
      createdAt: now,
      updatedAt: now,
    },
  ]);
  await database.insert(itineraryFreePeriods).values([
    {
      id: flexibleFreePeriodId,
      itineraryDayId: firstDayId,
      mode: "flexible",
      startTime: "18:00",
      durationMinutes: 120,
      order: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: protectedFreePeriodId,
      itineraryDayId: secondDayId,
      mode: "protected",
      startTime: null,
      durationMinutes: null,
      order: 1,
      createdAt: now,
      updatedAt: now,
    },
  ]);
  await database.insert(savedPlaces).values([
    {
      id: plannedPreferenceId,
      tripId,
      placeId: plannedPlaceId,
      intent: "WANT",
      priority: null,
      createdAt: new Date(now.getTime() - 4_000),
      updatedAt: now,
    },
    {
      id: wantedPreferenceId,
      tripId,
      placeId: wantedPlaceId,
      intent: "WANT",
      priority: "MUST_DO",
      createdAt: new Date(now.getTime() - 3_000),
      updatedAt: now,
    },
    {
      id: removedPreferenceId,
      tripId,
      placeId: removedPlaceId,
      intent: "MAYBE",
      priority: null,
      createdAt: new Date(now.getTime() - 2_000),
      updatedAt: now,
    },
    {
      id: notInterestedPreferenceId,
      tripId,
      placeId: notInterestedPlaceId,
      intent: "NOT_INTERESTED",
      priority: null,
      createdAt: new Date(now.getTime() - 1_000),
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
  it("carrega TripPlacePreferences, Places e contexto do Itinerary de modo determinístico", async () => {
    const port = createPostgresAuthoritativeItineraryProposalGenerationContextPort(database);

    const context = await port.load({ tripId, asOf: now });

    expect(context.itinerary).toEqual({
      tripId,
      days: [
        {
          tripDayId: firstDayId,
          date: "2026-08-22",
          activities: [{ activityId: activeActivityId }],
          freePeriods: [{ freePeriodId: flexibleFreePeriodId, mode: "flexible" }],
        },
        {
          tripDayId: secondDayId,
          date: "2026-08-23",
          activities: [],
          freePeriods: [{ freePeriodId: protectedFreePeriodId, mode: "protected" }],
        },
      ],
    });
    expect(context.preferences).toEqual([
      {
        preferenceId: wantedPreferenceId,
        tripId,
        placeId: wantedPlaceId,
        intent: "WANT",
        priority: "MUST_DO",
      },
      {
        preferenceId: removedPreferenceId,
        tripId,
        placeId: removedPlaceId,
        intent: "MAYBE",
        priority: null,
      },
      {
        preferenceId: notInterestedPreferenceId,
        tripId,
        placeId: notInterestedPlaceId,
        intent: "NOT_INTERESTED",
        priority: null,
      },
    ]);
    expect(context.preferences).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ placeId: plannedPlaceId })]),
    );
    expect(context.places).toEqual(
      [...context.places].sort((left, right) => left.placeId.localeCompare(right.placeId)),
    );
    expect(context.places).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          placeId: wantedPlaceId,
          title: "Praia do Amor",
          category: "beach",
        }),
        expect.objectContaining({
          placeId: removedPlaceId,
          title: "Passeio removido",
          category: "beach",
        }),
        expect.objectContaining({
          placeId: notInterestedPlaceId,
          title: "Loja sem interesse",
          category: "beach",
        }),
      ]),
    );
  });

  it("considera Activity removed como inativa na seleção e na densidade da Proposal", async () => {
    const port = createPostgresAuthoritativeItineraryProposalGenerationContextPort(database);
    const context = await port.load({ tripId, asOf: now });

    expect(context.preferences).toEqual(
      expect.arrayContaining([expect.objectContaining({ placeId: removedPlaceId })]),
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
