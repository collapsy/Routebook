import { randomUUID } from "node:crypto";

import { and, eq, sql } from "drizzle-orm";

import {
  acceptRecommendation,
  createDecision,
  createRecommendationId,
  type Decision,
  type DecisionOption,
} from "@routebook/decision-intelligence";
import type { TripParticipant } from "@routebook/trip-management";

import { getDatabase } from "./client";
import { decisions } from "./decision-schema";
import { DrizzleRecommendationRepository } from "./recommendation-repository";
import {
  itineraries,
  itineraryDays,
  places,
  recommendations,
  savedPlaces,
  trips,
} from "./schema";

export class RecommendationDecisionServiceError extends Error {
  constructor(
    message: string,
    readonly code:
      | "recommendation-not-found"
      | "recommendation-not-eligible"
      | "cross-trip"
      | "place-not-found"
      | "owner-not-found"
      | "day-not-found"
      | "idempotency-conflict",
  ) {
    super(message);
    this.name = "RecommendationDecisionServiceError";
  }
}

type BaseCommand = Readonly<{
  tripId: string;
  recommendationId: string;
  placeId: string;
  idempotencyKey: string;
  decidedAt?: Date;
}>;

export type SaveRecommendedPlaceCommand = BaseCommand;

export type AddRecommendedPlaceToItineraryCommand = BaseCommand &
  Readonly<{
    dayId: string;
    startTime?: string;
    durationMinutes?: number;
  }>;

export type RecommendationDecisionResult = Readonly<{
  decision: Decision;
  effectId: string;
}>;

function ownerFrom(participants: unknown): TripParticipant {
  const owner = (participants as TripParticipant[]).find((participant) => participant.role === "owner");
  if (!owner) {
    throw new RecommendationDecisionServiceError(
      "A Viagem não possui participante owner persistido.",
      "owner-not-found",
    );
  }
  return owner;
}

function sameOption(left: unknown, right: DecisionOption): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function effectId(effect: unknown): string {
  const value = effect as { savedPlaceId?: string; activityId?: string };
  return value.savedPlaceId ?? value.activityId ?? "";
}

async function loadEligibleRecommendation(command: BaseCommand) {
  const recommendation = await new DrizzleRecommendationRepository().findById(
    command.tripId,
    createRecommendationId(command.recommendationId),
  );
  if (!recommendation) {
    throw new RecommendationDecisionServiceError(
      "A Recommendation não foi encontrada nesta Viagem.",
      "recommendation-not-found",
    );
  }
  if (
    recommendation.status !== "presented" ||
    recommendation.target.placeId !== command.placeId ||
    recommendation.snapshot.tripId !== command.tripId
  ) {
    throw new RecommendationDecisionServiceError(
      "A Recommendation não está elegível para esta ação.",
      "recommendation-not-eligible",
    );
  }
  const now = command.decidedAt ?? new Date();
  if (
    recommendation.validity.validFrom.getTime() > now.getTime() ||
    (recommendation.validity.expiresAt && recommendation.validity.expiresAt.getTime() <= now.getTime())
  ) {
    throw new RecommendationDecisionServiceError(
      "A Recommendation não está mais válida.",
      "recommendation-not-eligible",
    );
  }
  return recommendation;
}

async function existingDecision(
  transaction: Parameters<Parameters<ReturnType<typeof getDatabase>["transaction"]>[0]>[0],
  command: BaseCommand,
  option: DecisionOption,
): Promise<RecommendationDecisionResult | null> {
  const [row] = await transaction
    .select()
    .from(decisions)
    .where(
      and(eq(decisions.tripId, command.tripId), eq(decisions.idempotencyKey, command.idempotencyKey)),
    )
    .limit(1);
  if (!row) return null;
  if (!sameOption(row.chosenOption, option) || row.recommendationId !== command.recommendationId) {
    throw new RecommendationDecisionServiceError(
      "A chave de idempotência já foi usada com outro payload.",
      "idempotency-conflict",
    );
  }
  const decision = createDecision({
    id: row.id,
    tripId: row.tripId,
    ...(row.recommendationId
      ? { recommendationId: createRecommendationId(row.recommendationId) }
      : {}),
    actorParticipantId: row.actorParticipantId,
    decidedAt: row.decidedAt,
    chosenOption: row.chosenOption as DecisionOption,
    contextSnapshot: {
      ...(row.contextSnapshot as Decision["contextSnapshot"]),
      capturedAt: new Date(
        (row.contextSnapshot as { capturedAt: string | Date }).capturedAt,
      ),
    },
    effect: row.effect as Decision["effect"],
    idempotencyKey: row.idempotencyKey,
  });
  return { decision, effectId: effectId(row.effect) };
}

async function persistAcceptance(
  transaction: Parameters<Parameters<ReturnType<typeof getDatabase>["transaction"]>[0]>[0],
  decision: Decision,
  accepted: ReturnType<typeof acceptRecommendation>,
): Promise<void> {
  await transaction.insert(decisions).values({
    id: decision.id,
    tripId: decision.tripId,
    recommendationId: decision.recommendationId ?? null,
    actorParticipantId: decision.actorParticipantId,
    decidedAt: decision.decidedAt,
    type: decision.type,
    chosenOption: decision.chosenOption,
    contextSnapshot: {
      ...decision.contextSnapshot,
      capturedAt: decision.contextSnapshot.capturedAt.toISOString(),
    },
    effect: decision.effect,
    idempotencyKey: decision.idempotencyKey,
    createdAt: decision.decidedAt,
  });
  await transaction
    .update(recommendations)
    .set({
      status: accepted.status,
      linkedDecisionId: decision.id,
      resolvedAt: accepted.resolvedAt ?? decision.decidedAt,
      updatedAt: decision.decidedAt,
    })
    .where(
      and(
        eq(recommendations.id, accepted.id),
        eq(recommendations.tripId, accepted.snapshot.tripId),
        eq(recommendations.status, "presented"),
      ),
    );
}

