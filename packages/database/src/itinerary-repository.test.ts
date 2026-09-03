import { afterAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";

import { createPlace } from "@routebook/place-catalog";
import { addActivity, createItinerary, createTrip } from "@routebook/trip-management";

import { closeDatabase, getDatabase } from "./client";
import {
  createPostgresItineraryRepository,
  DrizzleItineraryRepository,
} from "./itinerary-repository";
import { places, trips } from "./schema";
import { DrizzleTripRepository } from "./trip-repository";

afterAll(async () => {
  await closeDatabase();
});

describe("DrizzleItineraryRepository", () => {
  it("preserva o agregado completo e acompanha a cascata da viagem", async () => {
    const trip = createTrip({
      name: "Persistência do roteiro",
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
    const place = createPlace({
      destinationId: `test-${trip.id}`,
      slug: `praia-${trip.id.slice(0, 8)}`,
      name: "Praia de teste",
      summary: "Lugar persistido exclusivamente para o teste do roteiro manual.",
      category: "beach",
      latitude: -6.244,
      longitude: -35.041,
      publicationStatus: "published",
    });
    const database = getDatabase();
    const repository = new DrizzleItineraryRepository();

    try {
      await new DrizzleTripRepository().create(trip);
      await database.insert(places).values(place);

      let itinerary = createItinerary({ tripId: trip.id, period: trip.period });
      itinerary = addActivity(itinerary, {
        dayDate: "2026-08-22",
        title: place.name,
        type: "place-visit",
        placeId: place.id,
        startTime: "09:30",
        durationMinutes: 180,
      });
      itinerary = addActivity(itinerary, {
        dayDate: "2026-08-22",
        title: "Almoço sem local definido",
        type: "meal",
      });

      await repository.save(itinerary);
      const persisted = await repository.findByTripId(trip.id);

      expect(persisted).toEqual(itinerary);
      expect(persisted?.days[0]?.activities.map((activity) => activity.order)).toEqual([1, 2]);
      expect(persisted?.days[0]?.activities[0]).toMatchObject({
        placeId: place.id,
        startTime: "09:30",
        durationMinutes: 180,
      });
      expect(persisted?.days[0]?.activities[1]?.placeId).toBeUndefined();
      expect(persisted?.days[0]?.activities[1]?.startTime).toBeUndefined();

      const replaced = addActivity(persisted!, {
        dayDate: "2026-08-23",
        title: "Passeio flexível",
        type: "tour",
      });
      await repository.save(replaced);

      expect(await repository.findByTripId(trip.id)).toEqual(replaced);

      await database.delete(trips).where(eq(trips.id, trip.id));
      expect(await repository.findByTripId(trip.id)).toBeNull();
    } finally {
      await database.delete(trips).where(eq(trips.id, trip.id));
      await database.delete(places).where(eq(places.id, place.id));
    }
  });

  it("preserva a transação própria no modo global", async () => {
    const trip = createTrip({
      name: "Transação própria do Itinerary",
      destination: {
        name: "Pipa, Tibau do Sul - RN",
        type: "district",
        countryCode: "BR",
        latitude: -6.2302,
        longitude: -35.0503,
        timeZone: "America/Fortaleza",
      },
      startDate: "2026-08-22",
      endDate: "2026-08-23",
      ownerName: "RouteBook QA",
    });
    const database = getDatabase();
    const itinerary = createItinerary({ tripId: trip.id, period: trip.period });

    await new DrizzleTripRepository().create(trip);
    const transaction = vi.spyOn(database, "transaction");
    const repository = new DrizzleItineraryRepository(database);
    try {
      await repository.save(itinerary);
      expect(transaction).toHaveBeenCalledTimes(1);
      expect(await repository.findByTripId(trip.id)).toEqual(itinerary);
    } finally {
      transaction.mockRestore();
      await database.delete(trips).where(eq(trips.id, trip.id));
    }
  });

  it("restaura o fuso persistido sem assumir o fuso de Pipa", async () => {
    const trip = createTrip({
      name: "Roteiro em São Paulo",
      destination: {
        name: "São Paulo, SP",
        type: "city",
        countryCode: "BR",
        latitude: -23.5505,
        longitude: -46.6333,
        timeZone: "America/Sao_Paulo",
      },
      startDate: "2026-11-10",
      endDate: "2026-11-12",
      ownerName: "RouteBook QA",
    });
    const database = getDatabase();
    const repository = new DrizzleItineraryRepository();

    try {
      await new DrizzleTripRepository().create(trip);
      const itinerary = createItinerary({ tripId: trip.id, period: trip.period });
      await repository.save(itinerary);

      expect((await repository.findByTripId(trip.id))?.period.timeZone).toBe("America/Sao_Paulo");
    } finally {
      await database.delete(trips).where(eq(trips.id, trip.id));
    }
  });

  it("usa o executor escopado sem nested transaction e participa do rollback externo", async () => {
    const trip = createTrip({
      name: "Rollback externo do Itinerary",
      destination: {
        name: "Pipa, Tibau do Sul - RN",
        type: "district",
        countryCode: "BR",
        latitude: -6.2302,
        longitude: -35.0503,
        timeZone: "America/Fortaleza",
      },
      startDate: "2026-08-22",
      endDate: "2026-08-23",
      ownerName: "RouteBook QA",
    });
    const database = getDatabase();
    const itinerary = createItinerary({ tripId: trip.id, period: trip.period });
    const rollback = new Error("rollback intencional");

    await new DrizzleTripRepository().create(trip);
    try {
      await expect(
        database.transaction(async (transaction) => {
          const nestedTransaction = vi.fn();
          const executor = {
            select: transaction.select.bind(transaction),
            insert: transaction.insert.bind(transaction),
            delete: transaction.delete.bind(transaction),
            transaction: nestedTransaction,
          };
          const repository = createPostgresItineraryRepository(executor);

          await repository.save(itinerary);
          expect(await repository.findByTripId(trip.id)).toEqual(itinerary);
          expect(nestedTransaction).not.toHaveBeenCalled();
          throw rollback;
        }),
      ).rejects.toBe(rollback);

      expect(await new DrizzleItineraryRepository().findByTripId(trip.id)).toBeNull();
    } finally {
      await database.delete(trips).where(eq(trips.id, trip.id));
    }
  });

  it("rejeita executor escopado inválido", () => {
    expect(() => createPostgresItineraryRepository(undefined as never)).toThrowError(TypeError);
    expect(() =>
      createPostgresItineraryRepository({
        select() {},
        insert() {},
      } as never),
    ).toThrowError(TypeError);
  });
});
