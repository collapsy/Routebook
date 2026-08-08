import { describe, expect, it, vi } from "vitest";

import {
  ItineraryProposalApplicationError,
  ItineraryProposalProposedActivityEditError,
  ItineraryProposalValidationError,
  type ItineraryProposal,
  type ItineraryProposalRepository,
} from "@routebook/proposal-management";

import {
  editItineraryProposalActionError,
  executeEditItineraryProposalAction,
  type EditItineraryProposalActionDependencies,
  type EditItineraryProposalActionInput,
} from "./itinerary-proposal-editing";
import type { TripRouteAccessResult } from "./trip-route-access";

const tripId = "11111111-1111-4111-8111-111111111111";
const proposalId = "22222222-2222-4222-8222-222222222222";
const activityId = "33333333-3333-4333-8333-333333333333";
const dayId = "44444444-4444-4444-8444-444444444444";
const editedAt = new Date("2026-08-08T15:00:00.000Z");

const repository = {} as ItineraryProposalRepository;
const authorizedAccess = {
  status: "authorized",
  context: {},
} as TripRouteAccessResult;

function input(
  overrides: Partial<EditItineraryProposalActionInput> = {},
): EditItineraryProposalActionInput {
  return {
    tripId,
    itineraryProposalId: proposalId,
    proposedActivityId: activityId,
    title: "Praia do Amor ao entardecer",
    ...overrides,
  };
}

function readyProposal(): ItineraryProposal {
  return {
    id: proposalId,
    tripId,
    status: "ready",
    updatedAt: editedAt,
  } as ItineraryProposal;
}

function dependencies(
  overrides: Partial<EditItineraryProposalActionDependencies> = {},
): EditItineraryProposalActionDependencies {
  return {
    resolveAccess: vi.fn().mockResolvedValue(authorizedAccess),
    repository,
    editProposal: vi.fn().mockResolvedValue(readyProposal()),
    now: () => editedAt,
    ...overrides,
  };
}

