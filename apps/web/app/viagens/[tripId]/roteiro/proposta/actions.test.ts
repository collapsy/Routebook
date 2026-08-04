import { beforeEach, describe, expect, it, vi } from "vitest";

const navigationMocks = vi.hoisted(() => ({
  notFound: vi.fn((): never => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirect: vi.fn((path: string): never => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

const databaseMocks = vi.hoisted(() => ({
  repository: vi.fn(),
}));

const accessMocks = vi.hoisted(() => ({
  resolve: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: navigationMocks.notFound,
  redirect: navigationMocks.redirect,
}));

vi.mock("@routebook/database", () => ({
  DrizzleItineraryProposalRepository: databaseMocks.repository,
}));

vi.mock("../../../../../lib/trip-route-access", () => ({
  resolveTripRouteAccess: accessMocks.resolve,
}));

import { discardItineraryProposalAction } from "./actions";

describe("discardItineraryProposalAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accessMocks.resolve.mockResolvedValue({
      status: "authorized",
      context: {
        userId: "user-1",
        tripId: "trip-1",
        accountId: "account-1",
        membershipId: "membership-1",
        role: "owner",
        action: "trip:accept-proposal",
      },
    });
  });

  it("redireciona visitante anônimo antes de ler o payload", async () => {
    accessMocks.resolve.mockResolvedValue({ status: "unauthenticated" });

    await expect(discardItineraryProposalAction("trip-1", new FormData())).rejects.toThrow(
      "NEXT_REDIRECT:/entrar?next=%2Fviagens%2Ftrip-1%2Froteiro%2Fproposta",
    );
    expect(databaseMocks.repository).not.toHaveBeenCalled();
  });

  it("responde como não encontrado quando o usuário não pode decidir", async () => {
    accessMocks.resolve.mockResolvedValue({ status: "not-found" });

    await expect(discardItineraryProposalAction("trip-1", new FormData())).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(databaseMocks.repository).not.toHaveBeenCalled();
  });

  it.each([
    ["ausente", null],
    ["malformada", "proposal-invalida"],
  ])("bloqueia identidade %s antes de criar o repositório", async (_, proposalId) => {
    const formData = new FormData();
    if (proposalId) {
      formData.set("itineraryProposalId", proposalId);
    }

    await expect(discardItineraryProposalAction("trip-1", formData)).rejects.toThrow(
      "NEXT_REDIRECT:/viagens/trip-1/roteiro?erroProposta=referencia-invalida",
    );

    expect(navigationMocks.redirect).toHaveBeenCalledWith(
      "/viagens/trip-1/roteiro?erroProposta=referencia-invalida",
    );
    expect(databaseMocks.repository).not.toHaveBeenCalled();
  });
});
