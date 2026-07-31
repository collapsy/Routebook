import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addRecommendedPlaceToItinerary,
  DrizzleRecommendationRepository,
  RecommendationDecisionServiceError,
  saveRecommendedPlace,
} from "@routebook/database";
import {
  createRecommendationId,
  RecommendationTransitionError,
  rejectRecommendation,
} from "@routebook/decision-intelligence";

function recommendationPath(tripId: string): string {
  return `/viagens/${tripId}/recomendacoes`;
}

function required(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function optionalPositiveInteger(formData: FormData, name: string): number | undefined {
  const raw = required(formData, name);
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : undefined;
}

function redirectServiceError(tripId: string, error: RecommendationDecisionServiceError): never {
  const codeByError = {
    "recommendation-not-found": "recomendacao-nao-encontrada",
    "recommendation-not-eligible": "estado-incompativel",
    "cross-trip": "acao-cross-trip",
    "place-not-found": "lugar-nao-encontrado",
    "owner-not-found": "responsavel-nao-encontrado",
    "day-not-found": "dia-invalido",
    "idempotency-conflict": "conflito-idempotencia",
  } as const;
  redirect(`${recommendationPath(tripId)}?erro=${codeByError[error.code]}`);
}

export async function saveRecommendationPlaceAction(formData: FormData): Promise<never> {
  "use server";

  const tripId = required(formData, "tripId");
  const recommendationId = required(formData, "recommendationId");
  const placeId = required(formData, "placeId");
  if (!tripId || !recommendationId || !placeId) {
    redirect("/viagens?erro=recomendacao-invalida");
  }

  try {
    await saveRecommendedPlace({
      tripId,
      recommendationId,
      placeId,
      idempotencyKey: `${recommendationId}:save-place`,
    });
  } catch (error) {
    if (error instanceof RecommendationDecisionServiceError) {
      redirectServiceError(tripId, error);
    }
    throw error;
  }

  revalidatePath(recommendationPath(tripId));
  revalidatePath(`/viagens/${tripId}/salvos`);
  revalidatePath(`/viagens/${tripId}`);
  redirect(`${recommendationPath(tripId)}?salva=1`);
}

export async function addRecommendationToItineraryAction(formData: FormData): Promise<never> {
  "use server";

  const tripId = required(formData, "tripId");
  const recommendationId = required(formData, "recommendationId");
  const placeId = required(formData, "placeId");
  const dayId = required(formData, "dayId");
  const startTime = required(formData, "startTime");
  const durationMinutes = optionalPositiveInteger(formData, "durationMinutes");
  if (!tripId || !recommendationId || !placeId || !dayId) {
    redirect(`${recommendationPath(tripId)}?erro=dia-invalido`);
  }

  try {
    await addRecommendedPlaceToItinerary({
      tripId,
      recommendationId,
      placeId,
      dayId,
      idempotencyKey: `${recommendationId}:add-to-itinerary:${dayId}`,
      ...(startTime ? { startTime } : {}),
      ...(durationMinutes ? { durationMinutes } : {}),
    });
  } catch (error) {
    if (error instanceof RecommendationDecisionServiceError) {
      redirectServiceError(tripId, error);
    }
    throw error;
  }

  revalidatePath(recommendationPath(tripId));
  revalidatePath(`/viagens/${tripId}/roteiro`);
  revalidatePath(`/viagens/${tripId}`);
  redirect(`${recommendationPath(tripId)}?adicionada=1`);
}

export async function ignoreRecommendationAction(formData: FormData): Promise<never> {
  "use server";

  const tripId = required(formData, "tripId");
  const rawRecommendationId = required(formData, "recommendationId");

  if (!tripId || !rawRecommendationId) {
    redirect(`/viagens?erro=recomendacao-invalida`);
  }

  const repository = new DrizzleRecommendationRepository();
  const recommendationId = createRecommendationId(rawRecommendationId);
  const recommendation = await repository.findById(tripId, recommendationId);

  if (!recommendation) {
    redirect(`${recommendationPath(tripId)}?erro=recomendacao-nao-encontrada`);
  }

  if (recommendation.status === "rejected") {
    redirect(`${recommendationPath(tripId)}?ignorada=1`);
  }

  try {
    const rejected = rejectRecommendation(recommendation, new Date());
    await repository.save(rejected);
  } catch (error) {
    if (error instanceof RecommendationTransitionError) {
      redirect(`${recommendationPath(tripId)}?erro=estado-incompativel`);
    }
    throw error;
  }

  revalidatePath(recommendationPath(tripId));
  revalidatePath(`/viagens/${tripId}`);
  redirect(`${recommendationPath(tripId)}?ignorada=1`);
}
