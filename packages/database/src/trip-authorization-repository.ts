import { and, eq } from "drizzle-orm";

import type {
  AccountMembership,
  AccountMembershipRole,
  AccountMembershipStatus,
  PersonalAccount,
  TripAuthorizationReader,
  TripScopeLookup,
} from "@routebook/identity-access";

import { getDatabase } from "./client";
import { accountMemberships, accounts } from "./identity-schema";
import { trips } from "./schema";

const MEMBERSHIP_ROLES = new Set<AccountMembershipRole>(["owner", "editor", "viewer"]);
const MEMBERSHIP_STATUSES = new Set<AccountMembershipStatus>(["active", "suspended", "revoked"]);

function membershipRole(value: string): AccountMembershipRole {
  if (!MEMBERSHIP_ROLES.has(value as AccountMembershipRole)) {
    throw new Error(`Unknown Account Membership role: ${value}.`);
  }
  return value as AccountMembershipRole;
}

function membershipStatus(value: string): AccountMembershipStatus {
  if (!MEMBERSHIP_STATUSES.has(value as AccountMembershipStatus)) {
    throw new Error(`Unknown Account Membership status: ${value}.`);
  }
  return value as AccountMembershipStatus;
}

export class DrizzleTripAuthorizationRepository implements TripAuthorizationReader {
  constructor(private readonly database: ReturnType<typeof getDatabase> = getDatabase()) {}

  async savePersonalAccount(personalAccount: PersonalAccount): Promise<void> {
    await this.database.transaction(async (transaction) => {
      await transaction.insert(accounts).values({
        id: personalAccount.account.id,
        name: personalAccount.account.name,
        status: personalAccount.account.status,
        createdAt: personalAccount.account.createdAt,
        updatedAt: personalAccount.account.updatedAt,
      });
      await transaction.insert(accountMemberships).values({
        id: personalAccount.ownerMembership.id,
        accountId: personalAccount.ownerMembership.accountId,
        userId: personalAccount.ownerMembership.userId,
        role: personalAccount.ownerMembership.role,
        status: personalAccount.ownerMembership.status,
        createdAt: personalAccount.ownerMembership.createdAt,
        updatedAt: personalAccount.ownerMembership.updatedAt,
      });
    });
  }

  async findTripScope(tripId: string): Promise<TripScopeLookup> {
    const rows = await this.database
      .select({ accountId: trips.accountId })
      .from(trips)
      .where(eq(trips.id, tripId))
      .limit(1);
    const row = rows[0];

    if (!row) return { status: "not-found" };
    if (!row.accountId) return { status: "unscoped" };
    return { status: "scoped", accountId: row.accountId };
  }

  async findMembership(accountId: string, userId: string): Promise<AccountMembership | null> {
    const rows = await this.database
      .select()
      .from(accountMemberships)
      .where(
        and(eq(accountMemberships.accountId, accountId), eq(accountMemberships.userId, userId)),
      )
      .limit(1);
    const row = rows[0];
    if (!row) return null;

    return Object.freeze({
      id: row.id,
      accountId: row.accountId,
      userId: row.userId,
      role: membershipRole(row.role),
      status: membershipStatus(row.status),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}

export function createPostgresTripAuthorizationReader(): TripAuthorizationReader {
  return new DrizzleTripAuthorizationRepository();
}
