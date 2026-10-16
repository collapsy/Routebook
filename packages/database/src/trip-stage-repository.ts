import { and, asc, eq, sql } from "drizzle-orm";

import type { DestinationType, TripStage } from "@routebook/trip-management";

import type { DestinationResolutionProvenanceInput } from "./authenticated-trip-service";
import { getDatabase } from "./client";
import { trips, tripStages } from "./schema";

type TripStageRow = typeof tripStages.$inferSelect;

export function mapTripStageRow(row: TripStageRow): TripStage {
  return {
    id: row.id,
    tripId: row.tripId,
    destination: {
      name: row.destinationName,
      type: row.destinationType as DestinationType,
      countryCode: row.countryCode,
      latitude: row.latitude,
      longitude: row.longitude,
      timeZone: row.timeZone,
    },
    startDate: row.startDate,
    endDate: row.endDate,
    createdAt: row.createdAt,
  };
}

export class DrizzleTripStageRepository {
  async listByTripId(tripId: string): Promise<TripStage[]> {
    const rows = await getDatabase()
      .select()
      .from(tripStages)
      .where(eq(tripStages.tripId, tripId))
      .orderBy(asc(tripStages.startDate), asc(tripStages.createdAt));
    return rows.map(mapTripStageRow);
  }

  async findById(tripId: string, stageId: string): Promise<TripStage | null> {
    const [row] = await getDatabase()
      .select()
      .from(tripStages)
      .where(and(eq(tripStages.tripId, tripId), eq(tripStages.id, stageId)))
      .limit(1);
    return row ? mapTripStageRow(row) : null;
  }

  async add(stage: TripStage, provenance: DestinationResolutionProvenanceInput): Promise<void> {
    await getDatabase().transaction(async (transaction) => {
      const [trip] = await transaction
        .select({ startDate: trips.startDate, endDate: trips.endDate, timeZone: trips.timeZone })
        .from(trips)
        .where(eq(trips.id, stage.tripId))
        .limit(1);
      if (
        !trip ||
        stage.startDate < trip.startDate ||
        stage.endDate > trip.endDate ||
        stage.destination.timeZone !== trip.timeZone
      ) {
        throw new Error("Etapa incompatível com o período ou fuso da viagem.");
      }
      await transaction.insert(tripStages).values({
        id: stage.id,
        tripId: stage.tripId,
        destinationName: stage.destination.name,
        destinationType: stage.destination.type,
        countryCode: stage.destination.countryCode,
        latitude: stage.destination.latitude,
        longitude: stage.destination.longitude,
        timeZone: stage.destination.timeZone,
        destinationProvenance: {
          provider: provenance.provider,
          externalReference: provenance.externalReference,
          sourceLicense: provenance.sourceLicense,
          ...(provenance.sourceUrl ? { sourceUrl: provenance.sourceUrl } : {}),
          collectedAt: provenance.collectedAt.toISOString(),
          method: provenance.method,
          confidenceLevel: provenance.confidenceLevel,
          metadata: provenance.metadata ?? {},
        },
        startDate: stage.startDate,
        endDate: stage.endDate,
        createdAt: stage.createdAt,
      });
      await transaction
        .update(trips)
        .set({ contextVersion: sql`${trips.contextVersion} + 1`, updatedAt: new Date() })
        .where(eq(trips.id, stage.tripId));
    });
  }

  async remove(tripId: string, stageId: string): Promise<boolean> {
    return getDatabase().transaction(async (transaction) => {
      const deleted = await transaction
        .delete(tripStages)
        .where(and(eq(tripStages.tripId, tripId), eq(tripStages.id, stageId)))
        .returning({ id: tripStages.id });
      if (deleted.length === 0) return false;
      await transaction
        .update(trips)
        .set({ contextVersion: sql`${trips.contextVersion} + 1`, updatedAt: new Date() })
        .where(eq(trips.id, tripId));
      return true;
    });
  }
}
