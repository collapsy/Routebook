import { describe, expect, it, vi } from "vitest";

import { createDecision } from "@routebook/decision-intelligence";
import {
  completeItineraryProposalGeneration,
  createItineraryProposalId,
  requestItineraryProposal,
  startItineraryProposalGeneration,
  startProposalApplication,
  succeedProposalApplication,
  type AcceptItineraryProposalPartially,
  type ItineraryProposal,
} from "@routebook/proposal-management";
import type { Itinerary, Trip } from "@routebook/trip-management";

import {
  executeAcceptItineraryProposalPartiallyAction,
  type AcceptItineraryProposalPartiallyActionDependencies,
  type PartialProposalApplicationReplayRecord,
} from "./itinerary-proposal-partial-acceptance";
import type { TripRouteAccessResult } from "./trip-route-access";

const tripId = "11111111-1111-4111-8111-111111111111";
const proposalId = "22222222-2222-4222-8222-222222222222";
const itineraryId = "33333333-3333-4333-8333-333333333333";
const userId = "44444444-4444-4444-8444-444444444444";
const accountId = "55555555-5555-4555-8555-555555555555";
const membershipId = "66666666-6666-4666-8666-666666666666";
const dayId = "77777777-7777-4777-8777-777777777777";
const selectedId = "88888888-8888-4888-8888-888888888888";
const remainingId = "99999999-9999-4999-8999-999999999999";
const applicationId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const decisionId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const decidedAt = new Date("2026-08-09T20:00:00.000Z");
const validUntil = new Date("2026-08-10T20:00:00.000Z");
const idempotencyKey = "partial-accept-session-1";

function trip(participants: Trip["participants"] = [{ userId, displayName: "Ronaldo", role: "owner" }]): Trip {
  return {
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
    status: "draft",
    participants,
    contextVersion: 1,
    createdAt: decidedAt,
    updatedAt: decidedAt,
  };
}

function itinerary(version = 4): Itinerary {
  return {
    id: itineraryId,
    tripId,
    period: {
      startDate: "2026-08-22",
      endDate: "2026-08-29",
      timeZone: "America/Fortaleza",
    },
    days: [
      {
        id: dayId,
        date: "2026-08-22",
        position: 1,
        activities: [],
        freePeriods: [],
      },
    ],
    version,
    createdAt: decidedAt,
    updatedAt: decidedAt,
  };
}

function readyProposal(): ItineraryProposal {
  const requested = requestItineraryProposal({
    id: proposalId,
    tripId,
    itineraryId,
    baseTripContextVersion: 1,
    baseItineraryVersion: 4,
    contextSnapshotId: "context-1",
    requestedAt: decidedAt,
  });
  return completeItineraryProposalGeneration(
    startItineraryProposalGeneration(requested, decidedAt),
    {
      generationMethod: "deterministic",
      generationVersion: "1",
      proposedActivities: [
        {
          proposedActivityId: selectedId,
          operationType: "add",
          targetTripDayId: dayId,
          title: "Praia do Amor",
          proposedStartTime: "09:30:00",
          durationMinutes: 120,
          proposedOrder: 0,
          flexibility: "suggested",
        },
        {
          proposedActivityId: remainingId,
          operationType: "add",
          targetTripDayId: dayId,
          title: "Chapadão",
          proposedStartTime: "16:00:00",
          durationMinutes: 60,
          proposedOrder: 1,
          flexibility: "suggested",
        },
      ],
      criteria: ["ritmo"],
      justifications: ["sequência melhor"],
      limitations: [],
      planningConflictIds: [],
      generatedAt: decidedAt,
      validUntil,
    },
  );
}

function partiallyAcceptedProposal(): ItineraryProposal {
  return Object.freeze({
    ...readyProposal(),
    status: "partially-accepted" as const,
    proposedActivities: Object.freeze([
      readyProposal().proposedActivities?.find(
        (activity) => activity.proposedActivityId === remainingId,
      )!,
    ]),
    acceptedAt: new Date(decidedAt.getTime()),
    updatedAt: new Date(decidedAt.getTime()),
  });
}

function success(kind: "applied" | "replay" = "applied") {
  return {
    kind,
    tripId,
    itineraryId,
    itineraryProposalId: proposalId,
    proposalApplicationId: applicationId,
    decisionId,
    requestFingerprint: "a".repeat(64),
    resultingItineraryVersion: 5,
    appliedProposedActivityIds: [selectedId],
    remainingProposedActivityIds: [remainingId],
  } as const;
}

