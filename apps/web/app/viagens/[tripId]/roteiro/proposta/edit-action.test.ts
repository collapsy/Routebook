import { beforeEach, describe, expect, it, vi } from "vitest";

const cacheMocks = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
const editingMocks = vi.hoisted(() => ({
  execute: vi.fn(),
  error: vi.fn((code: string) => ({ status: "error", code, message: code })),
}));
const databaseMocks = vi.hoisted(() => ({ repositoryInstance: { save: vi.fn() } }));
const accessMocks = vi.hoisted(() => ({ resolve: vi.fn() }));

vi.mock("next/cache", () => ({ revalidatePath: cacheMocks.revalidatePath }));
vi.mock("@routebook/database", () => ({
  DrizzleItineraryProposalRepository: class {
    constructor() {
      return databaseMocks.repositoryInstance;
    }
  },
}));
vi.mock("@/lib/itinerary-proposal-editing", () => ({
  editItineraryProposalActionError: editingMocks.error,
  executeEditItineraryProposalAction: editingMocks.execute,
}));
vi.mock("@/lib/trip-route-access", () => ({
  resolveTripRouteAccess: accessMocks.resolve,
}));

import { editItineraryProposalAction } from "./edit-action";

const tripId = "11111111-1111-4111-8111-111111111111";
const proposalId = "22222222-2222-4222-8222-222222222222";
const activityId = "33333333-3333-4333-8333-333333333333";
const dayId = "44444444-4444-4444-8444-444444444444";

function formData(): FormData {
  const form = new FormData();
  form.set("itineraryProposalId", proposalId);
  form.set("proposedActivityId", activityId);
  form.set("targetTripDayId", dayId);
  form.set("title", "Praia do Amor ao entardecer");
  form.set("description", "");
  form.set("proposedStartTime", "16:30");
  form.set("durationMinutes", "120");
  form.set("proposedOrder", "2");
  form.set("flexibility", "fixed");
  form.set("estimatedCostAmount", "40.50");
  form.set("estimatedCostCurrency", "BRL");
  return form;
}

const success = {
  status: "success",
  tripId,
  itineraryProposalId: proposalId,
  proposedActivityId: activityId,
  updatedAt: "2026-08-08T15:00:00.000Z",
} as const;

describe("editItineraryProposalAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delega o payload web, usa o repository PostgreSQL e revalida somente após sucesso", async () => {
    editingMocks.execute.mockResolvedValue(success);

    await expect(editItineraryProposalAction(tripId, { status: "idle" }, formData())).resolves.toBe(
      success,
    );

    expect(editingMocks.execute).toHaveBeenCalledWith(
      {
        tripId,
        itineraryProposalId: proposalId,
        proposedActivityId: activityId,
        targetTripDayId: dayId,
        title: "Praia do Amor ao entardecer",
        description: "",
        proposedStartTime: "16:30",
        durationMinutes: "120",
        proposedOrder: "2",
        flexibility: "fixed",
        estimatedCostAmount: "40.50",
        estimatedCostCurrency: "BRL",
      },
      {
        resolveAccess: accessMocks.resolve,
        repository: databaseMocks.repositoryInstance,
      },
    );
    expect(cacheMocks.revalidatePath).toHaveBeenCalledTimes(1);
    expect(cacheMocks.revalidatePath).toHaveBeenCalledWith(`/viagens/${tripId}/roteiro/proposta`);
  });

  it("preserva campos omitidos para permitir payload parcial", async () => {
    editingMocks.execute.mockResolvedValue(success);
    const form = new FormData();
    form.set("itineraryProposalId", proposalId);
    form.set("proposedActivityId", activityId);
    form.set("durationMinutes", "");

    await editItineraryProposalAction(tripId, { status: "idle" }, form);

    expect(editingMocks.execute).toHaveBeenCalledWith(
      {
        tripId,
        itineraryProposalId: proposalId,
        proposedActivityId: activityId,
        durationMinutes: "",
      },
      expect.any(Object),
    );
  });

  it("preserva erro recuperável sem invalidar cache", async () => {
    const error = {
      status: "error",
      code: "proposal-not-ready",
      message: "A proposta não pode ser editada.",
    } as const;
    editingMocks.execute.mockResolvedValue(error);

    await expect(editItineraryProposalAction(tripId, { status: "idle" }, formData())).resolves.toBe(
      error,
    );
    expect(cacheMocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("normaliza falha técnica inesperada sem invalidar cache", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    editingMocks.execute.mockRejectedValue(new Error("unexpected failure"));

    await expect(
      editItineraryProposalAction(tripId, { status: "idle" }, formData()),
    ).resolves.toEqual({ status: "error", code: "technical-error", message: "technical-error" });
    expect(editingMocks.error).toHaveBeenCalledWith("technical-error");
    expect(cacheMocks.revalidatePath).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
