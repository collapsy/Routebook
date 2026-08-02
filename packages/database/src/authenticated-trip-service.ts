import { and, eq } from "drizzle-orm";

import { createPersonalAccount } from "@routebook/identity-access";
import {
  createTrip,
  type CreateTripInput,
  type Trip,
} from "@routebook/trip-management";

import { authUsers } from "./auth-schema";
import { getDatabase } from "./client";
import {
  accountMemberships,
  accounts,
  personalAccountOwnerships,
} from "./identity-schema";
import { trips } from "./schema";

export type CreateAuthenticatedTripInput = Readonly<{
  userId: string;
  trip: Omit<CreateTripInput, "ownerName" | "ownerUserId">;
}>;

export type CreateAuthenticatedTripResult = Readonly<{
  trip: Trip;
  accountId: string;
  membershipId: string;
  personalAccount: "created" | "existing";
}>;

export class AuthenticatedTripCreationError extends Error {
  constructor(public readonly code: "user-not-found" | "personal-account-invalid") {
    super(`Authenticated Trip creation failed: ${code}.`);
    this.name = "AuthenticatedTripCreationError";
  }
}

function personalAccountName(userName: string): string {
  return `Conta pessoal de ${userName.trim()}`.slice(0, 160);
}

async function persistTrip(
  transaction: Parameters<Parameters<ReturnType<typeof getDatabase>["transaction"]>[0]>[0],
  trip: Trip,
  accountId: string,
): Promise<void> {
  await transaction.insert(trips).values({
    id: trip.id,
    accountId,
    name: trip.name,
    destinationName: trip.destination.name,
    destinationType: trip.destination.type,
    countryCode: trip.destination.countryCode,
    latitude: String(trip.destination.latitude),
    longitude: String(trip.destination.longitude),
    timeZone: trip.destination.timeZone,
    startDate: trip.period.startDate,
    endDate: trip.period.endDate,
    accommodationName: trip.accommodation?.name,
    accommodationAddress: trip.accommodation?.address,
    accommodationLatitude: trip.accommodation?.coordinate?.latitude,
    accommodationLongitude: trip.accommodation?.coordinate?.longitude,
    status: trip.status,
    participants: trip.participants,
    contextVersion: trip.contextVersion,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
  });
}

export async function createPostgresAuthenticatedTrip(
  input: CreateAuthenticatedTripInput,
  database: ReturnType<typeof getDatabase> = getDatabase(),
  now = new Date(),
): Promise<CreateAuthenticatedTripResult> {
  return database.transaction(async (transaction) => {
    const lockedUsers = await transaction
      .select({ id: authUsers.id, name: authUsers.name })
      .from(authUsers)
      .where(eq(authUsers.id, input.userId))
      .limit(1)
      .for("update");
    const user = lockedUsers[0];
    if (!user) throw new AuthenticatedTripCreationError("user-not-found");

    const trip = createTrip(
      {
        ...input.trip,
        ownerName: user.name,
        ownerUserId: user.id,
      },
      now,
    );

    const ownershipRows = await transaction
      .select({ accountId: personalAccountOwnerships.accountId })
      .from(personalAccountOwnerships)
      .where(eq(personalAccountOwnerships.userId, user.id))
      .limit(1);
    const ownership = ownershipRows[0];

    if (ownership) {
      const existingRows = await transaction
        .select({
          accountStatus: accounts.status,
          membershipId: accountMemberships.id,
          membershipRole: accountMemberships.role,
          membershipStatus: accountMemberships.status,
        })
        .from(accounts)
        .innerJoin(
          accountMemberships,
          and(
            eq(accountMemberships.accountId, accounts.id),
            eq(accountMemberships.userId, user.id),
          ),
        )
        .where(eq(accounts.id, ownership.accountId))
        .limit(1);
      const existing = existingRows[0];

      if (
        !existing ||
        existing.accountStatus !== "active" ||
        existing.membershipRole !== "owner" ||
        existing.membershipStatus !== "active"
      ) {
        throw new AuthenticatedTripCreationError("personal-account-invalid");
      }

      await persistTrip(transaction, trip, ownership.accountId);
      return Object.freeze({
        trip,
        accountId: ownership.accountId,
        membershipId: existing.membershipId,
        personalAccount: "existing" as const,
      });
    }

    const personalAccount = createPersonalAccount(
      {
        userId: user.id,
        name: personalAccountName(user.name),
      },
      now,
    );

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
    await transaction.insert(personalAccountOwnerships).values({
      userId: user.id,
      accountId: personalAccount.account.id,
      createdAt: now,
    });
    await persistTrip(transaction, trip, personalAccount.account.id);

    return Object.freeze({
      trip,
      accountId: personalAccount.account.id,
      membershipId: personalAccount.ownerMembership.id,
      personalAccount: "created" as const,
    });
  });
}
