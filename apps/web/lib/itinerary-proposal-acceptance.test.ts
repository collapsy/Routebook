import { describe, expect, it, vi } from "vitest";

import {
  AcceptItineraryProposalError,
  createItineraryProposalId,
  type AcceptItineraryProposal,
  type ItineraryProposal,
  type ProposedActivity,
} from "@routebook/proposal-management";
import type { Itinerary, Trip } from "@routebook/trip-management";

import {
  executeAcceptItineraryProposalAction,
  mapProposedActivitiesToApplyItems,
  type AcceptItineraryProposalActionDependencies,
} from "./itinerary-proposal-acceptance";
import type { TripRouteAccessResult } from "./trip-route-access";

const tripId = "11111111-1111-4111-8111-111111111111";
const proposalId = "22222222-2222-4222-8222-222222222222";
const itineraryId = "33333333-3333-4333-8333-333333333333";
const userId = "44444444-4444-4444-8444-444444444444";
const accountId = "55555555-5555-4555-8555-555555555555";
const membershipId = "66666666-6666-4666-8666-666666666666";
const dayId = "77777777-7777-4777-8777-777777777777";
const sourceActivityId = "88888888-8888-4888-8888-888888888888";
const updateActivityId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const decidedAt = new Date("2026-08-03T20:00:00.000Z");
const validUntil = new Date("2026-08-04T20:00:00.000Z");

