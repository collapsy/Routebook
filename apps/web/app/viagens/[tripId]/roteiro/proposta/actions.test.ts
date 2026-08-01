import { beforeEach, describe, expect, it, vi } from "vitest";

const navigationMocks = vi.hoisted(() => ({
  redirect: vi.fn((path: string): never => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

const databaseMocks = vi.hoisted(() => ({
  repository: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: navigationMocks.redirect,
}));

vi.mock("@routebook/database", () => ({
  DrizzleItineraryProposalRepository: databaseMocks.repository,
}));

import { discardItineraryProposalAction } from "./actions";

describe("discardItineraryProposalAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
