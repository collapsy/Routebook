import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq, inArray } from "drizzle-orm";

import { createTrip } from "@routebook/trip-management";

import { authUsers } from "./auth-schema";
import { listPostgresAuthorizedTrips } from "./authenticated-trip-query";
import { createPostgresAuthenticatedTrip } from "./authenticated-trip-service";
import { closeDatabase, getDatabase } from "./client";
import { accountMemberships, accounts } from "./identity-schema";
import { trips } from "./schema";
import { DrizzleTripRepository } from "./trip-repository";

const database = getDatabase();
const now = new Date("2026-08-03T12:00:00.000Z");
const activeUserId = randomUUID();
const otherUserId = randomUUID();
const suspendedUserId = randomUUID();
const inactiveAccountUserId = randomUUID();
const userIds = [activeUserId, otherUserId, suspendedUserId, inactiveAccountUserId];
const createdTripIds: string[] = [];
const createdAccountIds: string[] = [];

function tripInput(name: string) {
  return {
    name,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    accommodationName: "Condomínio Solar Água",
    accommodationAddress: "Pipa, Tibau do Sul - RN",
  };
}

beforeAll(async () => {
  await database.insert(authUsers).values(
    userIds.map((id, index) => ({
      id,
      name: `Viajante ${index + 1}`,
      email: `rb-inc-090-${id}@example.com`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    })),
  );

  const active = await createPostgresAuthenticatedTrip(
    { userId: activeUserId, trip: tripInput("Viagem visível") },
    database,
    now,
  );
  const other = await createPostgresAuthenticatedTrip(
    { userId: otherUserId, trip: tripInput("Viagem de outro usuário") },
    database,
    now,
  );
  const suspended = await createPostgresAuthenticatedTrip(
    { userId: suspendedUserId, trip: tripInput("Viagem com membership suspensa") },
    database,
    now,
  );
  const inactiveAccount = await createPostgresAuthenticatedTrip(
    { userId: inactiveAccountUserId, trip: tripInput("Viagem com Account inativa") },
    database,
    now,
  );

  createdTripIds.push(
    active.trip.id,
    other.trip.id,
    suspended.trip.id,
    inactiveAccount.trip.id,
  );
  createdAccountIds.push(
    active.accountId,
    other.accountId,
    suspended.accountId,
    inactiveAccount.accountId,
  );

  await database
    .update(accountMemberships)
    .set({ status: "suspended", updatedAt: now })
    .where(eq(accountMemberships.id, suspended.membershipId));
  await database
    .update(accounts)
    .set({ status: "suspended", updatedAt: now })
    .where(eq(accounts.id, inactiveAccount.accountId));

  const legacyTrip = createTrip(
    {
      ...tripInput("Viagem legada sem Account"),
      ownerName: "Owner legado",
    },
    now,
  );
  await new DrizzleTripRepository().create(legacyTrip);
  createdTripIds.push(legacyTrip.id);
});

afterAll(async () => {
  await database.delete(trips).where(inArray(trips.id, createdTripIds));
  await database.delete(accounts).where(inArray(accounts.id, createdAccountIds));
  await database.delete(authUsers).where(inArray(authUsers.id, userIds));
  await closeDatabase();
});

describe("listPostgresAuthorizedTrips", () => {
  it("lista somente Trips de Accounts com membership ativa do User", async () => {
    const result = await listPostgresAuthorizedTrips(activeUserId, database);

    expect(result.map((trip) => trip.name)).toEqual(["Viagem visível"]);
    expect(result[0]?.participants[0]?.userId).toBe(activeUserId);
  });

  it("não expõe a Trip de outro User", async () => {
    const result = await listPostgresAuthorizedTrips(otherUserId, database);

    expect(result.map((trip) => trip.name)).toEqual(["Viagem de outro usuário"]);
    expect(result.some((trip) => trip.name === "Viagem visível")).toBe(false);
  });

  it("nega visibilidade para membership inativa", async () => {
    await expect(listPostgresAuthorizedTrips(suspendedUserId, database)).resolves.toEqual([]);
  });

  it("nega visibilidade para Account inativa", async () => {
    await expect(listPostgresAuthorizedTrips(inactiveAccountUserId, database)).resolves.toEqual([]);
  });

  it("não inclui Trip legada sem Account", async () => {
    const result = await listPostgresAuthorizedTrips(activeUserId, database);

    expect(result.some((trip) => trip.name === "Viagem legada sem Account")).toBe(false);
  });
});