describe("executeEditItineraryProposalAction", () => {
  it("valida o payload antes de resolver acesso ou persistir", async () => {
    const resolveAccess = vi.fn();
    const editProposal = vi.fn();
    const deps = dependencies({ resolveAccess, editProposal });

    await expect(
      executeEditItineraryProposalAction(input({ tripId: "trip-invalida" }), deps),
    ).resolves.toEqual(editItineraryProposalActionError("invalid-request"));
    await expect(
      executeEditItineraryProposalAction(input({ title: "   " }), deps),
    ).resolves.toEqual(editItineraryProposalActionError("invalid-request"));
    await expect(
      executeEditItineraryProposalAction(input({ durationMinutes: "0", title: undefined }), deps),
    ).resolves.toEqual(editItineraryProposalActionError("invalid-request"));

    expect(resolveAccess).not.toHaveBeenCalled();
    expect(editProposal).not.toHaveBeenCalled();
  });

  it.each([
    ["unauthenticated", "unauthenticated"],
    ["not-found", "not-found"],
  ] as const)("traduz acesso %s sem chamar o service", async (accessStatus, errorCode) => {
    const editProposal = vi.fn();
    const deps = dependencies({
      resolveAccess: vi.fn().mockResolvedValue({ status: accessStatus }),
      editProposal,
    });

    await expect(executeEditItineraryProposalAction(input(), deps)).resolves.toEqual(
      editItineraryProposalActionError(errorCode),
    );
    expect(editProposal).not.toHaveBeenCalled();
  });

  it("normaliza campos editáveis e delega ao application service canônico", async () => {
    const resolveAccess = vi.fn().mockResolvedValue(authorizedAccess);
    const editProposal = vi.fn().mockResolvedValue(readyProposal());
    const deps = dependencies({ resolveAccess, editProposal });

    await expect(
      executeEditItineraryProposalAction(
        input({
          targetTripDayId: ` ${dayId} `,
          title: "  Praia do Amor no fim da tarde  ",
          description: "   ",
          proposedStartTime: "16:30",
          durationMinutes: "120",
          proposedOrder: "2",
          flexibility: " fixed ",
          estimatedCostAmount: "40.50",
          estimatedCostCurrency: " brl ",
        }),
        deps,
      ),
    ).resolves.toEqual({
      status: "success",
      tripId,
      itineraryProposalId: proposalId,
      proposedActivityId: activityId,
      updatedAt: editedAt.toISOString(),
    });

    expect(resolveAccess).toHaveBeenCalledWith({ tripId, action: "trip:edit" });
    expect(editProposal).toHaveBeenCalledWith(repository, {
      tripId,
      itineraryProposalId: proposalId,
      proposedActivityId: activityId,
      changes: {
        targetTripDayId: dayId,
        title: "Praia do Amor no fim da tarde",
        description: null,
        proposedStartTime: "16:30",
        durationMinutes: 120,
        proposedOrder: 2,
        flexibility: "fixed",
        estimatedCostAmount: 40.5,
        estimatedCostCurrency: "BRL",
      },
      editedAt,
    });
  });

  it("preserva omissão e converte campos opcionais vazios em limpeza explícita", async () => {
    const editProposal = vi.fn().mockResolvedValue(readyProposal());
    const deps = dependencies({ editProposal });

    await executeEditItineraryProposalAction(
      input({
        title: undefined,
        description: "",
        proposedStartTime: null,
        durationMinutes: "",
        proposedOrder: null,
        flexibility: " ",
        estimatedCostAmount: null,
        estimatedCostCurrency: "",
      }),
      deps,
    );

    expect(editProposal).toHaveBeenCalledWith(
      repository,
      expect.objectContaining({
        changes: {
          description: null,
          proposedStartTime: null,
          durationMinutes: null,
          proposedOrder: null,
          flexibility: null,
          estimatedCostAmount: null,
          estimatedCostCurrency: null,
        },
      }),
    );
  });

  it.each([
    [new ItineraryProposalApplicationError("ausente", "proposal-not-found"), "proposal-not-found"],
    [
      new ItineraryProposalProposedActivityEditError("estado", "proposal-not-ready"),
      "proposal-not-ready",
    ],
    [
      new ItineraryProposalProposedActivityEditError("atividade", "proposed-activity-not-found"),
      "proposed-activity-not-found",
    ],
    [new ItineraryProposalValidationError("inválida", { title: "inválido" }), "invalid-request"],
  ] as const)("traduz erro conhecido para %s", async (error, code) => {
    const deps = dependencies({ editProposal: vi.fn().mockRejectedValue(error) });

    await expect(executeEditItineraryProposalAction(input(), deps)).resolves.toEqual(
      editItineraryProposalActionError(code),
    );
  });

  it("normaliza falhas técnicas de autorização, persistência e relógio", async () => {
    await expect(
      executeEditItineraryProposalAction(
        input(),
        dependencies({ resolveAccess: vi.fn().mockRejectedValue(new Error("authorization down")) }),
      ),
    ).resolves.toEqual(editItineraryProposalActionError("technical-error"));

    await expect(
      executeEditItineraryProposalAction(
        input(),
        dependencies({ editProposal: vi.fn().mockRejectedValue(new Error("database down")) }),
      ),
    ).resolves.toEqual(editItineraryProposalActionError("technical-error"));

    await expect(
      executeEditItineraryProposalAction(input(), dependencies({ now: () => new Date("invalid") })),
    ).resolves.toEqual(editItineraryProposalActionError("technical-error"));
  });

  it("rejeita status inesperado retornado pelo service como falha técnica", async () => {
    const proposal = { ...readyProposal(), status: "accepted" } as ItineraryProposal;

    await expect(
      executeEditItineraryProposalAction(
        input(),
        dependencies({ editProposal: vi.fn().mockResolvedValue(proposal) }),
      ),
    ).resolves.toEqual(editItineraryProposalActionError("technical-error"));
  });
});
