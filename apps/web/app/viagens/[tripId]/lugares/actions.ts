"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import {
  DrizzlePlaceRepository,
  DrizzleSavedPlaceRepository,
  DrizzleTripRepository,
  PlacePromotionServiceError,
  promoteExternalPlaceCandidate,
} from "@routebook/database";
import { findPublishedPlace } from "@routebook/place-catalog";
import { removePlaceFromTrip, savePlaceForTrip } from "@routebook/saved-places";
import { findTripById } from "@routebook/trip-management";

import { resolveTripRouteAccess } from "../../../../lib/trip-route-access";
import { OverturePmtilesPlaceSearchAdapter } from "../../../../lib/overture-place-search";
import { parseMaximumDistance, parsePlaceCategory, parsePlacePriceRange } from "./filters";

const pipaDiscoveryCenter = { latitude: -6.24, longitude: -35.065 } as const;
const externalDiscoveryRadiusMeters = 8_000;
const externalDiscoveryScanLimit = 200;

type PromotionFeedback =
  | Readonly<{ promocao: "criada" | "existente" }>
  | Readonly<{
      erroPromocao:
        | "candidato-invalido"
        | "candidato-nao-encontrado"
        | "candidato-rejeitado"
        | "possivel-duplicata"
        | "fonte-indisponivel"
        | "destino-nao-suportado"
        | "consistencia"
        | "erro-tecnico";
    }>;

function resolveDestinationId(destinationName: string): string | null {
  const normalized = destinationName.trim().toLocaleLowerCase("pt-BR");
  return normalized.includes("pipa") ? "pipa-rn-br" : null;
}

async function resolvePublishedPlaceForMutation(tripId: string, placeSlug: string) {
  const placesPath = `/viagens/${tripId}/lugares`;
  if (!tripId) redirect("/viagens?erro=viagem-invalida");

  const access = await resolveTripRouteAccess({ tripId, action: "trip:edit" });
  if (access.status === "unauthenticated") {
    redirect(`/entrar?next=${encodeURIComponent(placesPath)}`);
  }
  if (access.status === "not-found") notFound();

  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const destinationId = resolveDestinationId(trip.destination.name);
  if (!destinationId) notFound();

  const place = await findPublishedPlace(new DrizzlePlaceRepository(), destinationId, placeSlug);
  if (!place) notFound();

  return place;
}

