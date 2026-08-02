import type { AccountMembership, AccountMembershipRole } from "./identity";

export type TripAction = "trip:view" | "trip:edit" | "trip:accept-proposal";

export type TripScopeLookup =
  | Readonly<{ status: "not-found" }>
  | Readonly<{ status: "unscoped" }>
  | Readonly<{ status: "scoped"; accountId: string }>;

export interface TripAuthorizationReader {
  findTripScope(tripId: string): Promise<TripScopeLookup>;
  findMembership(accountId: string, userId: string): Promise<AccountMembership | null>;
}

export type AuthorizeTripActionInput = Readonly<{
  userId: string;
  tripId: string;
  action: TripAction;
}>;

export type AuthorizedTripContext = Readonly<{
  userId: string;
  tripId: string;
  accountId: string;
  membershipId: string;
  role: AccountMembershipRole;
  action: TripAction;
}>;

export class TripAuthorizationError extends Error {
  constructor(
    public readonly code:
      | "trip-not-found"
      | "trip-unscoped"
      | "membership-not-found"
      | "membership-inactive"
      | "permission-denied",
  ) {
    super(`Trip authorization failed: ${code}.`);
    this.name = "TripAuthorizationError";
  }
}

const ACTIONS_BY_ROLE: Readonly<Record<AccountMembershipRole, readonly TripAction[]>> =
  Object.freeze({
    owner: Object.freeze(["trip:view", "trip:edit", "trip:accept-proposal"]),
    editor: Object.freeze(["trip:view", "trip:edit", "trip:accept-proposal"]),
    viewer: Object.freeze(["trip:view"]),
  });

export function canPerformTripAction(role: AccountMembershipRole, action: TripAction): boolean {
  return ACTIONS_BY_ROLE[role].includes(action);
}

export async function authorizeTripAction(
  input: AuthorizeTripActionInput,
  reader: TripAuthorizationReader,
): Promise<AuthorizedTripContext> {
  const tripScope = await reader.findTripScope(input.tripId);

  if (tripScope.status === "not-found") {
    throw new TripAuthorizationError("trip-not-found");
  }
  if (tripScope.status === "unscoped") {
    throw new TripAuthorizationError("trip-unscoped");
  }

  const membership = await reader.findMembership(tripScope.accountId, input.userId);
  if (!membership) throw new TripAuthorizationError("membership-not-found");
  if (membership.status !== "active") {
    throw new TripAuthorizationError("membership-inactive");
  }
  if (membership.accountId !== tripScope.accountId || membership.userId !== input.userId) {
    throw new TripAuthorizationError("membership-not-found");
  }
  if (!canPerformTripAction(membership.role, input.action)) {
    throw new TripAuthorizationError("permission-denied");
  }

  return Object.freeze({
    userId: input.userId,
    tripId: input.tripId,
    accountId: tripScope.accountId,
    membershipId: membership.id,
    role: membership.role,
    action: input.action,
  });
}
