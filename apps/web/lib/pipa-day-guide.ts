import { calculateGeodesicDistance, createGeoCoordinate } from "@routebook/geo-distance";
import type { Place } from "@routebook/place-catalog";

import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsItineraryUrl,
  buildGoogleMapsPlaceLabel,
  type GoogleMapsCoordinate,
  type GoogleMapsTravelMode,
} from "./google-maps-links";
import { findPipaPlacePracticalGuide, type PipaPlacePracticalGuide } from "./pipa-place-guide";

type TripDayInput = Readonly<{
  index: number;
  date: string;
}>;

type DayStopDefinition = Readonly<{
  slug: string;
  periodLabel: string;
  suggestedTime: string;
  reason: string;
}>;

type DayDefinition = Readonly<{
  title: string;
  summary: string;
  note?: string;
  stops: readonly DayStopDefinition[];
}>;

const dayDefinitions = [
  {
    title: "Primeiro dia em Pipa, sem correr",
    summary:
      "Chegada com mirante e jantar no centro, deixando margem para check-in, descanso e imprevistos de deslocamento.",
    note: "Se a chegada atrasar, pule o Chapadão e vá direto ao jantar. A Praia do Amor fica melhor em um Dia com mais margem.",
    stops: [
      {
        slug: "chapadao-de-pipa",
        periodLabel: "Fim da tarde",
        suggestedTime: "16:30",
        reason:
          "Fazer uma parada curta e panorâmica depois do check-in, sem transformar a chegada em um Dia corrido.",
      },
      {
        slug: "camarao-na-fazenda-pipa",
        periodLabel: "Noite",
        suggestedTime: "19:30",
        reason:
          "Encerrar no centro com uma refeição e deixar o restante da noite livre para decidir no momento.",
      },
    ],
  },
  {
    title: "Natureza e Madeiro com jantar perto da vila",
    summary:
      "Um dia de natureza no eixo norte de Pipa, combinando trilha e praia antes de voltar ao centro para jantar.",
    stops: [
      {
        slug: "santuario-ecologico-de-pipa",
        periodLabel: "Manhã",
        suggestedTime: "08:30",
        reason: "Aproveitar o começo do dia para trilhas e mirantes com temperatura mais amena.",
      },
      {
        slug: "praia-do-madeiro",
        periodLabel: "Fim da manhã e tarde",
        suggestedTime: "11:30",
        reason:
          "Continuar no mesmo eixo costeiro e reservar algumas horas para praia, sem encaixes apertados.",
      },
      {
        slug: "caxanga-restaurante",
        periodLabel: "Noite",
        suggestedTime: "19:30",
        reason:
          "Voltar à área central para uma refeição depois de um dia com mais atividade física.",
      },
    ],
  },
  {
    title: "Baía dos Golfinhos no ritmo da maré",
    summary:
      "A maré governa este dia. Planeje primeiro a janela segura da Baía dos Golfinhos e mantenha o restante perto do centro.",
    stops: [
      {
        slug: "baia-dos-golfinhos",
        periodLabel: "Manhã",
        suggestedTime: "08:00",
        reason:
          "Priorizar a atração que depende de acesso e retorno pela faixa de areia numa janela de maré adequada.",
      },
      {
        slug: "praia-do-centro",
        periodLabel: "Início da tarde",
        suggestedTime: "13:30",
        reason:
          "Manter o segundo trecho do dia perto da vila e reduzir deslocamentos depois da caminhada da manhã.",
      },
      {
        slug: "centro-gastronomico-de-pipa",
        periodLabel: "Noite",
        suggestedTime: "19:00",
        reason:
          "Deixar a escolha final do restaurante aberta para comparar fila, cardápio e preferência do grupo no dia.",
      },
    ],
  },
  {
    title: "Cacimbinhas, Tibau do Sul e Lagoa de Guaraíras",
    summary:
      "Dia voltado ao eixo norte, agrupando paradas que fazem mais sentido no mesmo deslocamento para fora do centro de Pipa.",
    stops: [
      {
        slug: "praia-de-cacimbinhas",
        periodLabel: "Manhã",
        suggestedTime: "09:00",
        reason: "Começar pelas falésias e paisagem aberta antes de avançar para Tibau do Sul.",
      },
      {
        slug: "praia-de-tibau-do-sul",
        periodLabel: "Início da tarde",
        suggestedTime: "13:00",
        reason:
          "Aproveitar o deslocamento já feito ao norte e combinar praia com a vila de Tibau do Sul.",
      },
      {
        slug: "lagoa-de-guarairas",
        periodLabel: "Fim da tarde",
        suggestedTime: "16:30",
        reason:
          "Fechar o circuito do dia junto à lagoa e decidir o horário real conforme clima e operação local.",
      },
    ],
  },
  {
    title: "Litoral sul e jantar de volta ao centro",
    summary:
      "Explore o eixo sul com mais tempo de deslocamento e pouca dependência de encaixes urbanos durante o dia.",
    stops: [
      {
        slug: "praia-de-sibauma",
        periodLabel: "Manhã",
        suggestedTime: "09:00",
        reason:
          "Reservar a primeira metade do dia para a praia mais distante e organizar transporte de ida e volta com antecedência.",
      },
      {
        slug: "praia-das-minas",
        periodLabel: "Meio da tarde",
        suggestedTime: "15:00",
        reason:
          "Fazer uma segunda parada costeira no retorno, sem depender de estrutura ou serviços no local.",
      },
      {
        slug: "el-farolito",
        periodLabel: "Noite",
        suggestedTime: "20:00",
        reason:
          "Voltar ao centro para uma refeição de grupo depois do trecho mais longo de deslocamento da viagem.",
      },
    ],
  },
  {
    title: "Dia relaxado, pôr do sol e noite em Pipa",
    summary:
      "Um dia com menos trocas de contexto: permanência mais longa durante o dia, pôr do sol e noite decidida perto do centro.",
    stops: [
      {
        slug: "pipa-beach-club",
        periodLabel: "Fim da manhã e tarde",
        suggestedTime: "11:00",
        reason:
          "Concentrar boa parte do dia numa única experiência e reduzir a sensação de roteiro corrido.",
      },
      {
        slug: "mirante-sunset-bar",
        periodLabel: "Fim da tarde",
        suggestedTime: "16:30",
        reason:
          "Separar tempo para o pôr do sol, confirmando operação, entrada e condições no próprio dia.",
      },
      {
        slug: "avenida-baia-dos-golfinhos-noite",
        periodLabel: "Noite",
        suggestedTime: "20:30",
        reason:
          "Explorar a vida noturna a pé e escolher programação e bares somente com informação atual.",
      },
    ],
  },
  {
    title: "Centro no ritmo do grupo",
    summary:
      "Use o penúltimo dia para uma manhã lenta, uma refeição autoral e uma noite que só vale encaixar depois de confirmar a programação.",
    stops: [
      {
        slug: "moka-cafes-especiais",
        periodLabel: "Manhã",
        suggestedTime: "09:30",
        reason:
          "Começar sem pressa com uma pausa curta e deixar a manhã flexível para decisões do grupo.",
      },
      {
        slug: "macoco-cozinha-artesanal",
        periodLabel: "Almoço",
        suggestedTime: "13:00",
        reason:
          "Manter o almoço no centro e evitar deslocamento adicional num dia propositalmente flexível.",
      },
      {
        slug: "agora-club",
        periodLabel: "Noite",
        suggestedTime: "23:00",
        reason:
          "Tratar a saída noturna como opção condicionada à programação real e ao interesse do grupo naquele dia.",
      },
    ],
  },
  {
    title: "Despedida leve no centro",
    summary:
      "Últimas horas com deslocamento curto e margem para checkout, malas e retorno. Não dependa desta sugestão se o horário de saída apertar.",
    note: "Se a saída for cedo, pule as paradas sem tentar compensar o roteiro. O Guia é uma sugestão e não cria compromisso no Roteiro.",
    stops: [
      {
        slug: "praia-do-centro",
        periodLabel: "Manhã",
        suggestedTime: "08:30",
        reason:
          "Ficar perto da vila para uma última passagem pela praia sem criar um deslocamento longo antes da saída.",
      },
      {
        slug: "caju-cafeteria",
        periodLabel: "Fim da manhã",
        suggestedTime: "11:00",
        reason:
          "Encerrar com uma parada curta e central que pode ser descartada facilmente se o retorno exigir mais margem.",
      },
    ],
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
  summary: string;
  note?: string;
  stops: readonly PipaDayGuideStop[];
  travelMode: GoogleMapsTravelMode;
  itineraryHref?: string;
}>;

export type PipaTripGuide = Readonly<{
  days: readonly PipaTripGuideDay[];
  tripDayCount: number;
  coverageLimited: boolean;
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

function definitionForDay(position: number, totalDays: number): DayDefinition {
  if (totalDays > 1 && position === totalDays - 1) return dayDefinitions.at(-1)!;
  return dayDefinitions[Math.min(position, dayDefinitions.length - 2)]!;
}

export function buildPipaTripGuide(input: {
  tripId: string;
  days: readonly TripDayInput[];
  places: readonly Place[];
  accommodationCoordinate?: GoogleMapsCoordinate;
  travelMode: GoogleMapsTravelMode;
}): PipaTripGuide | null {
  const actualDays = input.days.slice(0, dayDefinitions.length);
  if (actualDays.length === 0) return null;

  const placesBySlug = new Map(input.places.map((place) => [place.slug, place]));
  const resolvedDays: PipaTripGuideDay[] = [];

  for (const [position, day] of actualDays.entries()) {
    const definition = definitionForDay(position, actualDays.length);
    const resolvedStops = definition.stops.flatMap((stopDefinition, index) => {
      const place = placesBySlug.get(stopDefinition.slug);
      const practicalGuide = findPipaPlacePracticalGuide(stopDefinition.slug);
      if (!place || !practicalGuide) return [];

      return [
        Object.freeze({
          sequence: index + 1,
          periodLabel: stopDefinition.periodLabel,
          suggestedTime: stopDefinition.suggestedTime,
          reason: stopDefinition.reason,
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
                  destinationLabel: buildGoogleMapsPlaceLabel({
                    name: place.name,
                    addressLabel: place.addressLabel,
                  }),
                  travelMode: input.travelMode,
                }),
              }
            : {}),
          detailsHref: `/viagens/${input.tripId}/lugares/${place.slug}`,
          planHref: `/viagens/${input.tripId}/lugares/${place.slug}?dia=${encodeURIComponent(day.date)}#adicionar-ao-roteiro`,
        }),
      ];
    });

    if (resolvedStops.length !== definition.stops.length) return null;

    const itineraryHref = input.accommodationCoordinate
      ? buildGoogleMapsItineraryUrl({
          origin: input.accommodationCoordinate,
          waypoints: resolvedStops.slice(0, -1).map((stop) => placeCoordinate(stop.place)),
          destination: placeCoordinate(resolvedStops.at(-1)!.place),
          travelMode: input.travelMode,
        })
      : undefined;

    resolvedDays.push(
      Object.freeze({
        index: day.index,
        date: day.date,
        title: definition.title,
        summary: definition.summary,
        ...(definition.note ? { note: definition.note } : {}),
        stops: Object.freeze(resolvedStops),
        travelMode: input.travelMode,
        ...(itineraryHref ? { itineraryHref } : {}),
      }),
    );
  }

  return Object.freeze({
    days: Object.freeze(resolvedDays),
    tripDayCount: input.days.length,
    coverageLimited: input.days.length > dayDefinitions.length,
  });
}

export const PIPA_TRIP_GUIDE_DAY_SLUGS = Object.freeze(
  dayDefinitions.map((day) => Object.freeze(day.stops.map((stop) => stop.slug))),
);
