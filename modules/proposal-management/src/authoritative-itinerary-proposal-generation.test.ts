import { describe, expect, it, vi } from "vitest";

import type {
  GenerateItineraryProposalInput,
  ItineraryProposalGenerationPort,
} from "./deterministic-itinerary-proposal-generator";
import {
  AuthoritativeItineraryProposalGenerationError,
  generateAuthoritativeItineraryProposal,
  type AuthoritativeItineraryProposalGenerationContextPort,
} from "./authoritative-itinerary-proposal-generation";
import type {
  CompleteItineraryProposalGenerationInput,
  ItineraryProposal,
} from "./itinerary-proposal";
import type { ItineraryProposalRepository } from "./repository";

const requestedAt = new Date("2026-08-22T12:00:00.000Z");
const generatedAt = new Date("2026-08-22T12:00:01.000Z");
const validUntil = new Date("2026-08-23T12:00:01.000Z");

function repository(): ItineraryProposalRepository {
  return {
    create: vi.fn(async (proposal: ItineraryProposal) => proposal),
    save: vi.fn(async (proposal: ItineraryProposal) => proposal),
    findById: vi.fn(async () => null),
    listByTripId: vi.fn(async () => []),
  };
}

function generationPort(inputs: GenerateItineraryProposalInput[]): ItineraryProposalGenerationPort {
  return {
    generate: vi.fn(async (input: GenerateItineraryProposalInput) => {
      inputs.push(input);
      return {
        generationMethod: "test-generator",
        generationVersion: "1",
        proposedActivities: [],
        criteria: ["Teste de seleção autoritativa."],
        justifications: ["Teste."],
        limitations: [],
        planningConflictIds: [],
        generatedAt,
        validUntil,
      } satisfies CompleteItineraryProposalGenerationInput;
    }),
  };
}

function contextPort(tripId = "trip-1"): AuthoritativeItineraryProposalGenerationContextPort {
  return {
    load: vi.fn(async () => ({
      itinerary: {
        tripId,
        days: [
          {
            tripDayId: "day-1",
            date: "2026-08-22",
            activities: [],
            freePeriods: [],
          },
        ],
      },
      preferences: [
        {
          preferenceId: "preference-want",
          tripId,
          placeId: "place-want",
          intent: "WANT",
          priority: null,
        },
        {
          preferenceId: "preference-maybe",
          tripId,
          placeId: "place-maybe",
          intent: "MAYBE",
          priority: null,
        },
        {
          preferenceId: "preference-no",
          tripId,
          placeId: "place-no",
          intent: "NOT_INTERESTED",
          priority: null,
        },
      ],
      places: [
        { placeId: "place-want", title: "Praia escolhida", category: "beach" },
        { placeId: "place-maybe", title: "Café talvez", category: "gastronomy" },
        { placeId: "place-no", title: "Lugar sem interesse", category: "shopping" },
      ],
    })),
  };
}

function command(includeMaybe = false) {
  return {
    request: {
      id: "proposal-1",
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      baseTripContextVersion: 1,
      baseItineraryVersion: 1,
      contextSnapshotId: includeMaybe ? "snapshot-want-maybe" : "snapshot-want",
      requestedAt,
    },
    startedAt: requestedAt,
    failedAt: requestedAt,
    asOf: requestedAt,
    generatedAt,
    createProposedActivityId: () => "proposed-activity-1",
    includeMaybe,
  } as const;
}

describe("generateAuthoritativeItineraryProposal", () => {
  it("usa somente WANT por padrão e não reaproveita Recommendation ou Discovery", async () => {
    const inputs: GenerateItineraryProposalInput[] = [];

    const proposal = await generateAuthoritativeItineraryProposal(
      repository(),
      generationPort(inputs),
      contextPort(),
      command(),
    );

    expect(proposal.status).toBe("ready");
    expect(inputs).toHaveLength(1);
    expect(inputs[0]?.candidates.map(({ placeId }) => placeId)).toEqual(["place-want"]);
    expect(inputs[0]?.candidates[0]).toMatchObject({
      candidateId: "preference-want",
      reason: "Lugar escolhido como Quero ir na Minha seleção.",
    });
  });

  it("inclui MAYBE somente quando o comando possui opt-in explícito", async () => {
    const inputs: GenerateItineraryProposalInput[] = [];

    await generateAuthoritativeItineraryProposal(
      repository(),
      generationPort(inputs),
      contextPort(),
      command(true),
    );

    expect(inputs[0]?.candidates.map(({ placeId }) => placeId)).toEqual([
      "place-want",
      "place-maybe",
    ]);
  });

  it("rejeita contexto autoritativo pertencente a outra Trip", async () => {
    await expect(
      generateAuthoritativeItineraryProposal(
        repository(),
        generationPort([]),
        contextPort("trip-2"),
        command(),
      ),
    ).rejects.toEqual(
      expect.objectContaining({
        name: "AuthoritativeItineraryProposalGenerationError",
        code: "context-trip-mismatch",
      } satisfies Partial<AuthoritativeItineraryProposalGenerationError>),
    );
  });
});
