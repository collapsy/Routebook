import { calculateGeodesicDistance, createGeoCoordinate } from "@routebook/geo-distance";
import type { Place } from "@routebook/place-catalog";

import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsPlaceLabel,
  type GoogleMapsCoordinate,
  type GoogleMapsTravelMode,
} from "./google-maps-links";

export type PipaDailyExperienceSource = Readonly<{
  label: string;
  url: string;
  collectedAt: string;
}>;

type AstronomyDefinition = Readonly<{
  sunrise: string;
  sunriseAzimuth: number;
  sunset: string;
  sunsetAzimuth: number;
  moonrise: string;
  moonriseAzimuth: number;
  moonIlluminationPercent: number;
}>;

type ObservationPlaceDefinition = Readonly<{
  slug: string;
  reason: string;
  confidence: "curated" | "geospatial-inference";
}>;

type ConfirmedEventDefinition = Readonly<{
  id: string;
  date: string;
  title: string;
  venueSlug: string;
  startTime: string;
  endTime: string;
  summary: string;
  lineup: string;
  tags: readonly string[];
  minimumAge: number;
  source: PipaDailyExperienceSource;
}>;

export type PipaObservationPlace = Readonly<{
  place: Place;
  reason: string;
  confidence: "curated" | "geospatial-inference";
  distanceFromAccommodationLabel?: string;
  detailsHref: string;
  planHref: string;
  routeHref?: string;
}>;

export type PipaSkyObservation = Readonly<{
  id: "sunrise" | "sunset" | "moonrise";
  title: string;
  time: string;
  azimuthDegrees: number;
  directionLabel: string;
  description: string;
  moonIlluminationPercent?: number;
  source: PipaDailyExperienceSource;
  places: readonly PipaObservationPlace[];
}>;

export type PipaConfirmedEvent = Readonly<{
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  summary: string;
  lineup: string;
  tags: readonly string[];
  minimumAge: number;
  status: "confirmed";
  source: PipaDailyExperienceSource;
  place: Place;
  distanceFromAccommodationLabel?: string;
  detailsHref: string;
  planHref: string;
  routeHref?: string;
}>;

export type PipaDailyExperience = Readonly<{
  date: string;
  skyObservations: readonly PipaSkyObservation[];
  confirmedEvents: readonly PipaConfirmedEvent[];
  hasAstronomyCoverage: boolean;
}>;

const astronomySource: PipaDailyExperienceSource = Object.freeze({
  label: "Timeanddate · Pipa",
  url: "https://www.timeanddate.com/astronomy/@3392017",
  collectedAt: "2026-08-27",
});

const astronomyByDate: Readonly<Record<string, AstronomyDefinition>> = Object.freeze({
  "2026-08-22": {
    sunrise: "05:24",
    sunriseAzimuth: 78,
    sunset: "17:21",
    sunsetAzimuth: 282,
    moonrise: "12:51",
    moonriseAzimuth: 118,
    moonIlluminationPercent: 75.6,
  },
  "2026-08-23": {
    sunrise: "05:24",
    sunriseAzimuth: 79,
    sunset: "17:21",
    sunsetAzimuth: 281,
    moonrise: "13:43",
    moonriseAzimuth: 117,
    moonIlluminationPercent: 83.6,
  },
  "2026-08-24": {
    sunrise: "05:24",
    sunriseAzimuth: 79,
    sunset: "17:21",
    sunsetAzimuth: 281,
    moonrise: "14:35",
    moonriseAzimuth: 115,
    moonIlluminationPercent: 90.2,
  },
  "2026-08-25": {
    sunrise: "05:23",
    sunriseAzimuth: 79,
    sunset: "17:20",
    sunsetAzimuth: 281,
    moonrise: "15:25",
    moonriseAzimuth: 111,
    moonIlluminationPercent: 95.4,
  },
  "2026-08-26": {
    sunrise: "05:23",
    sunriseAzimuth: 80,
    sunset: "17:20",
    sunsetAzimuth: 280,
    moonrise: "16:14",
    moonriseAzimuth: 107,
    moonIlluminationPercent: 98.7,
  },
  "2026-08-27": {
    sunrise: "05:22",
    sunriseAzimuth: 80,
    sunset: "17:20",
    sunsetAzimuth: 280,
    moonrise: "17:01",
    moonriseAzimuth: 101,
    moonIlluminationPercent: 100,
  },
  "2026-08-28": {
    sunrise: "05:22",
    sunriseAzimuth: 80,
    sunset: "17:20",
    sunsetAzimuth: 279,
    moonrise: "17:48",
    moonriseAzimuth: 95,
    moonIlluminationPercent: 100,
  },
  "2026-08-29": {
    sunrise: "05:21",
    sunriseAzimuth: 81,
    sunset: "17:20",
    sunsetAzimuth: 279,
    moonrise: "18:34",
    moonriseAzimuth: 89,
    moonIlluminationPercent: 99,
  },
});

