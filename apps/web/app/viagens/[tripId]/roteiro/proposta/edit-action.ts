"use server";

import { revalidatePath } from "next/cache";

import { DrizzleItineraryProposalRepository } from "@routebook/database";

import {
  editItineraryProposalActionError,
  executeEditItineraryProposalAction,
  type EditItineraryProposalActionInput,
  type EditItineraryProposalActionState,
} from "@/lib/itinerary-proposal-editing";
import { resolveTripRouteAccess } from "@/lib/trip-route-access";

function requiredFormText(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

function optionalFormText(formData: FormData, field: string): string | null | undefined {
  if (!formData.has(field)) return undefined;
  const value = formData.get(field);
  return typeof value === "string" ? value : null;
}

function actionInput(tripId: string, formData: FormData): EditItineraryProposalActionInput {
  return {
    tripId,
    itineraryProposalId: requiredFormText(formData, "itineraryProposalId"),
    proposedActivityId: requiredFormText(formData, "proposedActivityId"),
    ...(formData.has("targetTripDayId")
      ? { targetTripDayId: requiredFormText(formData, "targetTripDayId") }
      : {}),
    ...(formData.has("title") ? { title: requiredFormText(formData, "title") } : {}),
    ...(formData.has("description")
      ? { description: optionalFormText(formData, "description") }
      : {}),
    ...(formData.has("proposedStartTime")
      ? { proposedStartTime: optionalFormText(formData, "proposedStartTime") }
      : {}),
    ...(formData.has("durationMinutes")
      ? { durationMinutes: optionalFormText(formData, "durationMinutes") }
      : {}),
    ...(formData.has("proposedOrder")
      ? { proposedOrder: optionalFormText(formData, "proposedOrder") }
      : {}),
    ...(formData.has("flexibility")
      ? { flexibility: optionalFormText(formData, "flexibility") }
      : {}),
    ...(formData.has("estimatedCostAmount")
      ? { estimatedCostAmount: optionalFormText(formData, "estimatedCostAmount") }
      : {}),
    ...(formData.has("estimatedCostCurrency")
      ? { estimatedCostCurrency: optionalFormText(formData, "estimatedCostCurrency") }
      : {}),
  };
}

export async function editItineraryProposalAction(
  tripId: string,
  _previousState: EditItineraryProposalActionState,
  formData: FormData,
): Promise<EditItineraryProposalActionState> {
  try {
    const result = await executeEditItineraryProposalAction(actionInput(tripId, formData), {
      resolveAccess: resolveTripRouteAccess,
      repository: new DrizzleItineraryProposalRepository(),
    });

    if (result.status === "success") {
      revalidatePath(`/viagens/${tripId}/roteiro/proposta`);
    }

    return result;
  } catch (error) {
    console.error("Failed to edit Itinerary Proposal.", error);
    return editItineraryProposalActionError("technical-error");
  }
}
