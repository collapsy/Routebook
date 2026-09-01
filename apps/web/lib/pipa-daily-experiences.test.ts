import { createPlace, type Place } from "@routebook/place-catalog";
import { describe, expect, it } from "vitest";

import { buildPipaDailyExperience } from "./pipa-daily-experiences";

function place(slug: string, name: string, latitude: number, longitude: number): Place {
  return createPlace({
    destinationId: "pipa-rn-br",
    slug,
    name,
    summary: `Resumo suficientemente completo para ${name}.`,
    category: "nature",
    latitude,
    longitude,
    publicationStatus: "published",
  });
}

const places = [
  place("chapadao-de-pipa", "Chapadão de Pipa", -6.2445, -35.0407),
  place("praia-do-amor", "Praia do Amor", -6.2366, -35.0465),
  place("lagoa-de-guarairas", "Lagoa de Guaraíras", -6.1905, -35.091),
  place("mirante-sunset-bar", "Mirante Sunset Bar", -6.2295, -35.052),
  place("agora-club", "Agora Club", -6.229, -35.0525),
];

describe("Pipa daily experiences", () => {
  it("separa observação natural de eventos confirmados", () => {
    const experience = buildPipaDailyExperience({
      tripId: "trip-pipa",
      date: "2026-08-27",
      places,
      accommodationCoordinate: { latitude: -6.2302, longitude: -35.0503 },
      travelMode: "walking",
    });

    expect(experience.skyObservations.map((item) => item.id)).toEqual([
      "sunrise",
      "sunset",
      "moonrise",
    ]);
    expect(experience.confirmedEvents).toHaveLength(0);
    expect(experience.skyObservations.find((item) => item.id === "moonrise")).toMatchObject({
      time: "17:01",
      azimuthDegrees: 101,
      moonIlluminationPercent: 100,
    });
  });

  it("só publica rolê quando a data e o Place canônico correspondem", () => {
    const experience = buildPipaDailyExperience({
      tripId: "trip-pipa",
      date: "2026-08-28",
      places,
      accommodationCoordinate: { latitude: -6.2302, longitude: -35.0503 },
      travelMode: "driving",
    });

    expect(experience.confirmedEvents).toHaveLength(1);
    expect(experience.confirmedEvents[0]).toMatchObject({
      title: "Nihanna · Mística Weekend",
      startTime: "22:00",
      status: "confirmed",
    });
    expect(experience.confirmedEvents[0]?.source.url).toContain("sympla.com.br");
    expect(experience.confirmedEvents[0]?.planHref).toContain("novaAtividade=");
    expect(experience.confirmedEvents[0]?.planHref).toContain("horario=22%3A00");
  });

  it("não inventa evento se o venue canônico estiver ausente", () => {
    const experience = buildPipaDailyExperience({
      tripId: "trip-pipa",
      date: "2026-08-29",
      places: places.filter((candidate) => candidate.slug !== "agora-club"),
      travelMode: "walking",
    });

    expect(experience.confirmedEvents).toEqual([]);
  });

  it("expõe ausência de cobertura astronômica fora do piloto sem inventar horário", () => {
    const experience = buildPipaDailyExperience({
      tripId: "trip-pipa",
      date: "2026-09-10",
      places,
      travelMode: "walking",
    });

    expect(experience.hasAstronomyCoverage).toBe(false);
    expect(experience.skyObservations).toEqual([]);
  });
});