const eastHorizonPlaces = Object.freeze([
  {
    slug: "chapadao-de-pipa",
    reason:
      "Mirante natural alto e aberto para o litoral; é uma boa aposta para fenômenos que surgem a leste/sudeste.",
    confidence: "geospatial-inference",
  },
  {
    slug: "praia-do-amor",
    reason:
      "Trecho costeiro voltado para o oceano, útil quando o azimute de nascer do Sol ou da Lua está a leste.",
    confidence: "geospatial-inference",
  },
] as const satisfies readonly ObservationPlaceDefinition[]);

const westHorizonPlaces = Object.freeze([
  {
    slug: "lagoa-de-guarairas",
    reason:
      "Ponto clássico da região para acompanhar o Sol descendo sobre a Lagoa de Guaraíras e o horizonte oeste.",
    confidence: "curated",
  },
  {
    slug: "mirante-sunset-bar",
    reason: "Mirante elevado de Pipa orientado para a experiência de fim de tarde e pôr do sol.",
    confidence: "curated",
  },
] as const satisfies readonly ObservationPlaceDefinition[]);

const confirmedEventDefinitions = Object.freeze([
  {
    id: "agora-mistica-2026-08-28",
    date: "2026-08-28",
    title: "Nihanna · Mística Weekend",
    venueSlug: "agora-club",
    startTime: "22:00",
    endTime: "03:00",
    summary: "Festa noturna no Agora Club com line-up publicado para a sexta-feira.",
    lineup: "Nihanna · Guada",
    tags: ["Festa", "DJ"],
    minimumAge: 18,
    source: {
      label: "Sympla · Agora Club",
      url: "https://www.sympla.com.br/evento/28-08-nihanna-mistica-weekend-agora-club/3549028",
      collectedAt: "2026-08-27",
    },
  },
  {
    id: "agora-pagofunk-2026-08-29",
    date: "2026-08-29",
    title: "PAGOFUNK",
    venueSlug: "agora-club",
    startTime: "22:00",
    endTime: "03:00",
    summary: "Noite de samba, pagode e funk no Agora Club com programação publicada para sábado.",
    lineup: "Seis na Mesa · DJ Cucho",
    tags: ["Pagode", "Funk", "DJ"],
    minimumAge: 18,
    source: {
      label: "Sympla · Agora Club",
      url: "https://www.sympla.com.br/evento/29-08-pagofunk-agora-club/3550842",
      collectedAt: "2026-08-27",
    },
  },
] as const satisfies readonly ConfirmedEventDefinition[]);

