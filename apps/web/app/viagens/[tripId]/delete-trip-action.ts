"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { DrizzleTripRepository } from "@routebook/database";
import { deletePersistedTrip } from "@routebook/trip-management";

import { resolveTripRouteAccess } from "@/lib/trip-route-access";

export type DeleteTripActionState = Readonly<{
  status: "idle" | "error";
  message?: string;
}>;

export const initialDeleteTripActionState: DeleteTripActionState = { status: "idle" };

export async function deleteTripAction(
  tripId: string,
  state: DeleteTripActionState,
  formData: FormData,
): Promise<DeleteTripActionState> {
  void state;
  void formData;

  const access = await resolveTripRouteAccess({ tripId, action: "trip:delete" });

  if (access.status !== "authorized") {
    return {
      status: "error",
      message: "Não foi possível excluir esta viagem.",
    };
  }

  try {
    const deleted = await deletePersistedTrip(new DrizzleTripRepository(), tripId);
    if (!deleted) {
      return {
        status: "error",
        message: "Não foi possível excluir esta viagem.",
      };
    }
  } catch (error) {
    console.error("Falha ao excluir viagem", error);
    return {
      status: "error",
      message: "Não foi possível excluir a viagem agora. Tente novamente.",
    };
  }

  revalidatePath("/viagens");
  redirect("/viagens?deleted=1");
}
