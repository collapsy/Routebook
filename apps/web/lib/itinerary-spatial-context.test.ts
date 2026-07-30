import { describe, expect, it } from "vitest";

import type { Itinerary } from "@routebook/trip-management";

import {
  deriveItineraryDaySpatialContext,
  ItinerarySpatialContextError,
  type PublishedPlaceSpatialSource,
} from "./itinerary-spatial-context";

const now = new Date("2026-07-30T12:00:00.000Z");

function createItinerary(): Itinerary {
  return {
    id: "itinerary-1",
    tripId: "trip-1",
    period: {
      startDate: "2026-08-22",
      endDate: "2026-08-23",
      timeZone: "America/Fortaleza",
    },
    days: [
      {
        id: "day-1",
        date: "2026-08-22",
        position: 1,
        activities: [
          {
            id: "activity-third",
            title: "Mirante",
            type: "place-visit",
            status: "planned",
            flexibility: "flexible",
            order: 3,
            placeId: "place-invalid",
            createdAt: now,
            updatedAt: now,
          },
          {
            id: "activity-first",
            title: "Praia do Amor",
            type: "place-visit",
            status: "planned",
            flexibility: "flexible",
            order: 1,
            placeId: "place-praia",
            createdAt: now,
            updatedAt: now,
          },
          {
            id: "activity-second",
            title: "Descanso",
            type: "rest",
            status: "planned",
            flexibility: "flexible",
            order: 2,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: "activity-fourth",
            title: "Lugar removido do catálogo",
            type: "place-visit",
            status: "planned",
            flexibility: "flexible",
            order: 4,
            placeId: "place-missing",
            createdAt: now,
            updatedAt: now,
          },
        ],
        freePeriods: [],
      },
      {
        id: "day-2",
        date: "2026-08-23",
        position: 2,
        activities: [],
        freePeriods: [],
      },
    ],
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
}

const places: PublishedPlaceSpatialSource[] = [
  {
    id: "place-praia",
    name: "Praia do Amor",
    slug: "praia-do-amor",
    latitude: -6.244,
    longitude: -35.041,
  },
  {
    id: "place-invalid",
    name: "Mirante",
    slug: "mirante",
    latitude: Number.NaN,
    longitude: -35.04,
  },
];

describe("deriveItineraryDaySpatialContext", () => {
  it("preserves canonical activity order and resolves explicit availability states", () => {
    const context = deriveItineraryDaySpatialContext({
      itinerary: createItinerary(),
      dayDate: "2026-08-22",
      publishedPlaces: places,
      accommodation: {
        name: "Condomínio Solar Água",
        coordinate: { latitude: -6.2302, longitude: -35.0503 },
      },
    });

    expect(context.accommodation).toEqual({
      status: "available",
      point: {
        id: "accommodation",
        label: "Condomínio Solar Água",
        kind: "accommodation",
        coordinate: { latitude: -6.2302, longitude: -35.0503 },
      },
    });
    expect(context.activitySteps.map((step) => [step.order, step.status])).toEqual([
      [1, "available"],
      [2, "unavailable"],
      [3, "unavailable"],
      [4, "unavailable"],
    ]);
    expect(context.activitySteps[0]).toMatchObject({
      activityId: "activity-first",
      status: "available",
      point: {
        sequence: 1,
        placeId: "place-praia",
        placeSlug: "praia-do-amor",
      },
    });
    expect(context.activitySteps[1]).toMatchObject({
      status: "unavailable",
      reason: "manual-activity",
    });
    expect(context.activitySteps[2]).toMatchObject({
      status: "unavailable",
      reason: "coordinates-unavailable",
    });
    expect(context.activitySteps[3]).toMatchObject({
      status: "unavailable",
      reason: "place-not-found",
    });
  });

  it("treats zero coordinates as valid and does not mutate canonical activity order", () => {
    const itinerary = createItinerary();
    const originalActivityIds = itinerary.days[0]?.activities.map((activity) => activity.id);

    const context = deriveItineraryDaySpatialContext({
      itinerary,
      dayDate: "2026-08-22",
      publishedPlaces: [
        {
          id: "place-praia",
          name: "Origem",
          slug: "origem",
          latitude: 0,
          longitude: 0,
        },
      ],
    });

    expect(context.activitySteps[0]).toMatchObject({
      status: "available",
      point: { coordinate: { latitude: 0, longitude: 0 } },
    });
    expect(itinerary.days[0]?.activities.map((activity) => activity.id)).toEqual(
      originalActivityIds,
    );
  });

  it("distinguishes missing accommodation from accommodation without valid coordinates", () => {
    const itinerary = createItinerary();

    expect(
      deriveItineraryDaySpatialContext({
        itinerary,
        dayDate: "2026-08-23",
        publishedPlaces: [],
      }).accommodation,
    ).toEqual({ status: "not-provided" });

    expect(
      deriveItineraryDaySpatialContext({
        itinerary,
        dayDate: "2026-08-23",
        publishedPlaces: [],
        accommodation: {
          name: "Hospedagem sem ponto",
          coordinate: { latitude: 120, longitude: 0 },
        },
      }).accommodation,
    ).toEqual({
      status: "coordinates-unavailable",
      label: "Hospedagem sem ponto",
    });
  });

  it("rejects a day outside the itinerary", () => {
    expect(() =>
      deriveItineraryDaySpatialContext({
        itinerary: createItinerary(),
        dayDate: "2026-08-24",
        publishedPlaces: [],
      }),
    ).toThrowError(ItinerarySpatialContextError);
  });
});
