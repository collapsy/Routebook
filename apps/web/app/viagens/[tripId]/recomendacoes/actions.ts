import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { DrizzleRecommendationRepository } from "@routebook/database";
import {
  createRecommendationId,
  RecommendationTransitionError,
  rejectRecommendation,
} from "@routebook/decision-intelligence";

function recommendationPath(tripId: string): string {
  return `/viagens/${tripId}/recomendacoes`;
}

export async function ignoreRecommendationAction(formData: FormData): Promise<never> {
  "use server";

  const tripId = String(formData.get("tripId") ?? "").trim();
  const rawRecommendationId = String(formData.get("recommendationId") ?? "").trim();

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
