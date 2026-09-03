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
import type { Place } from "@routebook/place-catalog";
import { removePlaceFromTrip, savePlaceForTrip } from "@routebook/saved-places";
import { findTripById } from "@routebook/trip-management";

import { OverturePmtilesPlaceSearchAdapter } from "../../../../lib/overture-place-search";
import { resolvePlaceDiscoveryRegion } from "../../../../lib/place-discovery-region";
import { resolveTripRouteAccess } from "../../../../lib/trip-route-access";
import { parseMaximumDistance, parsePlaceCategory, parsePlacePriceRange } from "./filters";

const externalDiscoveryScanLimit = 200;

type PromotionFeedback =
  | Readonly<{ promocao: "criada" | "existente" | "salva" }>
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

function resolveCuratedDestinationId(places: readonly Place[]): string | undefined {
  const destinationIds = [
    ...new Set(places.flatMap((place) => (place.destinationId ? [place.destinationId] : []))),
  ];
  return destinationIds.length === 1 ? destinationIds[0] : undefined;
}

async function listPublishedPlacesForTrip(
  trip: NonNullable<Awaited<ReturnType<typeof findTripById>>>,
): Promise<Place[]> {
  const regionResolution = resolvePlaceDiscoveryRegion({
    destination: trip.destination,
    ...(trip.accommodation?.coordinate
      ? { accommodationCoordinate: trip.accommodation.coordinate }
      : {}),
  });
  if (regionResolution.status !== "resolved") return [];

  return new DrizzlePlaceRepository().listPublishedWithinRadius({
    center: regionResolution.region.center,
    radiusMeters: regionResolution.region.curatedRadiusMeters,
  });
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

  const matches = (await listPublishedPlacesForTrip(trip)).filter(
    (place) => place.slug === placeSlug,
  );
  if (matches.length !== 1) notFound();

  return matches[0]!;
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
): string {
  const query = new URLSearchParams({ descoberta: "externa" });
  const search = String(formData.get("busca") ?? "")
    .trim()
    .slice(0, 120);
  const category = parsePlaceCategory(String(formData.get("categoria") ?? ""));
  const priceRange = parsePlacePriceRange(String(formData.get("preco") ?? ""));
  const maximumDistanceMeters = parseMaximumDistance(String(formData.get("distancia") ?? ""));

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

  if (!externalId || externalId.length > 200) {
    redirect(promotionReturnPath(tripId, formData, { erroPromocao: "candidato-invalido" }));
  }

  const category = parsePlaceCategory(String(formData.get("categoria") ?? ""));
  const maximumDistanceMeters = parseMaximumDistance(String(formData.get("distancia") ?? ""));
  const regionResolution = resolvePlaceDiscoveryRegion({
    destination: trip.destination,
    ...(trip.accommodation?.coordinate
      ? { accommodationCoordinate: trip.accommodation.coordinate }
      : {}),
    ...(maximumDistanceMeters ? { requestedRadiusMeters: maximumDistanceMeters } : {}),
  });
  if (regionResolution.status !== "resolved") {
    redirect(promotionReturnPath(tripId, formData, { erroPromocao: "destino-nao-suportado" }));
  }

  const publishedPlaces = await new DrizzlePlaceRepository().listPublishedWithinRadius({
    center: regionResolution.region.center,
    radiusMeters: regionResolution.region.curatedRadiusMeters,
  });
  const destinationId = resolveCuratedDestinationId(publishedPlaces);
  let candidates;
  try {
    candidates = await new OverturePmtilesPlaceSearchAdapter().search({
      center: regionResolution.region.center,
      radiusMeters: regionResolution.region.externalRadiusMeters,
      ...(category ? { categories: [category] } : {}),
      limit: externalDiscoveryScanLimit,
    });
  } catch (error) {
    console.error("Falha ao revalidar candidato externo via Overture", {
      regionSource: regionResolution.region.source,
      error: error instanceof Error ? error.message : String(error),
    });
    redirect(promotionReturnPath(tripId, formData, { erroPromocao: "fonte-indisponivel" }));
  }

  const candidate = candidates.find((item) => item.externalId === externalId);
  if (!candidate) {
    redirect(promotionReturnPath(tripId, formData, { erroPromocao: "candidato-nao-encontrado" }));
  }

  let feedback: PromotionFeedback;
  try {
    const result = await promoteExternalPlaceCandidate({
      ...(destinationId ? { destinationId } : {}),
      candidate,
    });
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

  redirect(promotionReturnPath(tripId, formData, feedback));
}

export async function saveExternalPlaceAction(formData: FormData): Promise<never> {
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
  if (!externalId || externalId.length > 200) {
    redirect(promotionReturnPath(tripId, formData, { erroPromocao: "candidato-invalido" }));
  }

  const category = parsePlaceCategory(String(formData.get("categoria") ?? ""));
  const maximumDistanceMeters = parseMaximumDistance(String(formData.get("distancia") ?? ""));
  const regionResolution = resolvePlaceDiscoveryRegion({
    destination: trip.destination,
    ...(trip.accommodation?.coordinate
      ? { accommodationCoordinate: trip.accommodation.coordinate }
      : {}),
    ...(maximumDistanceMeters ? { requestedRadiusMeters: maximumDistanceMeters } : {}),
  });
  if (regionResolution.status !== "resolved") {
    redirect(promotionReturnPath(tripId, formData, { erroPromocao: "destino-nao-suportado" }));
  }

  let candidates;
  try {
    candidates = await new OverturePmtilesPlaceSearchAdapter().search({
      center: regionResolution.region.center,
      radiusMeters: regionResolution.region.externalRadiusMeters,
      ...(category ? { categories: [category] } : {}),
      limit: externalDiscoveryScanLimit,
    });
  } catch (error) {
    console.error("Falha ao revalidar candidato externo antes de salvar", {
      regionSource: regionResolution.region.source,
      error: error instanceof Error ? error.message : String(error),
    });
    redirect(promotionReturnPath(tripId, formData, { erroPromocao: "fonte-indisponivel" }));
  }
  const candidate = candidates.find((item) => item.externalId === externalId);
  if (!candidate) {
    redirect(promotionReturnPath(tripId, formData, { erroPromocao: "candidato-nao-encontrado" }));
  }

  try {
    const result = await promoteExternalPlaceCandidate({ candidate });
    await savePlaceForTrip(new DrizzleSavedPlaceRepository(), tripId, result.placeId);
  } catch (error) {
    if (error instanceof PlacePromotionServiceError) {
      redirect(promotionReturnPath(tripId, formData, promotionErrorFeedback(error)));
    }
    throw error;
  }

  revalidatePath(placesPath);
  revalidatePath(`/viagens/${tripId}/lugares-salvos`);
  redirect(`/viagens/${tripId}/lugares-salvos?salvo=1`);
}