const authorizedAccess: TripRouteAccessResult = {
  status: "authorized",
  context: {
    userId,
    tripId,
    accountId,
    membershipId,
    role: "owner",
    action: "trip:accept-proposal",
  },
};

function dependencies(
  override: Partial<AcceptItineraryProposalPartiallyActionDependencies> = {},
): AcceptItineraryProposalPartiallyActionDependencies {
  const acceptItineraryProposalPartially: AcceptItineraryProposalPartially = {
    execute: vi.fn(async () => success()),
  };

  return {
    resolveAccess: vi.fn(async (): Promise<TripRouteAccessResult> => authorizedAccess),
    tripRepository: { findById: vi.fn(async () => trip()) },
    itineraryRepository: { findByTripId: vi.fn(async () => itinerary()) },
    proposalRepository: { findById: vi.fn(async () => readyProposal()) },
    proposalApplicationReader: { findByIdempotencyKey: vi.fn(async () => null) },
    decisionReader: { findByIdempotencyKey: vi.fn(async () => null) },
    acceptItineraryProposalPartially,
    now: () => decidedAt,
    ...override,
  };
}

function input(selectedProposedActivityIds: readonly string[] = [selectedId]) {
  return {
    tripId,
    itineraryProposalId: proposalId,
    expectedItineraryVersion: "4",
    idempotencyKey,
    selectedProposedActivityIds,
  } as const;
}

function replayRecord(): PartialProposalApplicationReplayRecord {
  const request = Object.freeze({
    itineraryProposalId: proposalId,
    itineraryId,
    applicationType: "partial" as const,
    expectedItineraryVersion: 4,
    actorType: "participant",
    actorId: userId,
    proposedActivityIds: Object.freeze([selectedId]),
  });
  const started = startProposalApplication({
    ...request,
    id: applicationId,
    idempotencyKey,
    startedAt: decidedAt,
  });
  return Object.freeze({
    tripId,
    itineraryId,
    request,
    application: succeedProposalApplication(started, {
      resultingItineraryVersion: 5,
      completedAt: decidedAt,
    }),
  });
}

function replayDecision() {
  const record = replayRecord();
  return createDecision({
    id: decisionId,
    tripId,
    actorParticipantId: userId,
    decidedAt,
    chosenOption: {
      type: "accept-itinerary-proposal",
      itineraryProposalId: createItineraryProposalId(proposalId),
      proposedActivityIds: [selectedId],
    },
    contextSnapshot: {
      schemaVersion: 1,
      tripId,
      itineraryId,
      itineraryProposalId: proposalId,
      baseItineraryVersion: 4,
      requestFingerprint: record.application.requestFingerprint,
      capturedAt: decidedAt,
    },
    effect: {
      type: "itinerary-proposal-applied",
      proposalApplicationId: applicationId,
      itineraryId,
      resultingItineraryVersion: 5,
      appliedProposedActivityIds: [selectedId],
    },
    idempotencyKey,
  });
}

