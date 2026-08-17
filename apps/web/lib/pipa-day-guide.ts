import { calculateGeodesicDistance, createGeoCoordinate } from "@routebook/geo-distance";
import type { Place } from "@routebook/place-catalog";

import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsItineraryUrl,
  type GoogleMapsCoordinate,
  type GoogleMapsTravelMode,
} from "./google-maps-links";
import { findPipaPlacePracticalGuide, type PipaPlacePracticalGuide } from "./pipa-place-guide";

type DayStopDefinition = Readonly<{
  slug: string;
  periodLabel: string;
  suggestedTime: string;
  reason: string;
}>;

type DayDefinition = Readonly<{
  title: string;
  theme: string;
  summary: string;
  stops: readonly DayStopDefinition[];
  alternative?: string;
}>;

const pipaTripDays = [
  {
    title: "Chegada leve, Chapadão e jantar",
    theme: "Chegada e primeira noite",
    summary:
      "Um começo deliberadamente leve para entrar no ritmo de Pipa sem transformar o dia de chegada em maratona.",
    stops: [
      {
        slug: "chapadao-de-pipa",
        periodLabel: "Fim da tarde",
        suggestedTime: "16:30",
        reason: "Fazer uma parada curta nas falésias depois de chegar e se instalar.",
      },
      {
        slug: "camarao-na-fazenda-pipa",
        periodLabel: "Noite",
        suggestedTime: "19:30",
        reason: "Encerrar no centro com uma refeição e deixar o restante da noite livre.",
      },
    ],
    alternative:
      "Se a chegada atrasar, pule o Chapadão e mantenha somente o jantar. O guia é uma base editorial, não uma obrigação de preencher o dia.",
  },
  {
    title: "Falésias, mar e centro",
    theme: "Praias próximas e noite tranquila",
    summary:
      "Combine uma praia emblemática com um trecho central fácil de ajustar conforme maré, energia do grupo e clima.",
    stops: [
      {
        slug: "praia-do-amor",
        periodLabel: "Manhã",
        suggestedTime: "09:00",
        reason: "Começar pelas falésias e pela praia antes do sol mais forte.",
      },
      {
        slug: "praia-do-centro",
        periodLabel: "Tarde",
        suggestedTime: "14:30",
        reason: "Voltar para uma praia central, com saída simples para a vila quando quiser.",
      },
      {
        slug: "caxanga-restaurante",
        periodLabel: "Noite",
        suggestedTime: "19:30",
        reason: "Fechar o dia com uma refeição próxima à orla central.",
      },
    ],
  },
  {
    title: "Natureza e Praia do Madeiro",
    theme: "Mata Atlântica e mar",
    summary:
      "Um dia de natureza que alterna trilhas e praia, preservando uma noite sem deslocamento longo.",
    stops: [
      {
        slug: "santuario-ecologico-de-pipa",
        periodLabel: "Manhã",
        suggestedTime: "08:30",
        reason: "Usar as horas mais amenas para trilhas e mirantes.",
      },
      {
        slug: "praia-do-madeiro",
        periodLabel: "Início da tarde",
        suggestedTime: "12:30",
        reason: "Aproveitar meio período na praia depois da atividade de natureza.",
      },
      {
        slug: "atelier-de-massas",
        periodLabel: "Noite",
        suggestedTime: "20:00",
        reason: "Voltar ao centro para um jantar sem acrescentar outro passeio longo.",
      },
    ],
  },
  {
    title: "Tibau do Sul e pôr do sol",
    theme: "Litoral norte e Lagoa de Guaraíras",
    summary:
      "Agrupe pontos ao norte de Pipa no mesmo dia e confirme a rota real antes de sair para não usar linha reta como tempo de carro.",
    stops: [
      {
        slug: "praia-de-cacimbinhas",
        periodLabel: "Manhã",
        suggestedTime: "09:00",
        reason: "Começar pelas falésias e pela paisagem aberta de Cacimbinhas.",
      },
      {
        slug: "praia-de-tibau-do-sul",
        periodLabel: "Início da tarde",
        suggestedTime: "13:00",
        reason: "Continuar pelo mesmo eixo e conhecer a praia e a vila de Tibau do Sul.",
      },
      {
        slug: "lagoa-de-guarairas",
        periodLabel: "Fim da tarde",
        suggestedTime: "16:30",
        reason: "Terminar a sequência na região da lagoa, com o pôr do sol condicionado ao clima.",
      },
    ],
  },
  {
    title: "Sul de Pipa sem pressa",
    theme: "Praias menos centrais",
    summary:
      "Reserve um dia para trechos mais afastados e leve água, proteção solar e um plano claro de transporte de volta.",
    stops: [
      {
        slug: "praia-das-minas",
        periodLabel: "Manhã",
        suggestedTime: "09:00",
        reason: "Explorar um trecho menos urbano com luz natural e maré conferida.",
      },
      {
        slug: "praia-de-sibauma",
        periodLabel: "Início da tarde",
        suggestedTime: "13:30",
        reason: "Aproveitar que o dia já está dedicado ao eixo sul para seguir até Sibaúma.",
      },
      {
        slug: "o-tal-do-escondidinho",
        periodLabel: "Noite",
        suggestedTime: "20:00",
        reason: "Retornar ao centro e encerrar com uma refeição casual de cozinha brasileira.",
      },
    ],
  },
  {
    title: "Golfinhos, café e sunset",
    theme: "Maré, pausa e fim de tarde",
    summary:
      "Deixe a manhã condicionada à maré, use a tarde como respiro e só então decida o pôr do sol conforme o clima.",
    stops: [
      {
        slug: "baia-dos-golfinhos",
        periodLabel: "Manhã",
        suggestedTime: "08:00",
        reason: "Priorizar a janela de maré adequada para acesso e retorno pela areia.",
      },
      {
        slug: "moka-cafes-especiais",
        periodLabel: "Meio da tarde",
        suggestedTime: "14:30",
        reason: "Criar uma pausa curta depois da manhã de praia.",
      },
      {
        slug: "mirante-sunset-bar",
        periodLabel: "Fim da tarde",
        suggestedTime: "16:30",
        reason: "Fechar o dia com vista elevada, confirmando funcionamento e condições do tempo.",
      },
    ],
  },
  {
    title: "Centro, descanso e noite",
    theme: "Dia flexível e vida noturna",
    summary:
      "Mantenha o dia central e caminhável para preservar energia antes de uma noite cuja programação deve ser confirmada no próprio dia.",
    stops: [
      {
        slug: "pipa-beach-club",
        periodLabel: "Almoço",
        suggestedTime: "12:00",
        reason: "Começar perto da orla central sem exigir deslocamento longo.",
      },
      {
        slug: "sorveteria-real-de-14",
        periodLabel: "Tarde",
        suggestedTime: "16:00",
        reason: "Usar uma parada curta no centro como intervalo antes da noite.",
      },
      {
        slug: "avenida-baia-dos-golfinhos-noite",
        periodLabel: "Noite",
        suggestedTime: "21:00",
        reason: "Explorar o eixo noturno e escolher o estabelecimento conforme a programação real.",
      },
    ],
  },
  {
    title: "Últimas horas sem correria",
    theme: "Despedida leve",
    summary:
      "Duas opções centrais para usar somente se o horário de saída permitir; o último dia continua propositalmente pouco carregado.",
    stops: [
      {
        slug: "caju-cafeteria",
        periodLabel: "Manhã",
        suggestedTime: "08:00",
        reason: "Tomar café perto do centro sem comprometer a logística de saída.",
      },
      {
        slug: "centro-gastronomico-de-pipa",
        periodLabel: "Fim da manhã",
        suggestedTime: "10:30",
        reason: "Manter uma última opção central e fácil de abandonar se o traslado exigir saída antecipada.",
      },
    ],
    alternative:
      "Se o traslado sair cedo, não tente encaixar as paradas. Priorize checkout e deslocamento; o guia não penaliza um período livre.",
  },
] as const satisfies readonly DayDefinition[];

