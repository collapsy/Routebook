import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq, inArray, sql } from "drizzle-orm";

import { authUsers } from "./auth-schema";
import {
  AuthenticatedTripCreationError,
  createPostgresAuthenticatedTrip,
} from "./authenticated-trip-service";
import { closeDatabase, getDatabase } from "./client";
import { accountMemberships, accounts, personalAccountOwnerships } from "./identity-schema";
import { trips } from "./schema";

const database = getDatabase();
const now = new Date("2026-08-02T23:00:00.000Z");
const primaryUserId = randomUUID();
const secondaryUserId = randomUUID();
const concurrentUserId = randomUUID();
const rollbackUserId = randomUUID();
const createdTripIds: string[] = [];
const createdAccountIds = new Set<string>();

function tripInput(name: string) {
  return {
    name,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    accommodationName: "Condomínio Solar Água",
    accommodationAddress: "Pipa, Tibau do Sul - RN",
  };
}

function errorChainContains(error: unknown, expected: string): boolean {
  let current: unknown = error;
  const visited = new Set<unknown>();

  while (current instanceof Error && !visited.has(current)) {
    visited.add(current);
    if (current.message.includes(expected)) return true;
    current = current.cause;
  }

  return false;
}

beforeAll(async () => {
  await database.insert(authUsers).values([
    {
      id: primaryUserId,
      name: "Ronaldo Gentil",
      email: `primary-${primaryUserId}@example.com`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: secondaryUserId,
      name: "Segundo Viajante",
      email: `secondary-${secondaryUserId}@example.com`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: concurrentUserId,
      name: "Viajante Concorrente",
      email: `concurrent-${concurrentUserId}@example.com`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: rollbackUserId,
      name: "Rollback User",
      email: `rollback-${rollbackUserId}@example.com`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);
});

afterAll(async () => {
  if (createdTripIds.length > 0) {
    await database.delete(trips).where(inArray(trips.id, createdTripIds));
  }
  if (createdAccountIds.size > 0) {
    await database.delete(accounts).where(inArray(accounts.id, [...createdAccountIds]));
  }
  await database
    .delete(authUsers)
    .where(
      inArray(authUsers.id, [primaryUserId, secondaryUserId, concurrentUserId, rollbackUserId]),
    );
  await closeDatabase();
});

describe("createPostgresAuthenticatedTrip", () => {
  it("provisiona uma vez e reutiliza a mesma Account pessoal", async () => {
    const first = await createPostgresAuthenticatedTrip(
      { userId: primaryUserId, trip: tripInput("Primeira viagem autenticada") },
      database,
      now,
    );
    const second = await createPostgresAuthenticatedTrip(
      { userId: primaryUserId, trip: tripInput("Segunda viagem autenticada") },
      database,
      new Date("2026-08-02T23:05:00.000Z"),
    );
    createdTripIds.push(first.trip.id, second.trip.id);
    createdAccountIds.add(first.accountId);

    expect(first.personalAccount).toBe("created");
    expect(second.personalAccount).toBe("existing");
    expect(second.accountId).toBe(first.accountId);
    expect(second.membershipId).toBe(first.membershipId);
    expect(first.trip.participants[0]?.userId).toBe(primaryUserId);
    expect(second.trip.participants[0]?.userId).toBe(primaryUserId);

    const persistedTrips = await database
      .select({ id: trips.id, accountId: trips.accountId, participants: trips.participants })
      .from(trips)
      .where(inArray(trips.id, [first.trip.id, second.trip.id]));
    expect(persistedTrips).toHaveLength(2);
    expect(persistedTrips.every((trip) => trip.accountId === first.accountId)).toBe(true);
  });

  it("mantém Accounts pessoais isoladas entre Users", async () => {
    const result = await createPostgresAuthenticatedTrip(
      { userId: secondaryUserId, trip: tripInput("Viagem de outro usuário") },
      database,
      now,
    );
    createdTripIds.push(result.trip.id);
    createdAccountIds.add(result.accountId);

    const primaryOwnership = await database
      .select()
      .from(personalAccountOwnerships)
      .where(eq(personalAccountOwnerships.userId, primaryUserId))
      .limit(1);

    expect(result.accountId).not.toBe(primaryOwnership[0]?.accountId);
    expect(result.trip.participants[0]?.userId).toBe(secondaryUserId);
  });

  it("rejeita User inexistente sem criar registros", async () => {
    const missingUserId = randomUUID();

    await expect(
      createPostgresAuthenticatedTrip(
        { userId: missingUserId, trip: tripInput("Viagem impossível") },
        database,
        now,
      ),
    ).rejects.toEqual(new AuthenticatedTripCreationError("user-not-found"));

    const ownerships = await database
      .select()
      .from(personalAccountOwnerships)
      .where(eq(personalAccountOwnerships.userId, missingUserId));
    expect(ownerships).toHaveLength(0);
  });

  it("serializa chamadas concorrentes e cria uma única Account pessoal", async () => {
    const [first, second] = await Promise.all([
      createPostgresAuthenticatedTrip(
        { userId: concurrentUserId, trip: tripInput("Concorrente A") },
        database,
        now,
      ),
      createPostgresAuthenticatedTrip(
        { userId: concurrentUserId, trip: tripInput("Concorrente B") },
        database,
        now,
      ),
    ]);
    createdTripIds.push(first.trip.id, second.trip.id);
    createdAccountIds.add(first.accountId);

    expect([first.personalAccount, second.personalAccount].sort()).toEqual(["created", "existing"]);
    expect(second.accountId).toBe(first.accountId);
    expect(second.membershipId).toBe(first.membershipId);

    const ownerships = await database
      .select()
      .from(personalAccountOwnerships)
      .where(eq(personalAccountOwnerships.userId, concurrentUserId));
    const memberships = await database
      .select()
      .from(accountMemberships)
      .where(eq(accountMemberships.userId, concurrentUserId));
    expect(ownerships).toHaveLength(1);
    expect(memberships).toHaveLength(1);
  });

  it("reverte o provisionamento quando a persistência da Trip falha", async () => {
    await database.execute(
      sql.raw(`
      CREATE OR REPLACE FUNCTION rb_inc_088_reject_trip()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      BEGIN
        IF NEW.name = 'Rollback autenticado' THEN
          RAISE EXCEPTION 'RB-INC-088 forced Trip failure';
        END IF;
        RETURN NEW;
      END;
      $$
    `),
    );
    await database.execute(
      sql.raw(`
      CREATE TRIGGER rb_inc_088_reject_trip_trigger
      BEFORE INSERT ON trips
      FOR EACH ROW EXECUTE FUNCTION rb_inc_088_reject_trip()
    `),
    );

    let failure: unknown;
    try {
      await createPostgresAuthenticatedTrip(
        { userId: rollbackUserId, trip: tripInput("Rollback autenticado") },
        database,
        now,
      );
    } catch (error) {
      failure = error;
    } finally {
      await database.execute(
        sql.raw("DROP TRIGGER IF EXISTS rb_inc_088_reject_trip_trigger ON trips"),
      );
      await database.execute(sql.raw("DROP FUNCTION IF EXISTS rb_inc_088_reject_trip()"));
    }

    expect(failure).toBeInstanceOf(Error);
    expect(errorChainContains(failure, "RB-INC-088 forced Trip failure")).toBe(true);

    const ownerships = await database
      .select()
      .from(personalAccountOwnerships)
      .where(eq(personalAccountOwnerships.userId, rollbackUserId));
    const memberships = await database
      .select()
      .from(accountMemberships)
      .where(eq(accountMemberships.userId, rollbackUserId));
    const rollbackAccounts = await database
      .select()
      .from(accounts)
      .where(eq(accounts.name, "Conta pessoal de Rollback User"));

    expect(ownerships).toHaveLength(0);
    expect(memberships).toHaveLength(0);
    expect(rollbackAccounts).toHaveLength(0);
  });
});
