import { and, asc, eq, inArray } from "drizzle-orm";

import {
  acceptRecommendation,
  createRecommendation,
  expireRecommendation,
  fingerprintRecommendation,
  invalidateRecommendation,
  presentRecommendation,
  RecommendationRepositoryError,
  rejectRecommendation,
  supersedeRecommendation,
  type DecisionContextSnapshot,
  type Recommendation,
  type RecommendationConfidenceLevel,
  type RecommendationId,
  type RecommendationLimitation,
  type RecommendationReason,
  type RecommendationRepository,
  type SaveGeneratedRecommendationMode,
} from "@routebook/decision-intelligence";

import { getDatabase } from "./client";
import { places, recommendations, trips } from "./schema";

type RecommendationRow = typeof recommendations.$inferSelect;
type RecommendationInsert = typeof recommendations.$inferInsert;

type StoredSnapshot = Readonly<{
  schemaVersion: 1;
  tripId: string;
  destinationId: string;
  tripContextVersion: number;
  capturedAt: string;
  travelerProfileVersion?: number;
  itineraryVersion?: number;
}>;

function serializeSnapshot(snapshot: DecisionContextSnapshot): StoredSnapshot {
  return {
    schemaVersion: 1,
    tripId: snapshot.tripId,
    destinationId: snapshot.destinationId,
    tripContextVersion: snapshot.tripContextVersion,
    capturedAt: snapshot.capturedAt.toISOString(),
    ...(snapshot.travelerProfileVersion !== undefined
      ? { travelerProfileVersion: snapshot.travelerProfileVersion }
      : {}),
    ...(snapshot.itineraryVersion !== undefined
      ? { itineraryVersion: snapshot.itineraryVersion }
      : {}),
  };
}

function deserializeSnapshot(value: unknown): DecisionContextSnapshot {
  const snapshot = value as StoredSnapshot;
  return {
    schemaVersion: 1,
    tripId: snapshot.tripId,
    destinationId: snapshot.destinationId,
    tripContextVersion: snapshot.tripContextVersion,
    capturedAt: new Date(snapshot.capturedAt),
    ...(snapshot.travelerProfileVersion !== undefined
      ? { travelerProfileVersion: snapshot.travelerProfileVersion }
      : {}),
    ...(snapshot.itineraryVersion !== undefined
      ? { itineraryVersion: snapshot.itineraryVersion }
      : {}),
  };
}

function requireDate(value: Date | null, field: string): Date {
  if (!value) {
    throw new RecommendationRepositoryError(
      `A Recommendation persistida não possui ${field}.`,
      "invalid-status",
    );
  }
  return value;
}

function requireText(value: string | null, field: string): string {
  if (!value) {
    throw new RecommendationRepositoryError(
      `A Recommendation persistida não possui ${field}.`,
      "invalid-status",
    );
  }
  return value;
}