export type PipaDayGuideStop = Readonly<{
  sequence: number;
  periodLabel: string;
  suggestedTime: string;
  reason: string;
  place: Place;
  practicalGuide: PipaPlacePracticalGuide;
  distanceFromAccommodationLabel?: string;
  detailsHref: string;
  planHref: string;
  routeHref?: string;
}>;

export type PipaTripGuideDay = Readonly<{
  index: number;
  date: string;
  title: string;
  theme: string;
  summary: string;
  alternative?: string;
  stops: readonly PipaDayGuideStop[];
  travelMode: GoogleMapsTravelMode;
  itineraryHref?: string;
}>;

export type PipaTripGuide = Readonly<{
  days: readonly PipaTripGuideDay[];
  totalCanonicalDays: number;
}>;

export type PipaFirstDayGuide = PipaTripGuideDay;

function placeCoordinate(place: Place): GoogleMapsCoordinate {
  return { latitude: place.latitude, longitude: place.longitude };
}

function formatDistanceFromAccommodation(accommodation: GoogleMapsCoordinate, place: Place): string {
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

function buildGuideDay(input: {
  tripId: string;
  date: string;
  index: number;
  definition: DayDefinition;
  placesBySlug: ReadonlyMap<string, Place>;
  accommodationCoordinate?: GoogleMapsCoordinate;
  travelMode: GoogleMapsTravelMode;
}): PipaTripGuideDay | null {
  const resolvedStops = input.definition.stops.flatMap((definition, stopIndex) => {
    const place = input.placesBySlug.get(definition.slug);
    const practicalGuide = findPipaPlacePracticalGuide(definition.slug);
    if (!place || !practicalGuide) return [];

    const detailsHref = `/viagens/${input.tripId}/lugares/${place.slug}`;
    return [
      Object.freeze({
        sequence: stopIndex + 1,
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
        detailsHref,
        planHref: `${detailsHref}?dia=${input.date}#adicionar-ao-roteiro`,
      }),
    ];
  });

  if (resolvedStops.length !== input.definition.stops.length) return null;

  const itineraryHref = input.accommodationCoordinate
    ? buildGoogleMapsItineraryUrl({
        origin: input.accommodationCoordinate,
        waypoints: resolvedStops.slice(0, -1).map((stop) => placeCoordinate(stop.place)),
        destination: placeCoordinate(resolvedStops.at(-1)!.place),
        travelMode: input.travelMode,
      })
    : undefined;

  return Object.freeze({
    index: input.index,
    date: input.date,
    title: input.definition.title,
    theme: input.definition.theme,
    summary: input.definition.summary,
    ...(input.definition.alternative ? { alternative: input.definition.alternative } : {}),
    stops: Object.freeze(resolvedStops),
    travelMode: input.travelMode,
    ...(itineraryHref ? { itineraryHref } : {}),
  });
}

export function buildPipaTripGuide(input: {
  tripId: string;
  dates: readonly string[];
  places: readonly Place[];
  accommodationCoordinate?: GoogleMapsCoordinate;
  travelMode: GoogleMapsTravelMode;
}): PipaTripGuide | null {
  const guideDates = input.dates.slice(0, pipaTripDays.length);
  if (guideDates.length === 0) return null;

  const placesBySlug = new Map(input.places.map((place) => [place.slug, place]));
  const days = guideDates.map((date, dayIndex) =>
    buildGuideDay({
      tripId: input.tripId,
      date,
      index: dayIndex + 1,
      definition: pipaTripDays[dayIndex]!,
      placesBySlug,
      ...(input.accommodationCoordinate
        ? { accommodationCoordinate: input.accommodationCoordinate }
        : {}),
      travelMode: input.travelMode,
    }),
  );

  if (days.some((day) => day === null)) return null;

  return Object.freeze({
    days: Object.freeze(days as PipaTripGuideDay[]),
    totalCanonicalDays: input.dates.length,
  });
}

export function buildPipaFirstDayGuide(input: {
  tripId: string;
  date: string;
  places: readonly Place[];
  accommodationCoordinate?: GoogleMapsCoordinate;
  travelMode: GoogleMapsTravelMode;
}): PipaFirstDayGuide | null {
  return (
    buildPipaTripGuide({
      tripId: input.tripId,
      dates: [input.date],
      places: input.places,
      ...(input.accommodationCoordinate
        ? { accommodationCoordinate: input.accommodationCoordinate }
        : {}),
      travelMode: input.travelMode,
    })?.days[0] ?? null
  );
}

export const PIPA_TRIP_GUIDE_SLUGS = Object.freeze(
  pipaTripDays.map((day) => Object.freeze(day.stops.map((stop) => stop.slug))),
);

export const PIPA_FIRST_DAY_GUIDE_SLUGS = PIPA_TRIP_GUIDE_SLUGS[0]!;
