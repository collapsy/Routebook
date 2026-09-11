import { describe, expect, it, vi } from "vitest";

import { PlacePromotionServiceError } from "@routebook/database";
import type { ExternalPlaceCandidate, Place } from "@routebook/place-catalog";
import { addActivity, createItinerary, createTrip } from "@routebook/trip-management";

import {
  loadItineraryProposalDiscoveryCandidates,
  type ItineraryProposalDiscoveryCandidateDependencies,
} from "./itinerary-proposal-discovery-candidates";
import type { RecommendationDiscoverySuggestions } from "./recommendation-discovery-suggestions";

const now = new Date("2026-09-11T15:00:00.000Z");
const trip = createTrip(
  {
    name: "Panajachel Proposal",
    destination: {
      name: "Panajachel, Guatemala",
      type: "city",
      countryCode: "GT",
      latitude: 14.741,
      longitude: -91.156,
      timeZone: "America/Guatemala",
    },
    startDate: "2026-10-10",
    endDate: "2026-10-11",
    ownerName: "RouteBook QA",
  },
  now,
);

function externalCandidate(id: string, name: string): ExternalPlaceCandidate {
  return {
    provider: "overture",
    externalId: id,
    name,
    latitude: 14.741,
    longitude: -91.156,
    providerCategory: "cafe",
    category: "gastronomy",
    addressLabel: `Endereço ${name}`,
    sourceLicense: "ODbL",
    collectedAt: now,
    confidence: 0.95,
  };
}

function place(id: string, name: string): Place {
  return {
    id,
    slug: `place-${id}`,
    name,
    summary: "Materializado para continuidade operacional.",
    category: "gastronomy",
    latitude: 14.741,
    longitude: -91.156,
    publicationStatus: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

function discovery(
  candidates: readonly ExternalPlaceCandidate[],
): RecommendationDiscoverySuggestions {
  return {
    suggestions: [],
    candidates,
    discoveryStatus: "success",
    availableCount: candidates.length,
  };
}

type PromoteCandidate = NonNullable<
  ItineraryProposalDiscoveryCandidateDependencies["promoteCandidate"]
>;

function dependencies(input: {
  candidates: readonly ExternalPlaceCandidate[];
  places: readonly Place[];
  promote?: PromoteCandidate;
}) {
  const promote: PromoteCandidate =
    input.promote ??
    vi.fn(async ({ candidate }) => ({
      status: "created" as const,
      placeId: `internal-${candidate.externalId}`,
      slug: `place-${candidate.externalId}`,
      publicationStatus: "draft" as const,
    }));

  return {
    travelerProfileRepository: {
      findByTripId: vi.fn(async () => null),
    },
    loadDiscovery: vi.fn(async () => discovery(input.candidates)),
    promoteCandidate: promote,
    placeRepository: {
      listByIds: vi.fn(async () => [...input.places]),
    },
  };
}

describe("loadItineraryProposalDiscoveryCandidates", () => {
  it("materializa a seleção segura e produz candidatos com PlaceId interno", async () => {
    const cafe = externalCandidate("cafe", "Café seguro");
    const park = externalCandidate("park", "Parque seguro");
    const deps = dependencies({
      candidates: [cafe, park],
      places: [place("internal-cafe", "Café seguro"), place("internal-park", "Parque seguro")],
    });
    const itinerary = createItinerary({ tripId: trip.id, period: trip.period }, now);

    await expect(loadItineraryProposalDiscoveryCandidates(trip, itinerary, deps)).resolves.toEqual([
      {
        candidateId: "discovery:overture:cafe",
        placeId: "internal-cafe",
        title: "Café seguro",
        reason: "Lugar selecionado entre opções seguras da área desta Viagem.",
      },
      {
        candidateId: "discovery:overture:park",
        placeId: "internal-park",
        title: "Parque seguro",
        reason: "Lugar selecionado entre opções seguras da área desta Viagem.",
      },
    ]);
    expect(deps.loadDiscovery).toHaveBeenCalledWith(trip, [], 6);
    expect(deps.promoteCandidate).toHaveBeenCalledTimes(2);
  });

  it("dimensiona a seleção Discovery pela capacidade da viagem em vez do limite fixo de seis", async () => {
    const longerTrip = createTrip(
      {
        name: "Panajachel Proposal longa",
        destination: trip.destination,
        startDate: "2026-10-10",
        endDate: "2026-10-13",
        ownerName: "RouteBook QA",
      },
      now,
    );
    const itinerary = createItinerary({ tripId: longerTrip.id, period: longerTrip.period }, now);
    const deps = dependencies({ candidates: [], places: [] });

    await expect(
      loadItineraryProposalDiscoveryCandidates(longerTrip, itinerary, deps),
    ).resolves.toEqual([]);
    expect(deps.loadDiscovery).toHaveBeenCalledWith(longerTrip, [], 12);
  });

  it("omite Place já planejado depois de materializar a identidade", async () => {
    const cafe = externalCandidate("cafe", "Café seguro");
    const base = createItinerary({ tripId: trip.id, period: trip.period }, now);
    const itinerary = addActivity(
      base,
      {
        dayDate: trip.period.startDate,
        title: "Café já planejado",
        placeId: "internal-cafe",
      },
      now,
    );
    const deps = dependencies({
      candidates: [cafe],
      places: [place("internal-cafe", "Café seguro")],
    });

    await expect(loadItineraryProposalDiscoveryCandidates(trip, itinerary, deps)).resolves.toEqual(
      [],
    );
    expect(deps.loadDiscovery).toHaveBeenCalledWith(trip, [], 5);
    expect(deps.placeRepository.listByIds).not.toHaveBeenCalled();
  });

  it("retém candidato rejeitado ou ambíguo sem transformar a falha em atividade", async () => {
    const ambiguous = externalCandidate("ambiguous", "Lugar ambíguo");
    const promote: PromoteCandidate = vi.fn(async () => {
      throw new PlacePromotionServiceError(
        "possível duplicata",
        "possible-match",
        "place-existing",
      );
    });
    const deps = dependencies({ candidates: [ambiguous], places: [], promote });
    const itinerary = createItinerary({ tripId: trip.id, period: trip.period }, now);

    await expect(loadItineraryProposalDiscoveryCandidates(trip, itinerary, deps)).resolves.toEqual(
      [],
    );
    expect(deps.placeRepository.listByIds).not.toHaveBeenCalled();
  });

  it("propaga falha técnica inesperada em vez de produzir Proposal vazia silenciosamente", async () => {
    const cafe = externalCandidate("cafe", "Café seguro");
    const promote: PromoteCandidate = vi.fn(async () => {
      throw new Error("database unavailable");
    });
    const deps = dependencies({ candidates: [cafe], places: [], promote });
    const itinerary = createItinerary({ tripId: trip.id, period: trip.period }, now);

    await expect(loadItineraryProposalDiscoveryCandidates(trip, itinerary, deps)).rejects.toThrow(
      "database unavailable",
    );
  });
});
