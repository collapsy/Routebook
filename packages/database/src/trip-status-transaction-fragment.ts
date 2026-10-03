import { and, eq } from "drizzle-orm";

import { markTripAsPlanned } from "@routebook/trip-management";

import type { ItineraryProposalDatabaseExecutor } from "./proposal-repository";
import { mapTripRow } from "./trip-repository";
import { trips } from "./schema";

export interface TripStatusTransactionFragment {
  markPlannedIfDraft(tripId: string, appliedAt: Date): Promise<void>;
}

export function createTripStatusTransactionFragment<
  TExecutor extends ItineraryProposalDatabaseExecutor,
>(executor: TExecutor): TripStatusTransactionFragment {
  return Object.freeze({
    async markPlannedIfDraft(tripId: string, appliedAt: Date): Promise<void> {
      if (typeof tripId !== "string" || !tripId.trim()) {
        throw new TypeError("Informe tripId para atualizar o status da Trip.");
      }
      if (!(appliedAt instanceof Date) || Number.isNaN(appliedAt.getTime())) {
        throw new TypeError("Informe appliedAt como uma data válida.");
      }

      const [row] = await executor
        .select()
        .from(trips)
        .where(eq(trips.id, tripId))
        .for("update")
        .limit(1);
      if (!row) throw new Error("A Trip da aplicação da Proposal não foi encontrada.");

      const trip = mapTripRow(row);
      const plannedTrip = markTripAsPlanned(trip, appliedAt);
      if (plannedTrip === trip) return;

      const updatedRows = await executor
        .update(trips)
        .set({ status: plannedTrip.status, updatedAt: plannedTrip.updatedAt })
        .where(and(eq(trips.id, trip.id), eq(trips.status, "draft")))
        .returning({ id: trips.id });

      if (updatedRows.length !== 1) {
        throw new Error("Não foi possível confirmar a transição da Trip para planned.");
      }
    },
  });
}
