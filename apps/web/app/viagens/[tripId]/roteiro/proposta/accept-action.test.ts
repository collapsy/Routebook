import { beforeEach, describe, expect, it, vi } from "vitest";

const cacheMocks = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
const navigationMocks = vi.hoisted(() => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));
const acceptanceMocks = vi.hoisted(() => ({
  execute: vi.fn(),
  error: vi.fn((code: string) => ({ status: "error", code, message: code })),
}));
const databaseMocks = vi.hoisted(() => ({
  accept: { execute: vi.fn() },
  acceptFactory: vi.fn(),
}));
const accessMocks = vi.hoisted(() => ({ resolve: vi.fn() }));

vi.mock("next/cache", () => ({ revalidatePath: cacheMocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: navigationMocks.redirect }));
vi.mock("@routebook/database", () => ({
  createPostgresAcceptItineraryProposal: databaseMocks.acceptFactory,
  DrizzleItineraryProposalRepository: class {
    findById = vi.fn();
  },
  DrizzleItineraryRepository: class {
    findByTripId = vi.fn();
  },
  DrizzleTripRepository: class {
    findById = vi.fn();
  },
}));
vi.mock("@/lib/itinerary-proposal-acceptance", () => ({
  acceptItineraryProposalActionError: acceptanceMocks.error,
  executeAcceptItineraryProposalAction: acceptanceMocks.execute,
}));
vi.mock("@/lib/trip-route-access", () => ({
  resolveTripRouteAccess: accessMocks.resolve,
}));

import { acceptItineraryProposalAction } from "./accept-action";

const tripId = "11111111-1111-4111-8111-111111111111";

function formData(): FormData {
  const form = new FormData();
  form.set("itineraryProposalId", "22222222-2222-4222-8222-222222222222");
  form.set("expectedItineraryVersion", "4");
  form.set("idempotencyKey", "accept-proposal-session-1");
  return form;
}

const success = {
  status: "success",
  kind: "applied",
  tripId,
  itineraryId: "33333333-3333-4333-8333-333333333333",
  itineraryProposalId: "22222222-2222-4222-8222-222222222222",
  proposalApplicationId: "application-1",
  decisionId: "decision-1",
  requestFingerprint: "a".repeat(64),
  resultingItineraryVersion: 5,
  appliedProposedActivityIds: ["proposed-1"],
} as const;

describe("acceptItineraryProposalAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    databaseMocks.acceptFactory.mockReturnValue(databaseMocks.accept);
  });

  it("delega o payload mínimo, revalida e redireciona após sucesso", async () => {
    acceptanceMocks.execute.mockResolvedValue(success);

    await expect(
      acceptItineraryProposalAction(tripId, { status: "idle" }, formData()),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(acceptanceMocks.execute).toHaveBeenCalledWith(
      {
        tripId,
        itineraryProposalId: "22222222-2222-4222-8222-222222222222",
        expectedItineraryVersion: "4",
        idempotencyKey: "accept-proposal-session-1",
      },
      expect.objectContaining({
        resolveAccess: accessMocks.resolve,
        acceptItineraryProposal: databaseMocks.accept,
      }),
    );
    expect(cacheMocks.revalidatePath).toHaveBeenNthCalledWith(1, `/viagens/${tripId}`);
    expect(cacheMocks.revalidatePath).toHaveBeenNthCalledWith(2, `/viagens/${tripId}/roteiro`);
    expect(cacheMocks.revalidatePath).toHaveBeenCalledTimes(2);
    expect(navigationMocks.redirect).toHaveBeenCalledWith(
      `/viagens/${tripId}/roteiro?propostaAceita=applied`,
    );
  });

  it("preserva erro recuperável sem invalidar caches ou navegar", async () => {
    const error = {
      status: "error",
      code: "proposal-expired",
      message: "A validade terminou.",
    } as const;
    acceptanceMocks.execute.mockResolvedValue(error);

    await expect(
      acceptItineraryProposalAction(tripId, { status: "idle" }, formData()),
    ).resolves.toBe(error);
    expect(cacheMocks.revalidatePath).not.toHaveBeenCalled();
    expect(navigationMocks.redirect).not.toHaveBeenCalled();
  });

  it("normaliza falha técnica desconhecida sem navegar", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    acceptanceMocks.execute.mockRejectedValue(new Error("database unavailable"));

    await expect(
      acceptItineraryProposalAction(tripId, { status: "idle" }, formData()),
    ).resolves.toEqual({ status: "error", code: "technical-error", message: "technical-error" });
    expect(acceptanceMocks.error).toHaveBeenCalledWith("technical-error");
    expect(cacheMocks.revalidatePath).not.toHaveBeenCalled();
    expect(navigationMocks.redirect).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