function revalidatePublishedPlaceSurfaces(tripId: string, placeSlug: string): void {
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/lugares`);
  revalidatePath(`/viagens/${tripId}/lugares/${placeSlug}`);
  revalidatePath(`/viagens/${tripId}/lugares-salvos`);
}

export async function savePublishedPlaceAction(formData: FormData): Promise<void> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const place = await resolvePublishedPlaceForMutation(tripId, placeSlug);

  await savePlaceForTrip(new DrizzleSavedPlaceRepository(), tripId, place.id);
  revalidatePublishedPlaceSurfaces(tripId, placeSlug);
}

export async function removePublishedPlaceAction(formData: FormData): Promise<void> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const place = await resolvePublishedPlaceForMutation(tripId, placeSlug);

  await removePlaceFromTrip(new DrizzleSavedPlaceRepository(), tripId, place.id);
  revalidatePublishedPlaceSurfaces(tripId, placeSlug);
}

function promotionReturnPath(
  tripId: string,
  formData: FormData,
  feedback: PromotionFeedback,
  hasAccommodationCoordinate: boolean,
): string {
  const query = new URLSearchParams({ descoberta: "externa" });
  const search = String(formData.get("busca") ?? "")
    .trim()
    .slice(0, 120);
  const category = parsePlaceCategory(String(formData.get("categoria") ?? ""));
  const priceRange = parsePlacePriceRange(String(formData.get("preco") ?? ""));
  const maximumDistanceMeters = hasAccommodationCoordinate
    ? parseMaximumDistance(String(formData.get("distancia") ?? ""))
    : undefined;

  if (search) query.set("busca", search);
  if (category) query.set("categoria", category);
  if (maximumDistanceMeters) query.set("distancia", String(maximumDistanceMeters / 1_000));
  if (priceRange) query.set("preco", priceRange);

  if ("promocao" in feedback) query.set("promocao", feedback.promocao);
  else query.set("erroPromocao", feedback.erroPromocao);

  return `/viagens/${tripId}/lugares?${query.toString()}`;
}

function promotionErrorFeedback(error: PlacePromotionServiceError): PromotionFeedback {
  switch (error.code) {
    case "candidate-rejected":
      return { erroPromocao: "candidato-rejeitado" };
    case "possible-match":
      return { erroPromocao: "possivel-duplicata" };
    case "linked-place-not-found":
    case "destination-conflict":
      return { erroPromocao: "consistencia" };
  }
}

export async function promoteExternalPlaceAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const externalId = String(formData.get("externalId") ?? "").trim();
  const placesPath = `/viagens/${tripId}/lugares`;

  if (!tripId) redirect("/viagens?erro=viagem-invalida");

  const access = await resolveTripRouteAccess({ tripId, action: "trip:edit" });
  if (access.status === "unauthenticated") {
    redirect(`/entrar?next=${encodeURIComponent(placesPath)}`);
  }
  if (access.status === "not-found") notFound();

  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const hasAccommodationCoordinate = Boolean(trip.accommodation?.coordinate);
  if (!externalId || externalId.length > 200) {
    redirect(
      promotionReturnPath(
        tripId,
        formData,
        { erroPromocao: "candidato-invalido" },
        hasAccommodationCoordinate,
      ),
    );
  }

  const destinationId = resolveDestinationId(trip.destination.name);
  if (!destinationId) {
    redirect(
      promotionReturnPath(
        tripId,
        formData,
        { erroPromocao: "destino-nao-suportado" },
        hasAccommodationCoordinate,
      ),
    );
  }

  const category = parsePlaceCategory(String(formData.get("categoria") ?? ""));
  const maximumDistanceMeters = hasAccommodationCoordinate
    ? parseMaximumDistance(String(formData.get("distancia") ?? ""))
    : undefined;
  const discoveryCenter = trip.accommodation?.coordinate ?? pipaDiscoveryCenter;
  const radiusMeters = Math.min(
    maximumDistanceMeters ?? externalDiscoveryRadiusMeters,
    externalDiscoveryRadiusMeters,
  );

  let candidates;
  try {
    candidates = await new OverturePmtilesPlaceSearchAdapter().search({
      destinationId,
      center: discoveryCenter,
      radiusMeters,
      ...(category ? { categories: [category] } : {}),
      limit: externalDiscoveryScanLimit,
    });
  } catch (error) {
    console.error("Falha ao revalidar candidato externo via Overture", error);
    redirect(
      promotionReturnPath(
        tripId,
        formData,
        { erroPromocao: "fonte-indisponivel" },
        hasAccommodationCoordinate,
      ),
    );
  }

  const candidate = candidates.find((item) => item.externalId === externalId);
  if (!candidate) {
    redirect(
      promotionReturnPath(
        tripId,
        formData,
        { erroPromocao: "candidato-nao-encontrado" },
        hasAccommodationCoordinate,
      ),
    );
  }

  let feedback: PromotionFeedback;
  try {
    const result = await promoteExternalPlaceCandidate({ destinationId, candidate });
    feedback = { promocao: result.status === "created" ? "criada" : "existente" };
    if (result.status === "created") revalidatePath(placesPath);
  } catch (error) {
    if (error instanceof PlacePromotionServiceError) {
      feedback = promotionErrorFeedback(error);
    } else {
      console.error("Falha técnica ao promover candidato externo", error);
      feedback = { erroPromocao: "erro-tecnico" };
    }
  }

  redirect(promotionReturnPath(tripId, formData, feedback, hasAccommodationCoordinate));
}
