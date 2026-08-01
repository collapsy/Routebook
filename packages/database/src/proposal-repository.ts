import { and, asc, eq, inArray } from "drizzle-orm";

import {
  cancelItineraryProposalGeneration,
  completeItineraryProposalGeneration,
  expireItineraryProposalByTime,
  failItineraryProposalGeneration,
  ItineraryProposalRepositoryError,
  rejectItineraryProposal,
  requestItineraryProposal,
  startItineraryProposalGeneration,
  type ItineraryProposal,
  type ItineraryProposalId,
  type ItineraryProposalRepository,
  type ProposedActivity,
  type ProposedActivityOperationType,
} from "@routebook/proposal-management";

import { getDatabase } from "./client";
import { itineraryProposals, proposedActivities } from "./proposal-schema";
import { itineraries, trips } from "./schema";

type ItineraryProposalRow = typeof itineraryProposals.$inferSelect;
type ItineraryProposalInsert = typeof itineraryProposals.$inferInsert;
type ProposedActivityRow = typeof proposedActivities.$inferSelect;
type ProposedActivityInsert = typeof proposedActivities.$inferInsert;

const operationTypes: readonly ProposedActivityOperationType[] = [
  "add",
  "move",
  "update",
  "remove",
];

function hasReviewableContent(proposal: Readonly<{ status: string }>): boolean {
  return (
    proposal.status === "ready" || proposal.status === "rejected" || proposal.status === "expired"
  );
}

function invalidPersistence(message: string): ItineraryProposalRepositoryError {
  return new ItineraryProposalRepositoryError(message, "invalid-status");
}

function requireDate(value: Date | null, field: string): Date {
  if (!value) throw invalidPersistence(`A Itinerary Proposal persistida não possui ${field}.`);
  return value;
}

function requireText(value: string | null, field: string): string {
  if (!value?.trim())
    throw invalidPersistence(`A Itinerary Proposal persistida não possui ${field}.`);
  return value;
}

function requireStringArray(
  value: unknown,
  field: string,
  requireAtLeastOne: boolean,
): readonly string[] {
  if (!Array.isArray(value) || (requireAtLeastOne && value.length === 0)) {
    throw invalidPersistence(`O snapshot persistido em ${field} não é um array válido.`);
  }
  if (value.some((item) => typeof item !== "string" || !item.trim())) {
    throw invalidPersistence(`O snapshot persistido em ${field} contém item inválido.`);
  }
  return value;
}

function operationType(value: string): ProposedActivityOperationType {
  if (!operationTypes.includes(value as ProposedActivityOperationType)) {
    throw invalidPersistence(
      `A Proposed Activity persistida possui operationType inválido: ${value}.`,
    );
  }
  return value as ProposedActivityOperationType;
}

function optionalAmount(value: string | null): number | undefined {
  if (value === null) return undefined;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw invalidPersistence("A Proposed Activity persistida possui custo inválido.");
  }
  return amount;
}

function mapProposedActivity(row: ProposedActivityRow): ProposedActivity {
  const estimatedCostAmount = optionalAmount(row.estimatedCostAmount);
  return {
    proposedActivityId: row.id,
    title: row.title,
    operationType: operationType(row.operationType),
    ...(row.targetTripDayId ? { targetTripDayId: row.targetTripDayId } : {}),
    ...(row.sourceActivityId ? { sourceActivityId: row.sourceActivityId } : {}),
    ...(row.placeId ? { placeId: row.placeId } : {}),
    ...(row.description ? { description: row.description } : {}),
    ...(row.proposedStartTime ? { proposedStartTime: row.proposedStartTime } : {}),
    ...(row.durationMinutes !== null ? { durationMinutes: row.durationMinutes } : {}),
    ...(row.proposedOrder !== null ? { proposedOrder: row.proposedOrder } : {}),
    ...(row.flexibility ? { flexibility: row.flexibility } : {}),
    ...(estimatedCostAmount !== undefined ? { estimatedCostAmount } : {}),
    ...(row.estimatedCostCurrency ? { estimatedCostCurrency: row.estimatedCostCurrency } : {}),
    ...(row.reason ? { reason: row.reason } : {}),
  };
}

