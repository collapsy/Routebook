"use server";

import { revalidatePath } from "next/cache";

import {
  createPostgresApplyPartialItineraryProposalTransaction,
  createPostgresProposalApplicationRepository,
  DrizzleDecisionRepository,
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  DrizzleTripRepository,
  getDatabase,
} from "@routebook/database";
import { createAcceptItineraryProposalPartially } from "@routebook/proposal-management";

import {
  acceptItineraryProposalPartiallyActionError,
  executeAcceptItineraryProposalPartiallyAction,
  type AcceptItineraryProposalPartiallyActionInput,
  type AcceptItineraryProposalPartiallyActionState,
} from "@/lib/itinerary-proposal-partial-acceptance";
import { resolveTripRouteAccess } from "@/lib/trip-route-access";

function requiredFormText(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

function selectedProposedActivityIds(formData: FormData): readonly string[] {
  return formData
    .getAll("selectedProposedActivityId")
    .filter((value): value is string => typeof value === "string");
}

function actionInput(
  tripId: string,
  formData: FormData,
): AcceptItineraryProposalPartiallyActionInput {
  return {
    tripId,
    itineraryProposalId: requiredFormText(formData, "itineraryProposalId"),
    expectedItineraryVersion: requiredFormText(formData, "expectedItineraryVersion"),
    idempotencyKey: requiredFormText(formData, "idempotencyKey"),
    selectedProposedActivityIds: selectedProposedActivityIds(formData),
  };
}

export async function acceptItineraryProposalPartiallyAction(
  tripId: string,
  _previousState: AcceptItineraryProposalPartiallyActionState,
  formData: FormData,
): Promise<AcceptItineraryProposalPartiallyActionState> {
  try {
    const database = getDatabase();
    const result = await executeAcceptItineraryProposalPartiallyAction(
      actionInput(tripId, formData),
      {
        resolveAccess: resolveTripRouteAccess,
        tripRepository: new DrizzleTripRepository(),
        itineraryRepository: new DrizzleItineraryRepository(),
        proposalRepository: new DrizzleItineraryProposalRepository(),
        proposalApplicationReader: createPostgresProposalApplicationRepository(database),
        decisionReader: new DrizzleDecisionRepository(database),
        acceptItineraryProposalPartially: createAcceptItineraryProposalPartially(
          createPostgresApplyPartialItineraryProposalTransaction(),
        ),
      },
    );

    if (result.status === "success") {
      revalidatePath(`/viagens/${tripId}`);
      revalidatePath(`/viagens/${tripId}/roteiro`);
      revalidatePath(`/viagens/${tripId}/roteiro/proposta`);
    }

    return result;
  } catch (error) {
    console.error("Failed to partially accept Itinerary Proposal.", error);
    return acceptItineraryProposalPartiallyActionError("technical-error");
  }
}
