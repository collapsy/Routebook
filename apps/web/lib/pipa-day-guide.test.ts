import { createPlace, type Place } from "@routebook/place-catalog";
import { describe, expect, it } from "vitest";

import { buildPipaTripGuide, PIPA_TRIP_GUIDE_DAY_SLUGS } from "./pipa-day-guide";

const allGuideSlugs = [...new Set(PIPA_TRIP_GUIDE_DAY_SLUGS.flat())];

function place(slug: string, index: number): Place {
  return createPlace({
    destinationId: "pipa-rn-br",
    slug,
    name: slug,
    summary: `Resumo editorial suficientemente completo para o Place ${slug}.`,
    category: "beach",
    latitude: -6.22 - index * 0.001,
    longitude: -35.04 - index * 0.001,
    publicationStatus: "published",
  });
}

function tripDays(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    index: index + 1,
    date: `2026-08-${String(22 + index).padStart(2, "0")}`,
  }));
}

const places = allGuideSlugs.map(place);

describe("Pipa trip guide", () => {
  it("mantém oito perfis editoriais com duas ou três paradas canônicas", () => {
    expect(PIPA_TRIP_GUIDE_DAY_SLUGS).toHaveLength(8);
    expect(PIPA_TRIP_GUIDE_DAY_SLUGS.every((day) => day.length >= 2 && day.length <= 3)).toBe(true);
  });

  it("cobre os oito Dias reais e conecta cada parada ao compositor do Dia sugerido", () => {
    const guide = buildPipaTripGuide({
      tripId: "trip-pipa",
      days: tripDays(8),
      places,
      accommodationCoordinate: { latitude: -6.2302, longitude: -35.0503 },
      travelMode: "driving",
    });

    expect(guide?.days).toHaveLength(8);
    expect(guide?.days.map((day) => day.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(guide?.days[0]?.stops).toHaveLength(2);
    expect(guide?.days.at(-1)?.stops).toHaveLength(2);
    expect(guide?.days.at(-1)?.title).toMatch(/Despedida leve/);
    expect(guide?.days.every((day) => day.stops.every((stop) => stop.practicalGuide))).toBe(true);
    expect(
      guide?.days.every((day) =>
        day.stops.every(
          (stop) =>
            stop.planHref.includes(`dia=${day.date}`) &&
            stop.planHref.endsWith("#adicionar-ao-roteiro"),
        ),
      ),
    ).toBe(true);
    expect(
      guide?.days.every((day) =>
        day.stops.every((stop) => /em linha reta$/.test(stop.distanceFromAccommodationLabel ?? "")),
      ),
    ).toBe(true);
    expect(guide?.days.every((day) => day.itineraryHref?.includes("google.com/maps/dir"))).toBe(
      true,
    );
  });

  it("usa somente os Dias reais numa viagem curta e mantém o último Dia leve", () => {
    const guide = buildPipaTripGuide({
      tripId: "trip-curta",
      days: tripDays(3),
      places,
      travelMode: "walking",
    });

    expect(guide?.days).toHaveLength(3);
    expect(guide?.days.map((day) => day.date)).toEqual(["2026-08-22", "2026-08-23", "2026-08-24"]);
    expect(guide?.days.at(-1)?.title).toMatch(/Despedida leve/);
    expect(guide?.days.at(-1)?.stops).toHaveLength(2);
    expect(guide?.coverageLimited).toBe(false);
  });

  it("mantém orientação sem fingir rota quando falta hospedagem geocodificada", () => {
    const guide = buildPipaTripGuide({
      tripId: "trip-sem-hospedagem",
      days: tripDays(8),
      places,
      travelMode: "walking",
    });

    expect(guide).not.toBeNull();
    expect(guide?.days.every((day) => day.itineraryHref === undefined)).toBe(true);
    expect(
      guide?.days.every((day) =>
        day.stops.every(
          (stop) =>
            stop.routeHref === undefined && stop.distanceFromAccommodationLabel === undefined,
        ),
      ),
    ).toBe(true);
  });

  it("não publica um Guia parcial se um Place editorial necessário estiver ausente", () => {
    const missingSlug = PIPA_TRIP_GUIDE_DAY_SLUGS[1]![0]!;

    expect(
      buildPipaTripGuide({
        tripId: "trip-incompleta",
        days: tripDays(8),
        places: places.filter((candidate) => candidate.slug !== missingSlug),
        travelMode: "walking",
      }),
    ).toBeNull();
  });

  it("limita explicitamente a cobertura editorial ao piloto de oito Dias", () => {
    const guide = buildPipaTripGuide({
      tripId: "trip-longa",
      days: tripDays(9),
      places,
      travelMode: "walking",
    });

    expect(guide?.days).toHaveLength(8);
    expect(guide?.tripDayCount).toBe(9);
    expect(guide?.coverageLimited).toBe(true);
  });
});