describe("executeAcceptItineraryProposalPartiallyAction", () => {
  it("aplica somente a seleção reconstruída da Proposal autoritativa", async () => {
    const execute = vi.fn(async () => success());
    const deps = dependencies({ acceptItineraryProposalPartially: { execute } });

    await expect(executeAcceptItineraryProposalPartiallyAction(input(), deps)).resolves.toEqual({
      status: "success",
      ...success(),
    });
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        proposal: expect.objectContaining({ id: proposalId, status: "ready" }),
        expectedItineraryVersion: 4,
        idempotencyKey,
        actorType: "participant",
        actorId: userId,
        decidedAt,
        items: [
          expect.objectContaining({
            proposedActivityId: selectedId,
            operationType: "add",
            title: "Praia do Amor",
            startTime: "09:30",
            durationMinutes: 120,
          }),
        ],
      }),
    );
  });

  it.each([
    ["selection-empty", []],
    ["duplicate-selection", [selectedId, selectedId]],
  ] as const)("rejeita %s antes de consultar agregados", async (code, selection) => {
    const findTrip = vi.fn();
    const deps = dependencies({ tripRepository: { findById: findTrip } });

    await expect(
      executeAcceptItineraryProposalPartiallyAction(input(selection), deps),
    ).resolves.toMatchObject({ status: "error", code });
    expect(findTrip).not.toHaveBeenCalled();
  });

  it("bloqueia visitante anônimo antes de consultar a Trip", async () => {
    const findTrip = vi.fn();
    const deps = dependencies({
      resolveAccess: vi.fn(async (): Promise<TripRouteAccessResult> => ({ status: "unauthenticated" })),
      tripRepository: { findById: findTrip },
    });

    await expect(executeAcceptItineraryProposalPartiallyAction(input(), deps)).resolves.toMatchObject({
      status: "error",
      code: "unauthenticated",
    });
    expect(findTrip).not.toHaveBeenCalled();
  });

  it("rejeita seleção desconhecida e seleção integral usando a Proposal persistida", async () => {
    const unknownId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
    const deps = dependencies();

    await expect(
      executeAcceptItineraryProposalPartiallyAction(input([unknownId]), deps),
    ).resolves.toMatchObject({ status: "error", code: "unknown-proposed-activity" });
    await expect(
      executeAcceptItineraryProposalPartiallyAction(input([selectedId, remainingId]), deps),
    ).resolves.toMatchObject({ status: "error", code: "full-selection" });
  });

  it("detecta versão concorrente antes de abrir a transação parcial", async () => {
    const execute = vi.fn();
    const deps = dependencies({
      itineraryRepository: { findByTripId: vi.fn(async () => itinerary(5)) },
      acceptItineraryProposalPartially: { execute },
    });

    await expect(executeAcceptItineraryProposalPartiallyAction(input(), deps)).resolves.toMatchObject({
      status: "error",
      code: "itinerary-version-mismatch",
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it("mapeia Proposal expirada sem abrir a transação", async () => {
    const expired = { ...readyProposal(), status: "expired" as const, expiredAt: decidedAt };
    const execute = vi.fn();
    const deps = dependencies({
      proposalRepository: { findById: vi.fn(async () => expired) },
      acceptItineraryProposalPartially: { execute },
    });

    await expect(executeAcceptItineraryProposalPartiallyAction(input(), deps)).resolves.toMatchObject({
      status: "error",
      code: "proposal-expired",
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it("reproduz aceite parcial concluído sem reaplicar o Itinerary", async () => {
    const execute = vi.fn();
    const deps = dependencies({
      proposalRepository: { findById: vi.fn(async () => partiallyAcceptedProposal()) },
      proposalApplicationReader: {
        findByIdempotencyKey: vi.fn(async () => replayRecord()),
      },
      decisionReader: { findByIdempotencyKey: vi.fn(async () => replayDecision()) },
      acceptItineraryProposalPartially: { execute },
    });

    await expect(executeAcceptItineraryProposalPartiallyAction(input(), deps)).resolves.toMatchObject({
      status: "success",
      kind: "replay",
      proposalApplicationId: applicationId,
      decisionId,
      resultingItineraryVersion: 5,
      appliedProposedActivityIds: [selectedId],
      remainingProposedActivityIds: [remainingId],
    });
    expect(execute).not.toHaveBeenCalled();
    expect(deps.itineraryRepository.findByTripId).not.toHaveBeenCalled();
  });

  it("rejeita replay com seleção divergente como fingerprint-conflict", async () => {
    const deps = dependencies({
      proposalRepository: { findById: vi.fn(async () => partiallyAcceptedProposal()) },
      proposalApplicationReader: { findByIdempotencyKey: vi.fn(async () => replayRecord()) },
    });

    await expect(
      executeAcceptItineraryProposalPartiallyAction(input([remainingId]), deps),
    ).resolves.toMatchObject({ status: "error", code: "fingerprint-conflict" });
  });

  it("não permite nova aplicação quando Proposal parcial não corresponde a replay conhecido", async () => {
    const execute = vi.fn();
    const deps = dependencies({
      proposalRepository: { findById: vi.fn(async () => partiallyAcceptedProposal()) },
      acceptItineraryProposalPartially: { execute },
    });

    await expect(executeAcceptItineraryProposalPartiallyAction(input(), deps)).resolves.toMatchObject({
      status: "error",
      code: "proposal-not-ready",
    });
    expect(execute).not.toHaveBeenCalled();
  });
});
