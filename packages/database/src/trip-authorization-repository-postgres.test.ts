import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import {
  authorizeTripAction,
  createAccountMembership,
  createPersonalAccount,
  TripAuthorizationError,
} from "@routebook/identity-access";
import { createTrip } from "@routebook/trip-management";

import { authUsers } from "./auth-schema";
import { closeDatabase, getDatabase } from "./client";
import { accountMemberships, accounts } from "./identity-schema";
import { DrizzleTripRepository } from "./trip-repository";
import { trips } from "./schema";
import { DrizzleTripAuthorizationRepository } from "./trip-authorization-repository";

const database = getDatabase();
const repository = new DrizzleTripAuthorizationRepository(database);
const tripRepository = new DrizzleTripRepository();
const userId = randomUUID();
const viewerUserId = randomUUID();
const outsiderUserId = randomUUID();
const accountId = randomUUID();
const ownerMembershipId = randomUUID();
const viewerMembershipId = randomUUID();
const now = new Date("2026-08-02T22:00:00.000Z");
const trip = createTrip(
  {
    name: "Pipa autorizada",
    destination: {
      name: "Pipa, Tibau do Sul - RN",
      type: "district",
      countryCode: "BR",
      latitude: -6.2302,
      longitude: -35.0503,
      timeZone: "America/Fortaleza",
    },
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    ownerName: "RouteBook Owner",
  },
  now,
);

beforeAll(async () => {
  await database.insert(authUsers).values([
    {
      id: userId,
      name: "Owner",
      email: `owner-${userId}@example.com`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: viewerUserId,
      name: "Viewer",
      email: `viewer-${viewerUserId}@example.com`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: outsiderUserId,
      name: "Outsider",
      email: `outsider-${outsiderUserId}@example.com`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await repository.savePersonalAccount(
    createPersonalAccount(
      {
        userId,
        name: "Conta de autorização",
        accountId,
        membershipId: ownerMembershipId,
      },
      now,
    ),
  );
  await database.insert(accountMemberships).values(
    createAccountMembership(
      {
        id: viewerMembershipId,
        accountId,
        userId: viewerUserId,
        role: "viewer",
      },
      now,
    ),
  );
  await tripRepository.create(trip);
  await database.update(trips).set({ accountId }).where(eq(trips.id, trip.id));
});

afterAll(async () => {
  await database.delete(trips).where(eq(trips.id, trip.id));
  await database.delete(accounts).where(eq(accounts.id, accountId));
  await database.delete(authUsers).where(eq(authUsers.id, outsiderUserId));
  await database.delete(authUsers).where(eq(authUsers.id, viewerUserId));
  await database.delete(authUsers).where(eq(authUsers.id, userId));
  await closeDatabase();
});

describe("PostgreSQL Trip authorization", () => {
  it("autoriza owner ativo a aceitar Proposal", async () => {
    await expect(
      authorizeTripAction({ userId, tripId: trip.id, action: "trip:accept-proposal" }, repository),
    ).resolves.toMatchObject({
      userId,
      tripId: trip.id,
      accountId,
      membershipId: ownerMembershipId,
      role: "owner",
      action: "trip:accept-proposal",
    });
  });

  it("nega viewer e usuário sem membership", async () => {
    await expect(
      authorizeTripAction(
        { userId: viewerUserId, tripId: trip.id, action: "trip:accept-proposal" },
        repository,
      ),
    ).rejects.toEqual(new TripAuthorizationError("permission-denied"));

    await expect(
      authorizeTripAction(
        { userId: outsiderUserId, tripId: trip.id, action: "trip:accept-proposal" },
        repository,
      ),
    ).rejects.toEqual(new TripAuthorizationError("membership-not-found"));
  });

  it("nega membership inativa", async () => {
    await database
      .update(accountMemberships)
      .set({ status: "suspended", updatedAt: new Date("2026-08-03T00:00:00.000Z") })
      .where(eq(accountMemberships.id, ownerMembershipId));

    await expect(
      authorizeTripAction({ userId, tripId: trip.id, action: "trip:accept-proposal" }, repository),
    ).rejects.toEqual(new TripAuthorizationError("membership-inactive"));

    await database
      .update(accountMemberships)
      .set({ status: "active", updatedAt: now })
      .where(eq(accountMemberships.id, ownerMembershipId));
  });

  it("nega Trip sem Account", async () => {
    await database.update(trips).set({ accountId: null }).where(eq(trips.id, trip.id));

    await expect(
      authorizeTripAction({ userId, tripId: trip.id, action: "trip:accept-proposal" }, repository),
    ).rejects.toEqual(new TripAuthorizationError("trip-unscoped"));

    await database.update(trips).set({ accountId }).where(eq(trips.id, trip.id));
  });
});
