import { and, asc, eq } from "drizzle-orm";

import {
  cancelItineraryProposalGeneration,
  failItineraryProposalGeneration,
  ItineraryProposalRepositoryError,
  requestItineraryProposal,
  startItineraryProposalGeneration,
  type ItineraryProposal,
  type ItineraryProposalId,
  type ItineraryProposalRepository,
} from "@routebook/proposal-management";

import { getDatabase } from "./client";
import { itineraryProposals } from "./proposal-schema";
import { itineraries, trips } from "./schema";

type ItineraryProposalRow = typeof itineraryProposals.$inferSelect;
type ItineraryProposalInsert = typeof itineraryProposals.$inferInsert;

function requireDate(value: Date | null, field: string): Date {
  if (!value) {
    throw new ItineraryProposalRepositoryError(
      `A Itinerary Proposal persistida não possui ${field}.`,
      "invalid-status",
    );
  }
  return value;
}

function requireText(value: string | null, field: string): string {
  if (!value) {
    throw new ItineraryProposalRepositoryError(
      `A Itinerary Proposal persistida não possui ${field}.`,
      "invalid-status",
    );
  }
  return value;
}

function rehydrateItineraryProposal(row: ItineraryProposalRow): ItineraryProposal {
  const requested = requestItineraryProposal({
    id: row.id,
    tripId: row.tripId,
    itineraryId: row.itineraryId,
    baseTripContextVersion: row.baseTripContextVersion,
    baseItineraryVersion: row.baseItineraryVersion,
    contextSnapshotId: row.contextSnapshotId,
    requestedAt: row.requestedAt,
  });

  switch (row.status) {
    case "requested":
      return requested;
    case "generating":
      return startItineraryProposalGeneration(
        requested,
        requireDate(row.generationStartedAt, "generationStartedAt"),
      );
    case "failed": {
      const generating = startItineraryProposalGeneration(
        requested,
        requireDate(row.generationStartedAt, "generationStartedAt"),
      );
      return failItineraryProposalGeneration(
        generating,
        requireText(row.failureCode, "failureCode"),
        requireDate(row.failedAt, "failedAt"),
      );
    }
    case "cancelled": {
      const cancellable = row.generationStartedAt
        ? startItineraryProposalGeneration(requested, row.generationStartedAt)
        : requested;
      return cancelItineraryProposalGeneration(
        cancellable,
        requireDate(row.cancelledAt, "cancelledAt"),
      );
    }
    default:
      throw new ItineraryProposalRepositoryError(
        `Status persistido não suportado: ${row.status}.`,
        "invalid-status",
      );
  }
}

function valuesFor(proposal: ItineraryProposal): ItineraryProposalInsert {
  return {
    id: proposal.id,
    tripId: proposal.tripId,
    itineraryId: proposal.itineraryId,
    baseTripContextVersion: proposal.baseTripContextVersion,
    baseItineraryVersion: proposal.baseItineraryVersion,
    contextSnapshotId: proposal.contextSnapshotId,
    status: proposal.status,
    requestedAt: proposal.requestedAt,
    updatedAt: proposal.updatedAt,
    generationStartedAt: proposal.generationStartedAt ?? null,
    failedAt: proposal.failedAt ?? null,
    failureCode: proposal.failureCode ?? null,
    cancelledAt: proposal.cancelledAt ?? null,
  };
}

async function assertProposalReferences(proposal: ItineraryProposal): Promise<void> {
  const database = getDatabase();
  const [trip] = await database
    .select({ id: trips.id })
    .from(trips)
    .where(eq(trips.id, proposal.tripId))
    .limit(1);
  if (!trip) {
    throw new ItineraryProposalRepositoryError(
      "A Viagem da Itinerary Proposal não existe.",
      "trip-not-found",
    );
  }

  const [itinerary] = await database
    .select({ id: itineraries.id, tripId: itineraries.tripId })
    .from(itineraries)
    .where(eq(itineraries.id, proposal.itineraryId))
    .limit(1);
  if (!itinerary) {
    throw new ItineraryProposalRepositoryError(
      "O Itinerary da Itinerary Proposal não existe.",
      "itinerary-not-found",
    );
  }
  if (itinerary.tripId !== proposal.tripId) {
    throw new ItineraryProposalRepositoryError(
      "O Itinerary não pertence à Viagem da Itinerary Proposal.",
      "itinerary-trip-mismatch",
    );
  }
}

export class DrizzleItineraryProposalRepository implements ItineraryProposalRepository {
  async create(proposal: ItineraryProposal): Promise<ItineraryProposal> {
    if (proposal.status !== "requested") {
      throw new ItineraryProposalRepositoryError(
        "create aceita somente Itinerary Proposals requested.",
        "invalid-status",
      );
    }
    await assertProposalReferences(proposal);

    const inserted = await getDatabase()
      .insert(itineraryProposals)
      .values(valuesFor(proposal))
      .onConflictDoNothing()
      .returning({ id: itineraryProposals.id });
    if (inserted.length === 0) {
      throw new ItineraryProposalRepositoryError(
        "A Itinerary Proposal já existe.",
        "duplicate-proposal",
      );
    }
    return proposal;
  }

  async save(proposal: ItineraryProposal): Promise<ItineraryProposal> {
    await assertProposalReferences(proposal);
    const updated = await getDatabase()
      .update(itineraryProposals)
      .set(valuesFor(proposal))
      .where(
        and(eq(itineraryProposals.id, proposal.id), eq(itineraryProposals.tripId, proposal.tripId)),
      )
      .returning({ id: itineraryProposals.id });
    if (updated.length === 0) {
      throw new ItineraryProposalRepositoryError(
        "A Itinerary Proposal não existe nesta Viagem.",
        "proposal-not-found",
      );
    }
    return proposal;
  }

  async findById(
    tripId: string,
    itineraryProposalId: ItineraryProposalId,
  ): Promise<ItineraryProposal | null> {
    const [row] = await getDatabase()
      .select()
      .from(itineraryProposals)
      .where(
        and(eq(itineraryProposals.tripId, tripId), eq(itineraryProposals.id, itineraryProposalId)),
      )
      .limit(1);
    return row ? rehydrateItineraryProposal(row) : null;
  }

  async listByTripId(tripId: string): Promise<readonly ItineraryProposal[]> {
    const rows = await getDatabase()
      .select()
      .from(itineraryProposals)
      .where(eq(itineraryProposals.tripId, tripId))
      .orderBy(asc(itineraryProposals.requestedAt), asc(itineraryProposals.id));
    return rows.map(rehydrateItineraryProposal);
  }
}