function formatDistance(
  accommodation: GoogleMapsCoordinate | undefined,
  place: Place,
): string | undefined {
  if (!accommodation) return undefined;
  const distance = calculateGeodesicDistance(
    createGeoCoordinate(accommodation),
    createGeoCoordinate({ latitude: place.latitude, longitude: place.longitude }),
  );
  if (distance.meters < 1_000) return `${Math.round(distance.meters)} m em linha reta`;
  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(distance.kilometers)} km em linha reta`;
}

function directionLabel(azimuthDegrees: number): string {
  if (azimuthDegrees >= 337.5 || azimuthDegrees < 22.5) return "norte";
  if (azimuthDegrees < 67.5) return "nordeste";
  if (azimuthDegrees < 112.5) return "leste";
  if (azimuthDegrees < 157.5) return "sudeste";
  if (azimuthDegrees < 202.5) return "sul";
  if (azimuthDegrees < 247.5) return "sudoeste";
  if (azimuthDegrees < 292.5) return "oeste";
  return "noroeste";
}

function buildManualPlanHref(input: {
  tripId: string;
  date: string;
  title: string;
  time?: string;
  durationMinutes?: number;
}): string {
  const query = new URLSearchParams({
    dia: input.date,
    novaAtividade: input.title,
  });
  if (input.time) query.set("horario", input.time);
  if (input.durationMinutes) query.set("duracao", String(input.durationMinutes));
  return `/viagens/${input.tripId}/roteiro?${query.toString()}#adicionar-atividade-manual`;
}

function resolveObservationPlaces(input: {
  definitions: readonly ObservationPlaceDefinition[];
  placesBySlug: ReadonlyMap<string, Place>;
  tripId: string;
  date: string;
  title: string;
  time: string;
  accommodationCoordinate?: GoogleMapsCoordinate;
  travelMode: GoogleMapsTravelMode;
}): PipaObservationPlace[] {
  return input.definitions.flatMap((definition) => {
    const place = input.placesBySlug.get(definition.slug);
    if (!place) return [];

    const coordinate = { latitude: place.latitude, longitude: place.longitude };
    const destinationLabel = buildGoogleMapsPlaceLabel({
      name: place.name,
      addressLabel: place.addressLabel,
    });
    return [
      Object.freeze({
        place,
        reason: definition.reason,
        confidence: definition.confidence,
        ...(formatDistance(input.accommodationCoordinate, place)
          ? { distanceFromAccommodationLabel: formatDistance(input.accommodationCoordinate, place) }
          : {}),
        detailsHref: `/viagens/${input.tripId}/lugares/${place.slug}`,
        planHref: buildManualPlanHref({
          tripId: input.tripId,
          date: input.date,
          title: `${input.title} · ${place.name}`,
          time: input.time,
          durationMinutes: 60,
        }),
        ...(input.accommodationCoordinate
          ? {
              routeHref: buildGoogleMapsDirectionsUrl({
                origin: input.accommodationCoordinate,
                destination: coordinate,
                destinationLabel,
                travelMode: input.travelMode,
              }),
            }
          : {}),
      }),
    ];
  });
}

