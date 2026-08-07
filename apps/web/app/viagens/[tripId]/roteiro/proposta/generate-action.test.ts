import { beforeEach, describe, expect, it, vi } from "vitest";

const cacheMocks = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
const navigationMocks = vi.hoisted(() => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));
const generationMocks = vi.hoisted(() => ({
  execute: vi.fn(),
  error: vi.fn((code: string) => ({ status: "error", code, message: code })),
}));
const databaseMocks = vi.hoisted(() => ({
  generationService: { generate: vi.fn() },
  generationFactory: vi.fn(),
}));
const accessMocks = vi.hoisted(() => ({ resolve: vi.fn() }));

vi.mock("next/cache", () => ({ revalidatePath: cacheMocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: navigationMocks.redirect }));
vi.mock("@routebook/database", () => ({
  createPostgresAuthoritativeItineraryProposalGenerationService: databaseMocks.generationFactory,
  DrizzleItineraryRepository: class {
    findByTripId = vi.fn();
  },
  DrizzleTripRepository: class {
    findById = vi.fn();
  },
}));
vi.mock("@/lib/itinerary-proposal-generation", () => ({
  executeGenerateItineraryProposalAction: generationMocks.execute,
  generateItineraryProposalActionError: generationMocks.error,
}));
vi.mock("@/lib/trip-route-access", () => ({
  resolveTripRouteAccess: accessMocks.resolve,
}));

import { generateItineraryProposalAction } from "./generate-action";

const tripId = "11111111-1111-4111-8111-111111111111";
const proposalId = "33333333-3333-4333-8333-333333333333";

const success = {
  status: "success",
  tripId,
  itineraryId: "22222222-2222-4222-8222-222222222222",
  itineraryProposalId: proposalId,
  baseTripContextVersion: 8,
  baseItineraryVersion: 12,
} as const;

describe("generateItineraryProposalAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    databaseMocks.generationFactory.mockReturnValue(databaseMocks.generationService);
  });

  it("delega, revalida e redireciona somente após sucesso", async () => {
    generationMocks.execute.mockResolvedValue(success);

    await expect(generateItineraryProposalAction(tripId, { status: "idle" })).rejects.toThrow(
      "NEXT_REDIRECT",
    );

    expect(generationMocks.execute).toHaveBeenCalledWith(
      { tripId },
      expect.objectContaining({
        resolveAccess: accessMocks.resolve,
        generationService: databaseMocks.generationService,
      }),
    );
    expect(cacheMocks.revalidatePath).toHaveBeenCalledTimes(3);
    expect(navigationMocks.redirect).toHaveBeenCalledWith(
      `/viagens/${tripId}/roteiro/proposta?propostaGerada=${proposalId}`,
    );
  });

  it("preserva erro recuperável sem invalidar caches ou navegar", async () => {
    const error = { status: "error", code: "not-found", message: "not-found" } as const;
    generationMocks.execute.mockResolvedValue(error);

    await expect(generateItineraryProposalAction(tripId, { status: "idle" })).resolves.toBe(error);
    expect(cacheMocks.revalidatePath).not.toHaveBeenCalled();
    expect(navigationMocks.redirect).not.toHaveBeenCalled();
  });

  it("normaliza falha técnica desconhecida", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    generationMocks.execute.mockRejectedValue(new Error("database unavailable"));

    await expect(generateItineraryProposalAction(tripId, { status: "idle" })).resolves.toEqual({
      status: "error",
      code: "technical-error",
      message: "technical-error",
    });
    expect(generationMocks.error).toHaveBeenCalledWith("technical-error");
    consoleError.mockRestore();
  });
});
