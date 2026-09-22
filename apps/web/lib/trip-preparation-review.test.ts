import { describe, expect, it } from "vitest";

import type { TravelerProfile } from "@routebook/traveler-profile";
import type { TripPlacePreference } from "@routebook/trip-collection";
import type { Trip } from "@routebook/trip-management";

import { deriveTripPreparationReviewModel } from "./trip-preparation-review";

const trip: Trip = {
  id: "trip-1",
  name: "Viagem de teste",
  destination: {
    name: "Pipa",
    type: "district",
    countryCode: "BR",
    latitude: -6.2302,
    longitude: -35.0503,
    timeZone: "America/Fortaleza",
  },
  period: {
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    timeZone: "America/Fortaleza",
  },
  accommodation: { name: "Hospedagem central" },
  status: "draft",
  participants: [{ userId: "user-1", displayName: "Pessoa", role: "owner" }],
  contextVersion: 1,
  createdAt: new Date("2026-09-21T00:00:00Z"),
  updatedAt: new Date("2026-09-21T00:00:00Z"),
};

const profile: TravelerProfile = {
  id: "profile-1",
  tripId: trip.id,
  travelerCount: 3,
  interests: ["beaches", "gastronomy"],
  pace: "balanced",
  transportPreference: "mixed",
  budget: { totalCents: 450000, currency: "BRL", kind: "estimate" },
  version: 2,
  createdAt: new Date("2026-09-21T00:00:00Z"),
  updatedAt: new Date("2026-09-21T01:00:00Z"),
};

const preferences: TripPlacePreference[] = [
  {
    id: "pref-1",
    tripId: trip.id,
    placeId: "place-1",
    intent: "WANT",
    priority: "MUST_DO",
    createdAt: new Date("2026-09-21T00:00:00Z"),
    updatedAt: new Date("2026-09-21T00:00:00Z"),
  },
  {
    id: "pref-2",
    tripId: trip.id,
    placeId: "place-2",
    intent: "MAYBE",
    priority: null,
    createdAt: new Date("2026-09-21T00:00:00Z"),
    updatedAt: new Date("2026-09-21T00:00:00Z"),
  },
  {
    id: "pref-3",
    tripId: trip.id,
    placeId: "place-3",
    intent: "NOT_INTERESTED",
    priority: null,
    createdAt: new Date("2026-09-21T00:00:00Z"),
    updatedAt: new Date("2026-09-21T00:00:00Z"),
  },
];

describe("deriveTripPreparationReviewModel", () => {
  it("consolida Trip, seleção e TravelerProfile sem criar uma segunda fonte de verdade", () => {
    const model = deriveTripPreparationReviewModel({ trip, profile, preferences });

    expect(model.trip).toMatchObject({
      id: "trip-1",
      destinationName: "Pipa",
      accommodationName: "Hospedagem central",
    });
    expect(model.selection).toEqual({
      evaluated: 3,
      WANT: 1,
      MAYBE: 1,
      NOT_INTERESTED: 1,
      mustDo: 1,
      considered: 2,
    });
    expect(model.context).toMatchObject({
      travelerCount: 3,
      interests: ["beaches", "gastronomy"],
      pace: "balanced",
      transportPreference: "mixed",
      budgetTotalCents: 450000,
      missingOptional: [],
    });
  });

  it("mantém ausência de perfil e campos opcionais como informação ausente", () => {
    const model = deriveTripPreparationReviewModel({ trip, profile: null, preferences: [] });

    expect(model.selection.considered).toBe(0);
    expect(model.context).toEqual({
      travelerCount: null,
      interests: null,
      pace: null,
      transportPreference: null,
      budgetTotalCents: null,
      missingOptional: ["ritmo", "transporte", "orçamento"],
    });
  });
});
