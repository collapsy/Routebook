import { eq } from "drizzle-orm";

import type {
  InterestCategory,
  Pace,
  TravelerProfile,
  TravelerProfileRepository,
  TransportPreference,
} from "@routebook/traveler-profile";

import { getDatabase } from "./client";
import { travelerProfiles } from "./schema";

function mapProfile(row: typeof travelerProfiles.$inferSelect): TravelerProfile {
  return {
    id: row.id,
    tripId: row.tripId,
    travelerCount: row.travelerCount,
    interests: row.interests as InterestCategory[],
    ...(row.pace ? { pace: row.pace as Pace } : {}),
    ...(row.transportPreference
      ? { transportPreference: row.transportPreference as TransportPreference }
      : {}),
    ...(row.budgetTotalCents && row.budgetCurrency === "BRL"
      ? {
          budget: {
            totalCents: row.budgetTotalCents,
            currency: "BRL" as const,
            kind: "estimate" as const,
          },
        }
      : {}),
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleTravelerProfileRepository implements TravelerProfileRepository {
  async findByTripId(tripId: string): Promise<TravelerProfile | null> {
    const [row] = await getDatabase()
      .select()
      .from(travelerProfiles)
      .where(eq(travelerProfiles.tripId, tripId))
      .limit(1);

    return row ? mapProfile(row) : null;
  }

  async upsert(profile: TravelerProfile): Promise<void> {
    await getDatabase()
      .insert(travelerProfiles)
      .values({
        id: profile.id,
        tripId: profile.tripId,
        travelerCount: profile.travelerCount,
        interests: profile.interests,
        pace: profile.pace,
        transportPreference: profile.transportPreference,
        budgetTotalCents: profile.budget?.totalCents,
        budgetCurrency: profile.budget?.currency,
        version: profile.version,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      })
      .onConflictDoUpdate({
        target: travelerProfiles.tripId,
        set: {
          travelerCount: profile.travelerCount,
          interests: profile.interests,
          pace: profile.pace,
          transportPreference: profile.transportPreference,
          budgetTotalCents: profile.budget?.totalCents,
          budgetCurrency: profile.budget?.currency,
          version: profile.version,
          updatedAt: profile.updatedAt,
        },
      });
  }
}
