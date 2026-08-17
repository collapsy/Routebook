import { calculateGeodesicDistance, createGeoCoordinate } from "@routebook/geo-distance";
import type { Place } from "@routebook/place-catalog";

import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsItineraryUrl,
  type GoogleMapsCoordinate,
  type GoogleMapsTravelMode,
} from "./google-maps-links";
import { findPipaPlacePracticalGuide, type PipaPlacePracticalGuide } from "./pipa-place-guide";

type FirstDayStopDefinition = Readonly<{
  slug: string;
  periodLabel: string;
  suggestedTime: string;
  reason: string;
}>;

const firstDayStops = [
  {
    slug: "praia-do-amor",
    periodLabel: "Manhã",
    suggestedTime: "09:00",
    reason: "Começar com uma praia marcante, ainda sem preencher o dia inteiro de atividades.",
  },
  {
    slug: "chapadao-de-pipa",
    periodLabel: "Fim da tarde",
    suggestedTime: "16:30",
    reason: "Fazer uma parada curta num ponto panorâmico próximo ao trecho sul de Pipa.",
  },
  {
    slug: "camarao-na-fazenda-pipa",
    periodLabel: "Noite",
    suggestedTime: "19:30",
    reason: "Encerrar no centro com uma refeição, deixando a noite aberta para decidir no momento.",
  },
] as const satisfies readonly FirstDayStopDefinition[];

export type PipaDayGuideStop = Readonly<{
  sequence: number;
  periodLabel: string;
  suggestedTime: string;
  reason: string;
  place: Place;
  practicalGuide: PipaPlacePracticalGuide;
  distanceFromAccommodationLabel?: string;
  detailsHref: string;
  routeHref?: string;
}>;

export type PipaFirstDayGuide = Readonly<{
  date: string;
  title: string;
  summary: string;
  lateArrivalAlternative: string;
  stops: readonly PipaDayGuideStop[];
  travelMode: GoogleMapsTravelMode;
  itineraryHref?: string;
}>;

function placeCoordinate(place: Place): GoogleMapsCoordinate {
  return { latitude: place.latitude, longitude: place.longitude };
}

function formatDistanceFromAccommodation(
  accommodation: GoogleMapsCoordinate,
  place: Place,
): string {
  const distance = calculateGeodesicDistance(
    createGeoCoordinate(accommodation),
    createGeoCoordinate(placeCoordinate(place)),
  );

  if (distance.meters < 1_000) return `${Math.round(distance.meters)} m em linha reta`;

  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(distance.kilometers)} km em linha reta`;
}

export function buildPipaFirstDayGuide(input: {
  tripId: string;
  date: string;
  places: readonly Place[];
  accommodationCoordinate?: GoogleMapsCoordinate;
  travelMode: GoogleMapsTravelMode;
}): PipaFirstDayGuide | null {
  const placesBySlug = new Map(input.places.map((place) => [place.slug, place]));
  const resolvedStops = firstDayStops.flatMap((definition, index) => {
    const place = placesBySlug.get(definition.slug);
    const practicalGuide = findPipaPlacePracticalGuide(definition.slug);
    if (!place || !practicalGuide) return [];

    return [
      Object.freeze({
        sequence: index + 1,
        periodLabel: definition.periodLabel,
        suggestedTime: definition.suggestedTime,
        reason: definition.reason,
        place,
        practicalGuide,
        ...(input.accommodationCoordinate
          ? {
              distanceFromAccommodationLabel: formatDistanceFromAccommodation(
                input.accommodationCoordinate,
                place,
              ),
              routeHref: buildGoogleMapsDirectionsUrl({
                origin: input.accommodationCoordinate,
                destination: placeCoordinate(place),
                travelMode: input.travelMode,
              }),
            }
          : {}),
        detailsHref: `/viagens/${input.tripId}/lugares/${place.slug}`,
      }),
    ];
  });

  if (resolvedStops.length !== firstDayStops.length) return null;

  const itineraryHref = input.accommodationCoordinate
    ? buildGoogleMapsItineraryUrl({
        origin: input.accommodationCoordinate,
        waypoints: resolvedStops.slice(0, -1).map((stop) => placeCoordinate(stop.place)),
        destination: placeCoordinate(resolvedStops.at(-1)!.place),
        travelMode: input.travelMode,
      })
    : undefined;

  return Object.freeze({
    date: input.date,
    title: "Primeiro dia em Pipa, sem correr",
    summary:
      "Roteiro-base editorial para quem já está em Pipa pela manhã. Confirme maré, funcionamento e deslocamento antes de sair.",
    lateArrivalAlternative:
      "Chegou depois do almoço? Comece pelo Chapadão no fim da tarde, siga para o jantar e deixe a Praia do Amor para outro dia.",
    stops: Object.freeze(resolvedStops),
    travelMode: input.travelMode,
    ...(itineraryHref ? { itineraryHref } : {}),
  });
}

export const PIPA_FIRST_DAY_GUIDE_SLUGS = Object.freeze(firstDayStops.map((stop) => stop.slug));