function rehydrateItineraryProposal(
  row: ItineraryProposalRow,
  activityRows: readonly ProposedActivityRow[],
): ItineraryProposal {
  try {
    const requested = requestItineraryProposal({
      id: row.id,
      tripId: row.tripId,
      itineraryId: row.itineraryId,
      baseTripContextVersion: row.baseTripContextVersion,
      baseItineraryVersion: row.baseItineraryVersion,
      contextSnapshotId: row.contextSnapshotId,
      requestedAt: row.requestedAt,
    });

    if (!hasReviewableContent(row) && activityRows.length > 0) {
      throw invalidPersistence("Uma Itinerary Proposal não pronta possui Proposed Activities.");
    }

    switch (row.status) {
      case "requested":
        return requested;
      case "generating":
        return startItineraryProposalGeneration(
          requested,
          requireDate(row.generationStartedAt, "generationStartedAt"),
        );
      case "ready":
      case "rejected":
      case "expired": {
        if (row.contentSchemaVersion !== 1) {
          throw invalidPersistence(
            `Versão de snapshot persistida não suportada: ${String(row.contentSchemaVersion)}.`,
          );
        }
        const generating = startItineraryProposalGeneration(
          requested,
          requireDate(row.generationStartedAt, "generationStartedAt"),
        );
        const ready = completeItineraryProposalGeneration(generating, {
          generationMethod: requireText(row.generationMethod, "generationMethod"),
          generationVersion: requireText(row.generationVersion, "generationVersion"),
          proposedActivities: activityRows.map(mapProposedActivity),
          criteria: requireStringArray(row.criteria, "criteria", true),
          justifications: requireStringArray(row.justifications, "justifications", true),
          limitations: requireStringArray(row.limitations, "limitations", false),
          planningConflictIds: requireStringArray(
            row.planningConflictIds,
            "planningConflictIds",
            false,
          ),
          generatedAt: requireDate(row.generatedAt, "generatedAt"),
          validUntil: requireDate(row.validUntil, "validUntil"),
        });
        if (row.status === "rejected") {
          return rejectItineraryProposal(ready, requireDate(row.rejectedAt, "rejectedAt"));
        }
        if (row.status === "expired") {
          return expireItineraryProposalByTime(ready, requireDate(row.expiredAt, "expiredAt"));
        }
        return ready;
      }
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
        throw invalidPersistence(`Status persistido não suportado: ${row.status}.`);
    }
  } catch (error) {
    if (error instanceof ItineraryProposalRepositoryError) throw error;
    throw invalidPersistence(
      `A Itinerary Proposal persistida não pôde ser reidratada: ${error instanceof Error ? error.message : "erro desconhecido"}`,
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
    generationMethod: proposal.generationMethod ?? null,
    generationVersion: proposal.generationVersion ?? null,
    contentSchemaVersion: hasReviewableContent(proposal) ? 1 : null,
    criteria: proposal.criteria ?? null,
    justifications: proposal.justifications ?? null,
    limitations: proposal.limitations ?? null,
    planningConflictIds: proposal.planningConflictIds ?? null,
    generatedAt: proposal.generatedAt ?? null,
    validUntil: proposal.validUntil ?? null,
    rejectedAt: proposal.rejectedAt ?? null,
    expiredAt: proposal.expiredAt ?? null,
    failedAt: proposal.failedAt ?? null,
    failureCode: proposal.failureCode ?? null,
    cancelledAt: proposal.cancelledAt ?? null,
  };
}

function activityValuesFor(proposal: ItineraryProposal): ProposedActivityInsert[] {
  if (!hasReviewableContent(proposal)) return [];
  return (proposal.proposedActivities ?? []).map((activity) => ({
    id: activity.proposedActivityId,
    itineraryProposalId: proposal.id,
    targetTripDayId: activity.targetTripDayId ?? null,
    sourceActivityId: activity.sourceActivityId ?? null,
    placeId: activity.placeId ?? null,
    title: activity.title,
    description: activity.description ?? null,
    proposedStartTime: activity.proposedStartTime ?? null,
    durationMinutes: activity.durationMinutes ?? null,
    proposedOrder: activity.proposedOrder ?? null,
    operationType: activity.operationType,
    flexibility: activity.flexibility ?? null,
    estimatedCostAmount:
      activity.estimatedCostAmount === undefined ? null : String(activity.estimatedCostAmount),
    estimatedCostCurrency: activity.estimatedCostCurrency ?? null,
    reason: activity.reason ?? null,
  }));
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
    const activityValues = activityValuesFor(proposal);
    return getDatabase().transaction(async (transaction) => {
      const updated = await transaction
        .update(itineraryProposals)
        .set(valuesFor(proposal))
        .where(
          and(
            eq(itineraryProposals.id, proposal.id),
            eq(itineraryProposals.tripId, proposal.tripId),
          ),
        )
        .returning({ id: itineraryProposals.id });
      if (updated.length === 0) {
        throw new ItineraryProposalRepositoryError(
          "A Itinerary Proposal não existe nesta Viagem.",
          "proposal-not-found",
        );
      }

      await transaction
        .delete(proposedActivities)
        .where(eq(proposedActivities.itineraryProposalId, proposal.id));
      if (activityValues.length > 0) {
        await transaction.insert(proposedActivities).values(activityValues);
      }
      return proposal;
    });
  }

  async findById(
    tripId: string,
    itineraryProposalId: ItineraryProposalId,
  ): Promise<ItineraryProposal | null> {
    const database = getDatabase();
    const [row] = await database
      .select()
      .from(itineraryProposals)
      .where(
        and(eq(itineraryProposals.tripId, tripId), eq(itineraryProposals.id, itineraryProposalId)),
      )
      .limit(1);
    if (!row) return null;
    const activityRows = await database
      .select()
      .from(proposedActivities)
      .where(eq(proposedActivities.itineraryProposalId, row.id))
      .orderBy(asc(proposedActivities.proposedOrder), asc(proposedActivities.id));
    return rehydrateItineraryProposal(row, activityRows);
  }

  async listByTripId(tripId: string): Promise<readonly ItineraryProposal[]> {
    const database = getDatabase();
    const rows = await database
      .select()
      .from(itineraryProposals)
      .where(eq(itineraryProposals.tripId, tripId))
      .orderBy(asc(itineraryProposals.requestedAt), asc(itineraryProposals.id));
    if (rows.length === 0) return [];

    const activityRows = await database
      .select()
      .from(proposedActivities)
      .where(
        inArray(
          proposedActivities.itineraryProposalId,
          rows.map(({ id }) => id),
        ),
      )
      .orderBy(
        asc(proposedActivities.itineraryProposalId),
        asc(proposedActivities.proposedOrder),
        asc(proposedActivities.id),
      );
    const activitiesByProposal = new Map<string, ProposedActivityRow[]>();
    for (const activity of activityRows) {
      const current = activitiesByProposal.get(activity.itineraryProposalId) ?? [];
      current.push(activity);
      activitiesByProposal.set(activity.itineraryProposalId, current);
    }
    return rows.map((row) =>
      rehydrateItineraryProposal(row, activitiesByProposal.get(row.id) ?? []),
    );
  }
}
