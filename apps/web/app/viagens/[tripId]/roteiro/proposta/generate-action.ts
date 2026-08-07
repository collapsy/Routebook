"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createPostgresAuthoritativeItineraryProposalGenerationService,
  DrizzleItineraryRepository,
  DrizzleTripRepository,
} from "@routebook/database";

import {
  executeGenerateItineraryProposalAction,
  generateItineraryProposalActionError,
  type GenerateItineraryProposalActionState,
} from "@/lib/itinerary-proposal-generation";
import { resolveTripRouteAccess } from "@/lib/trip-route-access";

function proposalPath(tripId: string): string {
  return `/viagens/${tripId}/roteiro/proposta`;
}

export async function generateItineraryProposalAction(
  tripId: string,
  _state: GenerateItineraryProposalActionState,
): Promise<GenerateItineraryProposalActionState> {
  let state: GenerateItineraryProposalActionState;

  try {
    state = await executeGenerateItineraryProposalAction(
      { tripId },
      {
        resolveAccess: resolveTripRouteAccess,
        tripRepository: new DrizzleTripRepository(),
        itineraryRepository: new DrizzleItineraryRepository(),
        generationService: createPostgresAuthoritativeItineraryProposalGenerationService(),
      },
    );
  } catch (error) {
    console.error("Falha técnica ao gerar Itinerary Proposal", error);
    return generateItineraryProposalActionError("technical-error");
  }

  if (state.status === "success") {
    revalidatePath(`/viagens/${tripId}`);
    revalidatePath(`/viagens/${tripId}/roteiro`);
    revalidatePath(proposalPath(tripId));
    redirect(`${proposalPath(tripId)}?propostaGerada=${encodeURIComponent(state.itineraryProposalId)}`);
  }

  return state;
}
