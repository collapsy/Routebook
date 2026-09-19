import { describe, expect, it } from "vitest";

import { assembleTripPlacePreferenceItineraryProposalGenerationInput } from "./itinerary-proposal-generation-input-assembler";

const base = {
  itinerary: {
    tripId: "trip-1",
    days: [{ tripDayId: "day-1", date: "2026-09-20", activities: [], freePeriods: [] }],
  },
  places: [
    { placeId: "place-want", title: "Praia escolhida" },
    { placeId: "place-maybe", title: "Café talvez" },
    { placeId: "place-no", title: "Lugar rejeitado" },
    { placeId: "place-must", title: "Passeio imperdível" },
  ],
  preferences: [
    {
      preferenceId: "pref-want",
      tripId: "trip-1",
      placeId: "place-want",
      intent: "WANT" as const,
      priority: null,
    },
    {
      preferenceId: "pref-maybe",
      tripId: "trip-1",
      placeId: "place-maybe",
      intent: "MAYBE" as const,
      priority: null,
    },
    {
      preferenceId: "pref-no",
      tripId: "trip-1",
      placeId: "place-no",
      intent: "NOT_INTERESTED" as const,
      priority: null,
    },
    {
      preferenceId: "pref-must",
      tripId: "trip-1",
      placeId: "place-must",
      intent: "WANT" as const,
      priority: "MUST_DO" as const,
    },
  ],
};

describe("TripPlacePreference como fonte da Itinerary Proposal", () => {
  it("usa WANT por padrão, exclui MAYBE e NOT_INTERESTED e prioriza MUST_DO", () => {
    const result = assembleTripPlacePreferenceItineraryProposalGenerationInput({
      ...base,
      includeMaybe: false,
    });

    expect(result.candidates.map((candidate) => candidate.placeId)).toEqual([
      "place-must",
      "place-want",
    ]);
  });

  it("inclui MAYBE somente quando solicitado explicitamente", () => {
    const result = assembleTripPlacePreferenceItineraryProposalGenerationInput({
      ...base,
      includeMaybe: true,
    });

    expect(result.candidates.map((candidate) => candidate.placeId)).toEqual([
      "place-must",
      "place-maybe",
      "place-want",
    ]);
    expect(result.candidates.some((candidate) => candidate.placeId === "place-no")).toBe(false);
  });
});
