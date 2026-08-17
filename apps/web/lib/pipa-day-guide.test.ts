import { createPlace, type Place } from "@routebook/place-catalog";
import { describe, expect, it } from "vitest";

import {
  buildPipaFirstDayGuide,
  buildPipaTripGuide,
  PIPA_FIRST_DAY_GUIDE_SLUGS,
  PIPA_TRIP_GUIDE_SLUGS,
} from "./pipa-day-guide";

const allSlugs = [...new Set(PIPA_TRIP_GUIDE_SLUGS.flat())];

function place(slug: string, index: number): Place {
  return createPlace({
    destinationId: "pipa-rn-br",
    slug,
    name: slug,
    summary: `Resumo editorial suficientemente completo para ${slug}.`,
    category: "nature",
    latitude: -6.22 - index * 0.001,
    longitude: -35.04 - index * 0.001,
    publicationStatus: "published",
  });
}

const places = allSlugs.map(place);
const dates = [
  "2026-08-22",
  "2026-08-23",
  "2026-08-24",
  "2026-08-25",
  "2026-08-26",
  "2026-08-27",
  "2026-08-28",
  "2026-08-29",
] as const;

describe("Pipa trip guide", () => {
  it("mantém primeiro e último dia mais leves que os dias centrais", () => {
    expect(PIPA_TRIP_GUIDE_SLUGS.map((day) => day.length)).toEqual([2, 3, 3, 3, 3, 3, 3, 2]);
    expect(PIPA_FIRST_DAY_GUIDE_SLUGS).toEqual(["chapadao-de-pipa", "camarao-na-fazenda-pipa"]);
  });

  it("cobre os oito dias canônicos sem aplicar estado", () => {
    const guide = buildPipaTripGuide({
      tripId: "trip-pipa",
      dates,
      places,
      accommodationCoordinate: { latitude: -6.2302, longitude: -35.0503 },
      travelMode: "driving",
    });

    expect(guide?.days).toHaveLength(8);
    expect(guide?.days.map((day) => day.date)).toEqual(dates);
    expect(guide?.days.map((day) => day.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(guide?.days.flatMap((day) => day.stops)).toHaveLength(22);
    expect(
      guide?.days
        .flatMap((day) => day.stops)
        .every((stop) => stop.planHref.includes("#adicionar-ao-roteiro")),
    ).toBe(true);
    expect(
      guide?.days
        .flatMap((day) => day.stops)
        .every((stop) => stop.distanceFromAccommodationLabel?.includes("linha reta")),
    ).toBe(true);
    expect(
      guide?.days
        .flatMap((day) => day.stops)
        .every((stop) => stop.routeHref?.includes("google.com/maps/dir")),
    ).toBe(true);
    expect(guide?.days.every((day) => day.itineraryHref?.includes("google.com/maps/dir"))).toBe(
      true,
    );
  });

  it("não inventa dias quando a viagem é mais curta", () => {
    const guide = buildPipaTripGuide({
      tripId: "trip-curta",
      dates: dates.slice(0, 3),
      places,
      travelMode: "walking",
    });

    expect(guide?.days).toHaveLength(3);
    expect(guide?.days.at(-1)?.date).toBe("2026-08-24");
    expect(guide?.totalCanonicalDays).toBe(3);
  });

  it("mantém o guia útil sem fingir rota quando falta hospedagem geocodificada", () => {
    const guide = buildPipaTripGuide({
      tripId: "trip-sem-hospedagem",
      dates,
      places,
      travelMode: "walking",
    });

    expect(guide).not.toBeNull();
    expect(guide?.days.every((day) => day.itineraryHref === undefined)).toBe(true);
    expect(
      guide?.days.flatMap((day) => day.stops).every((stop) => stop.routeHref === undefined),
    ).toBe(true);
  });

  it("falha fechado se algum Place editorial não estiver publicado no conjunto recebido", () => {
    const guide = buildPipaTripGuide({
      tripId: "trip-incompleta",
      dates,
      places: places.filter((candidate) => candidate.slug !== "lagoa-de-guarairas"),
      travelMode: "walking",
    });

    expect(guide).toBeNull();
  });

  it("preserva um builder compatível para o teaser do primeiro dia", () => {
    const guide = buildPipaFirstDayGuide({
      tripId: "trip-primeiro-dia",
      date: dates[0],
      places,
      travelMode: "walking",
    });

    expect(guide?.index).toBe(1);
    expect(guide?.stops.map((stop) => stop.place.slug)).toEqual(PIPA_FIRST_DAY_GUIDE_SLUGS);
  });
});