function rehydrateRecommendation(row: RecommendationRow): Recommendation {
  const generated = createRecommendation({
    id: row.id,
    snapshot: deserializeSnapshot(row.contextSnapshot),
    target: {
      kind: "place",
      placeId: row.placeId,
      destinationId: (row.contextSnapshot as StoredSnapshot).destinationId,
      publicationStatus: "published",
    },
    reasons: row.reasons as RecommendationReason[],
    limitations: row.limitations as RecommendationLimitation[],
    score: { value: row.score, purpose: "ordering-only" },
    confidence: {
      level: row.confidenceLevel as RecommendationConfidenceLevel,
      basis: row.confidenceBasis as string[],
    },
    validity: {
      validFrom: row.validFrom,
      ...(row.expiresAt ? { expiresAt: row.expiresAt } : {}),
    },
    generation: {
      generator: row.generator as Recommendation["generation"]["generator"],
      policyVersion: row.policyVersion,
      generatedAt: row.generatedAt,
    },
  });

  if (row.status === "generated") return generated;

  const active = row.presentedAt ? presentRecommendation(generated, row.presentedAt) : generated;

  switch (row.status) {
    case "presented":
      if (!row.presentedAt) {
        throw new RecommendationRepositoryError(
          "Recommendation apresentada sem instante de apresentação.",
          "invalid-status",
        );
      }
      return active;
    case "rejected":
      if (!row.presentedAt) {
        throw new RecommendationRepositoryError(
          "Recommendation rejeitada sem apresentação anterior.",
          "invalid-status",
        );
      }
      return rejectRecommendation(
        active,
        requireDate(row.resolvedAt, "resolvedAt"),
        row.statusReason ?? "ignored-by-user",
      );
    case "accepted":
      if (!row.presentedAt) {
        throw new RecommendationRepositoryError(
          "Recommendation aceita sem apresentação anterior.",
          "invalid-status",
        );
      }
      return acceptRecommendation(
        active,
        requireText(row.linkedDecisionId, "linkedDecisionId"),
        requireDate(row.resolvedAt, "resolvedAt"),
      );
    case "expired":
      return expireRecommendation(active, requireDate(row.resolvedAt, "resolvedAt"));
    case "invalidated":
      return invalidateRecommendation(
        active,
        requireText(row.statusReason, "statusReason"),
        requireDate(row.resolvedAt, "resolvedAt"),
      );
    case "superseded":
      return supersedeRecommendation(
        active,
        requireText(row.supersededByRecommendationId, "supersededByRecommendationId"),
        requireDate(row.resolvedAt, "resolvedAt"),
      );
    default:
      throw new RecommendationRepositoryError(
        `Status persistido não suportado: ${row.status}.`,
        "invalid-status",
      );
  }
}

function valuesFor(recommendation: Recommendation): RecommendationInsert {
  return {
    id: recommendation.id,
    tripId: recommendation.snapshot.tripId,
    placeId: recommendation.target.placeId,
    status: recommendation.status,
    contextSnapshot: serializeSnapshot(recommendation.snapshot),
    contextFingerprint: fingerprintRecommendation(recommendation),
    reasons: recommendation.reasons,
    limitations: recommendation.limitations,
    score: recommendation.score.value,
    confidenceLevel: recommendation.confidence.level,
    confidenceBasis: recommendation.confidence.basis,
    validFrom: recommendation.validity.validFrom,
    expiresAt: recommendation.validity.expiresAt ?? null,
    generator: recommendation.generation.generator,
    policyVersion: recommendation.generation.policyVersion,
    generatedAt: recommendation.generation.generatedAt,
    presentedAt: recommendation.presentedAt ?? null,
    resolvedAt: recommendation.resolvedAt ?? null,
    linkedDecisionId: recommendation.linkedDecisionId ?? null,
    statusReason: recommendation.statusReason ?? null,
    supersededByRecommendationId: recommendation.supersededByRecommendationId ?? null,
    createdAt: recommendation.createdAt,
    updatedAt: recommendation.updatedAt,
  };
}

async function assertRecommendationReferences(recommendation: Recommendation): Promise<void> {
  const database = getDatabase();
  const [trip] = await database
    .select({ id: trips.id })
    .from(trips)
    .where(eq(trips.id, recommendation.snapshot.tripId))
    .limit(1);
  if (!trip) {
    throw new RecommendationRepositoryError(
      "A Viagem da Recommendation não existe.",
      "trip-not-found",
    );
  }

  const [place] = await database
    .select({
      id: places.id,
      destinationId: places.destinationId,
      publicationStatus: places.publicationStatus,
    })
    .from(places)
    .where(eq(places.id, recommendation.target.placeId))
    .limit(1);
  if (!place) {
    throw new RecommendationRepositoryError("O Lugar recomendado não existe.", "place-not-found");
  }
  if (place.publicationStatus !== "published") {
    throw new RecommendationRepositoryError(
      "Somente Lugares publicados podem ser associados.",
      "place-not-published",
    );
  }
  if (place.destinationId !== recommendation.snapshot.destinationId) {
    throw new RecommendationRepositoryError(
      "O Lugar não pertence ao Destino avaliado.",
      "destination-mismatch",
    );
  }
}

