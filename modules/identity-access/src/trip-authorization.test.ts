import { describe, expect, it, vi } from "vitest";

import { createAccountMembership } from "./identity";
import {
  authorizeTripAction,
  canPerformTripAction,
  TripAuthorizationError,
  type TripAuthorizationReader,
} from "./trip-authorization";

const userId = "11111111-1111-4111-8111-111111111111";
const accountId = "22222222-2222-4222-8222-222222222222";
const membershipId = "33333333-3333-4333-8333-333333333333";
const tripId = "44444444-4444-4444-8444-444444444444";

function reader(overrides: Partial<TripAuthorizationReader> = {}): TripAuthorizationReader {
  return {
    findTripScope: vi.fn(async () => ({ status: "scoped", accountId })),
    findMembership: vi.fn(async () =>
      createAccountMembership({
        id: membershipId,
        accountId,
        userId,
        role: "owner",
      }),
    ),
    ...overrides,
  };
}

describe("Trip authorization", () => {
  it("publica matriz determinística e deny-by-default por role", () => {
    expect(canPerformTripAction("owner", "trip:accept-proposal")).toBe(true);
    expect(canPerformTripAction("editor", "trip:accept-proposal")).toBe(true);
    expect(canPerformTripAction("viewer", "trip:view")).toBe(true);
    expect(canPerformTripAction("viewer", "trip:edit")).toBe(false);
    expect(canPerformTripAction("viewer", "trip:accept-proposal")).toBe(false);
  });

  it.each(["owner", "editor"] as const)("autoriza %s ativo a aceitar Proposal", async (role) => {
    const authorizationReader = reader({
      findMembership: vi.fn(async () =>
        createAccountMembership({
          id: membershipId,
          accountId,
          userId,
          role,
        }),
      ),
    });

    await expect(
      authorizeTripAction({ userId, tripId, action: "trip:accept-proposal" }, authorizationReader),
    ).resolves.toEqual({
      userId,
      tripId,
      accountId,
      membershipId,
      role,
      action: "trip:accept-proposal",
    });
  });

  it.each([
    ["trip-not-found", reader({ findTripScope: vi.fn(async () => ({ status: "not-found" })) })],
    ["trip-unscoped", reader({ findTripScope: vi.fn(async () => ({ status: "unscoped" })) })],
    ["membership-not-found", reader({ findMembership: vi.fn(async () => null) })],
    [
      "membership-inactive",
      reader({
        findMembership: vi.fn(async () =>
          createAccountMembership({
            id: membershipId,
            accountId,
            userId,
            role: "editor",
            status: "suspended",
          }),
        ),
      }),
    ],
    [
      "permission-denied",
      reader({
        findMembership: vi.fn(async () =>
          createAccountMembership({
            id: membershipId,
            accountId,
            userId,
            role: "viewer",
          }),
        ),
      }),
    ],
  ] as const)("nega com código %s", async (code, authorizationReader) => {
    await expect(
      authorizeTripAction({ userId, tripId, action: "trip:accept-proposal" }, authorizationReader),
    ).rejects.toEqual(new TripAuthorizationError(code));
  });

  it("nega membership de outra Account ou outro User", async () => {
    const authorizationReader = reader({
      findMembership: vi.fn(async () =>
        createAccountMembership({
          id: membershipId,
          accountId: "55555555-5555-4555-8555-555555555555",
          userId,
          role: "owner",
        }),
      ),
    });

    await expect(
      authorizeTripAction({ userId, tripId, action: "trip:accept-proposal" }, authorizationReader),
    ).rejects.toEqual(new TripAuthorizationError("membership-not-found"));
  });
});
