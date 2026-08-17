import { createPlace, type Place } from "@routebook/place-catalog";
import { describe, expect, it } from "vitest";

import { buildPipaFirstDayGuide, PIPA_FIRST_DAY_GUIDE_SLUGS } from "./pipa-day-guide";

const stopCoordinates = {
  "praia-do-amor": { latitude: -6.2373, longitude: -35.0437 },
  "chapadao-de-pipa": { latitude: -6.245, longitude: -35.039 },
  "camarao-na-fazenda-pipa": { latitude: -6.229395, longitude: -35.04994 },
} as const;

function place(slug: keyof typeof stopCoordinates): Place {
  const coordinate = stopCoordinates[slug];
  return createPlace({
    destinationId: "pipa-rn-br",
    slug,
    name: slug,
    summary: `Resumo editorial suficientemente completo para ${slug}.`,
    category: slug === "camarao-na-fazenda-pipa" ? "gastronomy" : "beach",
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    publicationStatus: "published",
  });
}

describe("Pipa first-day guide", () => {
  it("mantém três paradas explícitas na ordem editorial", () => {
    expect(PIPA_FIRST_DAY_GUIDE_SLUGS).toEqual([
      "praia-do-amor",
      "chapadao-de-pipa",
      "camarao-na-fazenda-pipa",
    ]);
  });

  it("combina Places canônicos, orientação e sequência real no Maps", () => {
    const guide = buildPipaFirstDayGuide({
      tripId: "trip-22",
      date: "2026-08-22",
      places: PIPA_FIRST_DAY_GUIDE_SLUGS.map(place),
      accommodationCoordinate: { latitude: -6.2302, longitude: -35.0503 },
      travelMode: "driving",
    });

    expect(guide?.stops.map((stop) => stop.place.slug)).toEqual(PIPA_FIRST_DAY_GUIDE_SLUGS);
    expect(guide?.stops.map((stop) => stop.sequence)).toEqual([1, 2, 3]);
    expect(guide?.stops.every((stop) => stop.distanceFromAccommodationLabel)).toBe(true);
    expect(guide?.stops.every((stop) => stop.routeHref?.includes("google.com/maps/dir"))).toBe(
      true,
    );

    const itinerary = new URL(guide!.itineraryHref!);
    expect(itinerary.searchParams.get("waypoints")).toBe("-6.2373,-35.0437|-6.245,-35.039");
    expect(itinerary.searchParams.get("destination")).toBe("-6.229395,-35.04994");
  });

  it("mantém o guia útil sem fingir rota quando falta hospedagem geocodificada", () => {
    const guide = buildPipaFirstDayGuide({
      tripId: "trip-sem-hospedagem",
      date: "2026-08-22",
      places: PIPA_FIRST_DAY_GUIDE_SLUGS.map(place),
      travelMode: "walking",
    });

    expect(guide).not.toBeNull();
    expect(guide?.itineraryHref).toBeUndefined();
    expect(guide?.stops.every((stop) => stop.routeHref === undefined)).toBe(true);
  });

  it("não publica um dia parcial se algum Place canônico estiver ausente", () => {
    expect(
      buildPipaFirstDayGuide({
        tripId: "trip-incompleta",
        date: "2026-08-22",
        places: [place("praia-do-amor")],
        travelMode: "walking",
      }),
    ).toBeNull();
  });
});