export function buildPipaDailyExperience(input: {
  tripId: string;
  date: string;
  places: readonly Place[];
  accommodationCoordinate?: GoogleMapsCoordinate;
  travelMode: GoogleMapsTravelMode;
}): PipaDailyExperience {
  const placesBySlug = new Map(input.places.map((place) => [place.slug, place]));
  const astronomy = astronomyByDate[input.date];
  const skyObservations: PipaSkyObservation[] = astronomy
    ? [
        Object.freeze({
          id: "sunrise" as const,
          title: "Nascer do sol",
          time: astronomy.sunrise,
          azimuthDegrees: astronomy.sunriseAzimuth,
          directionLabel: directionLabel(astronomy.sunriseAzimuth),
          description:
            "Janela natural para começar cedo com horizonte aberto. Condições de nuvens ainda precisam ser conferidas no dia.",
          source: astronomySource,
          places: Object.freeze(
            resolveObservationPlaces({
              definitions: eastHorizonPlaces,
              placesBySlug,
              tripId: input.tripId,
              date: input.date,
              title: "Nascer do sol",
              time: astronomy.sunrise,
              ...(input.accommodationCoordinate
                ? { accommodationCoordinate: input.accommodationCoordinate }
                : {}),
              travelMode: input.travelMode,
            }),
          ),
        }),
        Object.freeze({
          id: "sunset" as const,
          title: "Pôr do sol",
          time: astronomy.sunset,
          azimuthDegrees: astronomy.sunsetAzimuth,
          directionLabel: directionLabel(astronomy.sunsetAzimuth),
          description:
            "O Sol se põe a oeste; o RouteBook prioriza pontos com horizonte favorável, sem tratar um bar como evento automaticamente.",
          source: astronomySource,
          places: Object.freeze(
            resolveObservationPlaces({
              definitions: westHorizonPlaces,
              placesBySlug,
              tripId: input.tripId,
              date: input.date,
              title: "Pôr do sol",
              time: astronomy.sunset,
              ...(input.accommodationCoordinate
                ? { accommodationCoordinate: input.accommodationCoordinate }
                : {}),
              travelMode: input.travelMode,
            }),
          ),
        }),
        Object.freeze({
          id: "moonrise" as const,
          title: "Nascer da lua",
          time: astronomy.moonrise,
          azimuthDegrees: astronomy.moonriseAzimuth,
          directionLabel: directionLabel(astronomy.moonriseAzimuth),
          description:
            "A direção da Lua muda ao longo dos dias; o horário e o azimute abaixo são específicos desta data em Pipa.",
          moonIlluminationPercent: astronomy.moonIlluminationPercent,
          source: astronomySource,
          places: Object.freeze(
            resolveObservationPlaces({
              definitions: eastHorizonPlaces,
              placesBySlug,
              tripId: input.tripId,
              date: input.date,
              title: "Nascer da lua",
              time: astronomy.moonrise,
              ...(input.accommodationCoordinate
                ? { accommodationCoordinate: input.accommodationCoordinate }
                : {}),
              travelMode: input.travelMode,
            }),
          ),
        }),
      ]
    : [];

  const confirmedEvents = confirmedEventDefinitions
    .filter((event) => event.date === input.date)
    .flatMap<PipaConfirmedEvent>((event) => {
      const place = placesBySlug.get(event.venueSlug);
      if (!place) return [];
      const coordinate = { latitude: place.latitude, longitude: place.longitude };
      const destinationLabel = buildGoogleMapsPlaceLabel({
        name: place.name,
        addressLabel: place.addressLabel,
      });
      return [
        Object.freeze({
          id: event.id,
          title: event.title,
          startTime: event.startTime,
          endTime: event.endTime,
          summary: event.summary,
          lineup: event.lineup,
          tags: event.tags,
          minimumAge: event.minimumAge,
          status: "confirmed" as const,
          source: event.source,
          place,
          ...(formatDistance(input.accommodationCoordinate, place)
            ? {
                distanceFromAccommodationLabel: formatDistance(
                  input.accommodationCoordinate,
                  place,
                ),
              }
            : {}),
          detailsHref: `/viagens/${input.tripId}/lugares/${place.slug}`,
          planHref: buildManualPlanHref({
            tripId: input.tripId,
            date: input.date,
            title: `${event.title} · ${place.name}`,
            time: event.startTime,
            durationMinutes: 180,
          }),
          ...(input.accommodationCoordinate
            ? {
                routeHref: buildGoogleMapsDirectionsUrl({
                  origin: input.accommodationCoordinate,
                  destination: coordinate,
                  destinationLabel,
                  travelMode: input.travelMode,
                }),
              }
            : {}),
        }),
      ];
    });

  return Object.freeze({
    date: input.date,
    skyObservations: Object.freeze(skyObservations),
    confirmedEvents: Object.freeze(confirmedEvents),
    hasAstronomyCoverage: Boolean(astronomy),
  });
}
