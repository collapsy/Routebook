import { and, desc, eq } from "drizzle-orm";

import type { Trip } from "@routebook/trip-management";

import { getDatabase } from "./client";
import { accountMemberships, accounts } from "./identity-schema";
import { trips } from "./schema";
import { mapTripRow } from "./trip-repository";

export async function listPostgresAuthorizedTrips(
  userId: string,
  database: ReturnType<typeof getDatabase> = getDatabase(),
): Promise<Trip[]> {
  const rows = await database
    .select({ trip: trips })
    .from(trips)
    .innerJoin(
      accounts,
      and(eq(trips.accountId, accounts.id), eq(accounts.status, "active")),
    )
    .innerJoin(
      accountMemberships,
      and(
        eq(accountMemberships.accountId, accounts.id),
        eq(accountMemberships.userId, userId),
        eq(accountMemberships.status, "active"),
      ),
    )
    .orderBy(desc(trips.createdAt));

  return rows.map(({ trip }) => mapTripRow(trip));
}
