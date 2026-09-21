"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import {
  DrizzlePlaceRepository,
  DrizzleTripPlacePreferenceRepository,
  DrizzleTripRepository,
  PlacePromotionServiceError,
  promoteExternalPlaceCandidate,
} from "@routebook/database";
import type { Place } from "@routebook/place-catalog";
import type { TripPlacePreference } from "@routebook/trip-collection";
import { findTripById } from "@routebook/trip-management";

import { OverturePmtilesPlaceSearchAdapter } from "../../../../lib/overture-place-search";
import {
  clearTripPlacePreference,
  parseTripPlaceIntent,
  setTripPlacePreference,
  tripPlacePreferenceActionError,
  tripPlacePreferenceActionSuccess,
  type TripPlacePreferenceActionState,
} from "../../../../lib/trip-place-preference";
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

export async function setPublishedPlacePreferenceAction(
  formData: FormData,
): Promise<TripPlacePreferenceActionState> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const rawIntent = String(formData.get("intent") ?? "").trim();
  const intent = parseTripPlaceIntent(rawIntent);
  const place = await resolvePublishedPlaceForMutation(tripId, placeSlug);
  if (!intent) {
    return tripPlacePreferenceActionError("Escolha uma preferência válida para este lugar.");
  }

  const preference = await setTripPlacePreference(new DrizzleTripPlacePreferenceRepository(), {
    tripId,
    placeId: place.id,
    intent,
  });
  return tripPlacePreferenceActionSuccess(preference);
}

export async function clearPublishedPlacePreferenceAction(
  formData: FormData,
): Promise<TripPlacePreferenceActionState> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const place = await resolvePublishedPlaceForMutation(tripId, placeSlug);

  await clearTripPlacePreference(new DrizzleTripPlacePreferenceRepository(), tripId, place.id);
  return tripPlacePreferenceActionSuccess(
    null,
    "Preferência removida. O que já estiver no roteiro continua lá.",
  );
}

function promotionReturnPath(
  tripId: string,
  formData: FormData,
  feedback: PromotionFeedback,
  discoveryMode: "externa" | "ocultar" = "externa",
): string {
  const query = new URLSearchParams({ descoberta: discoveryMode });
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

function promotionFeedbackMessage(feedback: PromotionFeedback): string {
  if ("promocao" in feedback) {
    return "Preferência atualizada. O lugar entrou em Minha seleção.";
  }

  switch (feedback.erroPromocao) {
    case "candidato-invalido":
      return "Não foi possível usar este lugar. Atualize a busca e tente novamente.";
    case "candidato-nao-encontrado":
      return "Este lugar não está mais disponível na busca atual. Atualize a busca e tente novamente.";
    case "candidato-rejeitado":
      return "Não foi possível atualizar sua seleção para este lugar. Atualize a busca ou escolha outra opção.";
    case "possivel-duplicata":
      return "Este lugar pode já estar disponível na viagem. Atualize a busca antes de tentar novamente.";
    default:
      return "Não foi possível atualizar sua seleção para este lugar agora. Tente novamente.";
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

export async function saveExternalPlaceAction(
  formData: FormData,
): Promise<TripPlacePreferenceActionState> {
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
    return tripPlacePreferenceActionError(
      promotionFeedbackMessage({ erroPromocao: "candidato-invalido" }),
    );
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
    return tripPlacePreferenceActionError(
      promotionFeedbackMessage({ erroPromocao: "destino-nao-suportado" }),
    );
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
    return tripPlacePreferenceActionError(
      promotionFeedbackMessage({ erroPromocao: "fonte-indisponivel" }),
    );
  }
  const candidate = candidates.find((item) => item.externalId === externalId);
  if (!candidate) {
    return tripPlacePreferenceActionError(
      promotionFeedbackMessage({ erroPromocao: "candidato-nao-encontrado" }),
    );
  }

  let preference: TripPlacePreference;
  try {
    const rawIntent = String(formData.get("intent") ?? "").trim();
    const intent = rawIntent ? parseTripPlaceIntent(rawIntent) : "WANT";
    if (!intent) {
      return tripPlacePreferenceActionError(
        promotionFeedbackMessage({ erroPromocao: "candidato-invalido" }),
      );
    }
    const result = await promoteExternalPlaceCandidate({ candidate });
    preference = await setTripPlacePreference(new DrizzleTripPlacePreferenceRepository(), {
      tripId,
      placeId: result.placeId,
      intent,
    });
  } catch (error) {
    if (error instanceof PlacePromotionServiceError) {
      return tripPlacePreferenceActionError(
        promotionFeedbackMessage(promotionErrorFeedback(error)),
      );
    }
    console.error("Falha técnica ao definir preferência para candidato externo", {
      tripId,
      externalId,
      error: error instanceof Error ? error.message : String(error),
    });
    return tripPlacePreferenceActionError(
      promotionFeedbackMessage({ erroPromocao: "erro-tecnico" }),
    );
  }

  return tripPlacePreferenceActionSuccess(
    preference,
    promotionFeedbackMessage({ promocao: "salva" }),
  );
}