export class DrizzleRecommendationRepository implements RecommendationRepository {
  async findById(
    tripId: string,
    recommendationId: RecommendationId,
  ): Promise<Recommendation | null> {
    const [row] = await getDatabase()
      .select()
      .from(recommendations)
      .where(and(eq(recommendations.tripId, tripId), eq(recommendations.id, recommendationId)))
      .limit(1);
    return row ? rehydrateRecommendation(row) : null;
  }

  async listByTripId(tripId: string): Promise<readonly Recommendation[]> {
    const rows = await getDatabase()
      .select()
      .from(recommendations)
      .where(eq(recommendations.tripId, tripId))
      .orderBy(asc(recommendations.generatedAt), asc(recommendations.id));
    return rows.map(rehydrateRecommendation);
  }

  async saveGenerated(
    recommendation: Recommendation,
    mode: SaveGeneratedRecommendationMode = "reuse-active",
  ): Promise<Recommendation> {
    if (recommendation.status !== "generated") {
      throw new RecommendationRepositoryError(
        "saveGenerated aceita somente Recommendations generated.",
        "invalid-status",
      );
    }
    await assertRecommendationReferences(recommendation);

    const fingerprint = fingerprintRecommendation(recommendation);
    return getDatabase().transaction(async (transaction) => {
      const [activeRow] = await transaction
        .select()
        .from(recommendations)
        .where(
          and(
            eq(recommendations.tripId, recommendation.snapshot.tripId),
            eq(recommendations.placeId, recommendation.target.placeId),
            eq(recommendations.contextFingerprint, fingerprint),
            inArray(recommendations.status, ["generated", "presented"]),
          ),
        )
        .limit(1);

      if (activeRow && mode === "reuse-active") {
        return rehydrateRecommendation(activeRow);
      }

      if (activeRow && mode === "supersede-active") {
        const superseded = supersedeRecommendation(
          rehydrateRecommendation(activeRow),
          recommendation.id,
          recommendation.generation.generatedAt,
        );
        await transaction
          .update(recommendations)
          .set(valuesFor(superseded))
          .where(
            and(eq(recommendations.id, activeRow.id), eq(recommendations.tripId, activeRow.tripId)),
          );
      }

      const inserted = await transaction
        .insert(recommendations)
        .values(valuesFor(recommendation))
        .onConflictDoNothing()
        .returning({ id: recommendations.id });

      if (inserted.length === 0) {
        const [equivalentRow] = await transaction
          .select()
          .from(recommendations)
          .where(
            and(
              eq(recommendations.tripId, recommendation.snapshot.tripId),
              eq(recommendations.placeId, recommendation.target.placeId),
              eq(recommendations.contextFingerprint, fingerprint),
              inArray(recommendations.status, ["generated", "presented"]),
            ),
          )
          .limit(1);
        if (equivalentRow && mode === "reuse-active") {
          return rehydrateRecommendation(equivalentRow);
        }
        throw new RecommendationRepositoryError(
          "Já existe uma Recommendation ativa equivalente.",
          "duplicate-active-recommendation",
        );
      }

      return recommendation;
    });
  }

  async save(recommendation: Recommendation): Promise<Recommendation> {
    await assertRecommendationReferences(recommendation);
    const [existing] = await getDatabase()
      .select({ id: recommendations.id })
      .from(recommendations)
      .where(
        and(
          eq(recommendations.id, recommendation.id),
          eq(recommendations.tripId, recommendation.snapshot.tripId),
        ),
      )
      .limit(1);
    if (!existing) {
      throw new RecommendationRepositoryError(
        "A Recommendation não existe nesta Viagem.",
        "recommendation-not-found",
      );
    }

    await getDatabase()
      .update(recommendations)
      .set(valuesFor(recommendation))
      .where(
        and(
          eq(recommendations.id, recommendation.id),
          eq(recommendations.tripId, recommendation.snapshot.tripId),
        ),
      );
    return recommendation;
  }
}
