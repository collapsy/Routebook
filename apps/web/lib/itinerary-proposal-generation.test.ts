import { describe, expect, it, vi } from "vitest";

import { createItineraryProposalId, type ItineraryProposal } from "@routebook/proposal-management";
import type { Itinerary, Trip } from "@routebook/trip-management";

import { executeGenerateItineraryProposalAction } from "./itinerary-proposal-generation";

const tripId = "11111111-1111-4111-8111-111111111111";
const itineraryId = "22222222-2222-4222-8222-222222222222";
const proposalId = "33333333-3333-4333-8333-333333333333";
const instant = new Date("2026-08-07T18:00:00.000Z");

const trip = {
  id: tripId,
  name: "Pipa",
  destination: {
    name: "Pipa, Tibau do Sul - RN",
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
  status: "planned",
  participants: [],
  contextVersion: 8,
  createdAt: instant,
  updatedAt: instant,
} satisfies Trip;

const itinerary = {
  id: itineraryId,
  tripId,
  period: trip.period,
  days: [],
  version: 12,
  createdAt: instant,
  updatedAt: instant,
} satisfies Itinerary;

function readyProposal(): ItineraryProposal {
  return Object.freeze({
    id: createItineraryProposalId(proposalId),
    tripId,
    itineraryId,
    baseTripContextVersion: 8,
    baseItineraryVersion: 12,
    contextSnapshotId: `authoritative:${tripId}:8:12`,
    status: "ready",
    requestedAt: instant,
    updatedAt: instant,
  });
}

function deps() {
  return {
    resolveAccess: vi.fn().mockResolvedValue({
      status: "authorized",
      context: {
        userId: "user",
        tripId,
        accountId: "account",
        membershipId: "membership",
        role: "owner",
        action: "trip:edit",
      },
    }),
    tripRepository: { findById: vi.fn().mockResolvedValue(trip) },
    itineraryRepository: { findByTripId: vi.fn().mockResolvedValue(itinerary) },
    generationService: { generate: vi.fn().mockResolvedValue(readyProposal()) },
    now: () => instant,
    createItineraryProposalId: () => proposalId,
    createProposedActivityId: () => "44444444-4444-4444-8444-444444444444",
  };
}

describe("executeGenerateItineraryProposalAction", () => {
  it("falha antes da autorização quando TripId é inválido", async () => {
    const dependencies = deps();
    await expect(
      executeGenerateItineraryProposalAction({ tripId: "invalid" }, dependencies),
    ).resolves.toMatchObject({ status: "error", code: "invalid-request" });
    expect(dependencies.resolveAccess).not.toHaveBeenCalled();
  });

  it("não consulta dados nem gera quando não há sessão", async () => {
    const dependencies = deps();
    dependencies.resolveAccess.mockResolvedValue({ status: "unauthenticated" });
    await expect(
      executeGenerateItineraryProposalAction({ tripId }, dependencies),
    ).resolves.toMatchObject({
      status: "error",
      code: "unauthenticated",
    });
    expect(dependencies.tripRepository.findById).not.toHaveBeenCalled();
    expect(dependencies.generationService.generate).not.toHaveBeenCalled();
  });

  it("usa trip:edit e deriva versões do estado autoritativo", async () => {
    const dependencies = deps();
    await expect(executeGenerateItineraryProposalAction({ tripId }, dependencies)).resolves.toEqual(
      {
        status: "success",
        tripId,
        itineraryId,
        itineraryProposalId: proposalId,
        baseTripContextVersion: 8,
        baseItineraryVersion: 12,
      },
    );
    expect(dependencies.resolveAccess).toHaveBeenCalledWith({
      tripId,
      action: "trip:edit",
    });
    expect(dependencies.generationService.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          id: proposalId,
          tripId,
          itineraryId,
          baseTripContextVersion: 8,
          baseItineraryVersion: 12,
          contextSnapshotId: `authoritative:${tripId}:8:12`,
        }),
        asOf: instant,
      }),
    );
  });

  it("não executa geração sem Itinerary autoritativo", async () => {
    const dependencies = deps();
    dependencies.itineraryRepository.findByTripId.mockResolvedValue(null);
    await expect(
      executeGenerateItineraryProposalAction({ tripId }, dependencies),
    ).resolves.toMatchObject({
      status: "error",
      code: "itinerary-not-found",
    });
    expect(dependencies.generationService.generate).not.toHaveBeenCalled();
  });
});