function trip(
  participants: Trip["participants"] = [{ userId, displayName: "Ronaldo", role: "owner" }],
): Trip {
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

function proposedActivities(): readonly ProposedActivity[] {
  return [
    {
      proposedActivityId: "proposed-add",
      operationType: "add",
      targetTripDayId: dayId,
      title: "Praia do Amor",
      proposedStartTime: "09:30:00",
      durationMinutes: 120,
      proposedOrder: 0,
      flexibility: "suggested",
    },
    {
      proposedActivityId: "proposed-move",
      operationType: "move",
      sourceActivityId,
      targetTripDayId: dayId,
      title: "Mover almoço",
      proposedOrder: 1,
    },
    {
      proposedActivityId: "proposed-update",
      operationType: "update",
      sourceActivityId: updateActivityId,
      title: "Almoço atualizado",
      proposedStartTime: "13:00",
    },
    {
      proposedActivityId: "proposed-remove",
      operationType: "remove",
      sourceActivityId: "99999999-9999-4999-8999-999999999999",
      title: "Remover atividade",
    },
  ];
}

function proposal(
  override: Partial<ItineraryProposal> = {},
  includeProposedActivities = true,
): ItineraryProposal {
  return {
    id: createItineraryProposalId(proposalId),
    tripId,
    itineraryId,
    baseTripContextVersion: 1,
    baseItineraryVersion: 4,
    contextSnapshotId: "context-1",
    status: "ready",
    requestedAt: decidedAt,
    updatedAt: decidedAt,
    generationStartedAt: decidedAt,
    generationMethod: "deterministic",
    generationVersion: "1",
    ...(includeProposedActivities ? { proposedActivities: proposedActivities() } : {}),
    criteria: ["tempo"],
    justifications: ["melhor sequência"],
    limitations: [],
    planningConflictIds: [],
    validUntil,
    generatedAt: decidedAt,
    ...override,
  };
}

function success(kind: "applied" | "replay") {
  return {
    kind,
    tripId,
    itineraryId,
    itineraryProposalId: proposalId,
    proposalApplicationId: "application-1",
    decisionId: "decision-1",
    requestFingerprint: "a".repeat(64),
    resultingItineraryVersion: 5,
    appliedProposedActivityIds: [
      "proposed-add",
      "proposed-move",
      "proposed-update",
      "proposed-remove",
    ],
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
  override: Partial<AcceptItineraryProposalActionDependencies> = {},
): AcceptItineraryProposalActionDependencies {
  const acceptItineraryProposal: AcceptItineraryProposal = {
    execute: vi.fn(async () => success("applied")),
  };

  return {
    resolveAccess: vi.fn(async (): Promise<TripRouteAccessResult> => authorizedAccess),
    tripRepository: { findById: vi.fn(async () => trip()) },
    itineraryRepository: { findByTripId: vi.fn(async () => itinerary()) },
    proposalRepository: { findById: vi.fn(async () => proposal()) },
    acceptItineraryProposal,
    now: () => decidedAt,
    ...override,
  };
}

function input() {
  return {
    tripId,
    itineraryProposalId: proposalId,
    expectedItineraryVersion: "4",
    idempotencyKey: "accept-proposal-session-1",
  };
}

describe("mapProposedActivitiesToApplyItems", () => {
  it("converte operações persistidas no contrato canônico de aplicação", () => {
    expect(mapProposedActivitiesToApplyItems(proposedActivities())).toEqual([
      {
        proposedActivityId: "proposed-add",
        operationType: "add",
        targetTripDayId: dayId,
        title: "Praia do Amor",
        startTime: "09:30",
        durationMinutes: 120,
        flexibility: "suggested",
        targetOrder: 1,
      },
      {
        proposedActivityId: "proposed-move",
        operationType: "move",
        sourceActivityId,
        targetTripDayId: dayId,
        targetOrder: 2,
      },
      {
        proposedActivityId: "proposed-update",
        operationType: "update",
        sourceActivityId: updateActivityId,
        title: "Almoço atualizado",
        startTime: "13:00",
      },
      {
        proposedActivityId: "proposed-remove",
        operationType: "remove",
        sourceActivityId: "99999999-9999-4999-8999-999999999999",
      },
    ]);
  });
});

describe("executeAcceptItineraryProposalAction", () => {
  it.each(["applied", "replay"] as const)(
    "deriva o ator do servidor e preserva o sucesso %s serializável",
    async (kind) => {
      const execute = vi.fn(async () => success(kind));
      const deps = dependencies({ acceptItineraryProposal: { execute } });

      await expect(executeAcceptItineraryProposalAction(input(), deps)).resolves.toEqual({
        status: "success",
        ...success(kind),
      });
      expect(execute).toHaveBeenCalledWith(
        expect.objectContaining({
          tripId,
          itineraryId,
          itineraryProposalId: proposalId,
          expectedItineraryVersion: 4,
          idempotencyKey: "accept-proposal-session-1",
          actorType: "participant",
          actorId: userId,
          decidedAt,
          items: expect.arrayContaining([
            expect.objectContaining({ proposedActivityId: "proposed-add" }),
          ]),
        }),
      );
    },
  );

  it("bloqueia visitante anônimo antes de consultar agregados", async () => {
    const findTrip = vi.fn();
    const deps = dependencies({
      resolveAccess: vi.fn(async (): Promise<TripRouteAccessResult> => ({
        status: "unauthenticated",
      })),
      tripRepository: { findById: findTrip },
    });

    await expect(executeAcceptItineraryProposalAction(input(), deps)).resolves.toMatchObject({
      status: "error",
      code: "unauthenticated",
    });
    expect(findTrip).not.toHaveBeenCalled();
  });

  it("normaliza negação de autorização sem consultar a Proposal", async () => {
    const findProposal = vi.fn();
    const deps = dependencies({
      resolveAccess: vi.fn(async (): Promise<TripRouteAccessResult> => ({ status: "not-found" })),
      proposalRepository: { findById: findProposal },
    });

    await expect(executeAcceptItineraryProposalAction(input(), deps)).resolves.toMatchObject({
      status: "error",
      code: "not-found",
    });
    expect(findProposal).not.toHaveBeenCalled();
  });

  it("recusa ator autorizado que não é Participant canônico da Trip", async () => {
    const execute = vi.fn();
    const deps = dependencies({
      tripRepository: { findById: vi.fn(async () => trip([])) },
      acceptItineraryProposal: { execute },
    });

    await expect(executeAcceptItineraryProposalAction(input(), deps)).resolves.toMatchObject({
      status: "error",
      code: "not-found",
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it.each([
    ["proposal-not-ready", proposal({ status: "generating" })],
    ["proposal-expired", proposal({ status: "expired" })],
    ["proposal-items-mismatch", proposal({}, false)],
  ] as const)("mapeia estado autoritativo para %s", async (code, persistedProposal) => {
    const deps = dependencies({
      proposalRepository: { findById: vi.fn(async () => persistedProposal) },
    });

    await expect(executeAcceptItineraryProposalAction(input(), deps)).resolves.toMatchObject({
      status: "error",
      code,
    });
  });

  it("detecta versão concorrente antes da transação", async () => {
    const execute = vi.fn();
    const deps = dependencies({
      itineraryRepository: { findByTripId: vi.fn(async () => itinerary(5)) },
      acceptItineraryProposal: { execute },
    });

    await expect(executeAcceptItineraryProposalAction(input(), deps)).resolves.toMatchObject({
      status: "error",
      code: "itinerary-version-mismatch",
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it.each([
    "fingerprint-conflict",
    "proposal-not-found",
    "proposal-not-ready",
    "proposal-expired",
    "proposal-items-mismatch",
    "itinerary-not-found",
    "itinerary-version-mismatch",
    "application-in-progress",
    "application-failed",
  ] as const)("preserva o erro oficial %s", async (code) => {
    const deps = dependencies({
      acceptItineraryProposal: {
        async execute() {
          throw new AcceptItineraryProposalError(code, code);
        },
      },
    });

    await expect(executeAcceptItineraryProposalAction(input(), deps)).resolves.toMatchObject({
      status: "error",
      code,
    });
  });

  it("rejeita payload inválido antes da autorização", async () => {
    const resolveAccess: AcceptItineraryProposalActionDependencies["resolveAccess"] = vi.fn();
    const deps = dependencies({ resolveAccess });

    await expect(
      executeAcceptItineraryProposalAction(
        { ...input(), expectedItineraryVersion: "0", idempotencyKey: "curta" },
        deps,
      ),
    ).resolves.toMatchObject({ status: "error", code: "invalid-request" });
    expect(resolveAccess).not.toHaveBeenCalled();
  });
});
