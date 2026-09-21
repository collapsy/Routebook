"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { DrizzleTravelerProfileRepository, DrizzleTripRepository } from "@routebook/database";
import {
  findTravelerProfile,
  saveAndPersistTravelerProfile,
  TravelerProfileValidationError,
  type SaveTravelerProfileInput,
  type TravelerProfile,
} from "@routebook/traveler-profile";
import { findTripById } from "@routebook/trip-management";

import type { TravelerContextActionState } from "./state";

type TravelerContextSection = "grupo" | "preferencias" | "logistica";

function parseBudget(value: string): number | undefined {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  if (!normalized) return undefined;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

function parseSection(value: string): TravelerContextSection {
  if (value === "preferencias" || value === "logistica") return value;
  return "grupo";
}

function existingOptionalContext(profile: TravelerProfile): Partial<SaveTravelerProfileInput> {
  return {
    ...(profile.pace ? { pace: profile.pace } : {}),
    ...(profile.transportPreference
      ? { transportPreference: profile.transportPreference }
      : {}),
    ...(profile.budget ? { budgetTotalCents: profile.budget.totalCents } : {}),
  };
}

function buildTravelerProfileInput(
  tripId: string,
  section: TravelerContextSection,
  formData: FormData,
  current: TravelerProfile | null,
): SaveTravelerProfileInput | null {
  if (section !== "grupo" && !current) return null;

  if (section === "grupo") {
    return {
      tripId,
      travelerCount: Number(formData.get("travelerCount") ?? 0),
      interests: current?.interests ?? [],
      ...(current ? existingOptionalContext(current) : {}),
    };
  }

  if (!current) return null;

  if (section === "preferencias") {
    const pace = String(formData.get("pace") ?? "");
    return {
      tripId,
      travelerCount: current.travelerCount,
      interests: formData.getAll("interests").map(String),
      ...(pace ? { pace } : {}),
      ...(current.transportPreference
        ? { transportPreference: current.transportPreference }
        : {}),
      ...(current.budget ? { budgetTotalCents: current.budget.totalCents } : {}),
    };
  }

  const transportPreference = String(formData.get("transportPreference") ?? "");
  const budgetTotalCents = parseBudget(String(formData.get("budget") ?? ""));
  return {
    tripId,
    travelerCount: current.travelerCount,
    interests: current.interests,
    ...(current.pace ? { pace: current.pace } : {}),
    ...(transportPreference ? { transportPreference } : {}),
    ...(budgetTotalCents === undefined ? {} : { budgetTotalCents }),
  };
}

function contextHref(
  tripId: string,
  preparing: boolean,
  section: TravelerContextSection,
  saved = false,
): string {
  const query = new URLSearchParams();
  if (preparing) query.set("preparar", "1");
  query.set("grupo", section);
  if (saved) query.set("salvo", "1");
  return `/viagens/${tripId}/contexto?${query.toString()}`;
}

export async function saveTravelerContextAction(
  _state: TravelerContextActionState,
  formData: FormData,
): Promise<TravelerContextActionState> {
  const tripId = String(formData.get("tripId") ?? "");
  const section = parseSection(String(formData.get("section") ?? ""));
  const preparing = String(formData.get("preparar") ?? "") === "1";

  try {
    const trip = await findTripById(new DrizzleTripRepository(), tripId);
    if (!trip) return { fieldErrors: {}, formError: "A viagem informada não existe." };

    const repository = new DrizzleTravelerProfileRepository();
    const current = await findTravelerProfile(repository, tripId);
    const input = buildTravelerProfileInput(tripId, section, formData, current);

    if (!input) {
      return {
        fieldErrors: {},
        formError: "Informe primeiro a quantidade de viajantes para iniciar o contexto.",
      };
    }

    await saveAndPersistTravelerProfile(repository, input);
  } catch (error) {
    if (error instanceof TravelerProfileValidationError) {
      return { fieldErrors: error.fieldErrors };
    }

    console.error("Falha ao salvar contexto da viagem", error);
    return {
      fieldErrors: {},
      formError: "Não foi possível salvar o contexto agora. Tente novamente.",
    };
  }

  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/contexto`);

  if (section === "grupo") {
    redirect(contextHref(tripId, preparing, "preferencias", true));
  }
  if (section === "preferencias") {
    redirect(contextHref(tripId, preparing, "logistica", true));
  }
  if (preparing) {
    redirect(contextHref(tripId, true, "logistica", true));
  }

  redirect(`/viagens/${tripId}?contextUpdated=1`);
}