export async function saveRecommendedPlace(
  command: SaveRecommendedPlaceCommand,
): Promise<RecommendationDecisionResult> {
  const recommendation = await loadEligibleRecommendation(command);
  const decidedAt = command.decidedAt ?? new Date();
  const option = { type: "save-place", placeId: command.placeId } as const;

  return getDatabase().transaction(async (transaction) => {
    const repeated = await existingDecision(transaction, command, option);
    if (repeated) return repeated;

    const [trip] = await transaction.select().from(trips).where(eq(trips.id, command.tripId)).limit(1);
    if (!trip) {
      throw new RecommendationDecisionServiceError("A Viagem não existe.", "cross-trip");
    }
    const owner = ownerFrom(trip.participants);
    const [place] = await transaction
      .select()
      .from(places)
      .where(eq(places.id, command.placeId))
      .limit(1);
    if (!place || place.publicationStatus !== "published") {
      throw new RecommendationDecisionServiceError("O Lugar não existe ou não está publicado.", "place-not-found");
    }

    const [existingSaved] = await transaction
      .select()
      .from(savedPlaces)
      .where(and(eq(savedPlaces.tripId, command.tripId), eq(savedPlaces.placeId, command.placeId)))
      .limit(1);
    const savedPlaceId = existingSaved?.id ?? randomUUID();
    if (!existingSaved) {
      await transaction.insert(savedPlaces).values({
        id: savedPlaceId,
        tripId: command.tripId,
        placeId: command.placeId,
        createdAt: decidedAt,
      });
    }

    const decision = createDecision({
      tripId: command.tripId,
      recommendationId: recommendation.id,
      actorParticipantId: owner.userId,
      decidedAt,
      chosenOption: option,
      contextSnapshot: recommendation.snapshot,
      effect: { type: "saved-place", savedPlaceId },
      idempotencyKey: command.idempotencyKey,
    });
    await persistAcceptance(
      transaction,
      decision,
      acceptRecommendation(recommendation, decision.id, decidedAt),
    );
    return { decision, effectId: savedPlaceId };
  });
}

export async function addRecommendedPlaceToItinerary(
  command: AddRecommendedPlaceToItineraryCommand,
): Promise<RecommendationDecisionResult> {
  const recommendation = await loadEligibleRecommendation(command);
  const decidedAt = command.decidedAt ?? new Date();
  const decidedAtIso = decidedAt.toISOString();
  const option = {
    type: "add-to-itinerary",
    placeId: command.placeId,
    dayId: command.dayId,
    ...(command.startTime ? { startTime: command.startTime } : {}),
    ...(command.durationMinutes ? { durationMinutes: command.durationMinutes } : {}),
  } as const;

  return getDatabase().transaction(async (transaction) => {
    const repeated = await existingDecision(transaction, command, option);
    if (repeated) return repeated;

    const [trip] = await transaction.select().from(trips).where(eq(trips.id, command.tripId)).limit(1);
    if (!trip) {
      throw new RecommendationDecisionServiceError("A Viagem não existe.", "cross-trip");
    }
    const owner = ownerFrom(trip.participants);
    const [place] = await transaction
      .select()
      .from(places)
      .where(eq(places.id, command.placeId))
      .limit(1);
    if (!place || place.publicationStatus !== "published") {
      throw new RecommendationDecisionServiceError("O Lugar não existe ou não está publicado.", "place-not-found");
    }
    const [day] = await transaction
      .select({ id: itineraryDays.id, itineraryId: itineraryDays.itineraryId })
      .from(itineraryDays)
      .innerJoin(itineraries, eq(itineraries.id, itineraryDays.itineraryId))
      .where(and(eq(itineraryDays.id, command.dayId), eq(itineraries.tripId, command.tripId)))
      .limit(1);
    if (!day) {
      throw new RecommendationDecisionServiceError(
        "Selecione um Dia pertencente a esta Viagem.",
        "day-not-found",
      );
    }

    const activityId = randomUUID();
    const decision = createDecision({
      tripId: command.tripId,
      recommendationId: recommendation.id,
      actorParticipantId: owner.userId,
      decidedAt,
      chosenOption: option,
      contextSnapshot: recommendation.snapshot,
      effect: { type: "itinerary-activity", activityId },
      idempotencyKey: command.idempotencyKey,
    });
    await persistAcceptance(
      transaction,
      decision,
      acceptRecommendation(recommendation, decision.id, decidedAt),
    );

    await transaction.execute(sql`
      INSERT INTO itinerary_activities (
        id, itinerary_day_id, title, type, status, flexibility,
        start_time, duration_minutes, "order", place_id, decision_id,
        created_at, updated_at
      )
      SELECT
        ${activityId}::uuid,
        ${day.id}::uuid,
        ${place.name},
        'place-visit',
        'planned',
        'suggested',
        ${command.startTime ?? null},
        ${command.durationMinutes ?? null},
        COALESCE(MAX("order"), 0) + 1,
        ${command.placeId}::uuid,
        ${decision.id}::uuid,
        ${decidedAtIso}::timestamptz,
        ${decidedAtIso}::timestamptz
      FROM itinerary_activities
      WHERE itinerary_day_id = ${day.id}::uuid
    `);
    await transaction
      .update(itineraries)
      .set({ version: sql`${itineraries.version} + 1`, updatedAt: decidedAt })
      .where(eq(itineraries.id, day.itineraryId));
    return { decision, effectId: activityId };
  });
}
