import { describe, expect, it } from "vitest";

import {
  DeterministicItineraryProposalGenerator,
  type GenerateItineraryProposalInput,
} from "./deterministic-itinerary-proposal-generator";

const generatedAt = new Date("2026-09-11T20:00:00.000Z");

function baseInput(
  overrides: Partial<GenerateItineraryProposalInput> = {},
): GenerateItineraryProposalInput {
  return {
    days: [
      {
        tripDayId: "day-a",
        date: "2026-10-10",
        existingActivityCount: 0,
        protectedFreePeriodCount: 0,
        flexibleFreePeriodCount: 0,
      },
    ],
    candidates: [],
    generatedAt,
    createProposedActivityId: (candidate) => `proposed-${candidate.candidateId}`,
    ...overrides,
  };
}

describe("DeterministicItineraryProposalGenerator contextual", () => {
  it("compõe experiência principal, gastronomia e nightlife sem repetir categoria disponível", async () => {
    const generator = new DeterministicItineraryProposalGenerator();
    const result = await generator.generate(
      baseInput({
        anchorCoordinate: { latitude: -23.5505, longitude: -46.6333 },
        candidates: [
          {
            candidateId: "beach-a",
            title: "Praia A",
            category: "beach",
            latitude: -23.5504,
            longitude: -46.6332,
          },
          {
            candidateId: "beach-b",
            title: "Praia B",
            category: "beach",
            latitude: -23.5503,
            longitude: -46.6331,
          },
          {
            candidateId: "restaurant",
            title: "Restaurante",
            category: "gastronomy",
            latitude: -23.5502,
            longitude: -46.633,
          },
          {
            candidateId: "nightlife",
            title: "Bar",
            category: "nightlife",
            latitude: -23.5501,
            longitude: -46.6329,
          },
        ],
      }),
    );

    expect(result.proposedActivities.map((activity) => activity.title)).toEqual([
      "Praia A",
      "Restaurante",
      "Bar",
    ]);
    expect(result.criteria).toContain(
      "A composição considerou diversidade e complementaridade de categorias dentro de cada Dia.",
    );
    expect(result.criteria).toContain(
      "A Hospedagem foi usada como referência espacial quando o Dia ainda não possuía outro Lugar proposto.",
    );
  });

  it("agrupa por proximidade depois de semear Dias por relevância", async () => {
    const generator = new DeterministicItineraryProposalGenerator();
    const result = await generator.generate(
      baseInput({
        days: [
          {
            tripDayId: "day-a",
            date: "2026-10-10",
            existingActivityCount: 0,
            protectedFreePeriodCount: 0,
            flexibleFreePeriodCount: 0,
          },
          {
            tripDayId: "day-b",
            date: "2026-10-11",
            existingActivityCount: 0,
            protectedFreePeriodCount: 0,
            flexibleFreePeriodCount: 0,
          },
        ],
        anchorCoordinate: { latitude: 0, longitude: 0 },
        candidates: [
          {
            candidateId: "region-a-main",
            title: "Região A principal",
            category: "nature",
            latitude: 0.01,
            longitude: 0.01,
          },
          {
            candidateId: "region-b-main",
            title: "Região B principal",
            category: "nature",
            latitude: 1,
            longitude: 1,
          },
          {
            candidateId: "region-a-food",
            title: "Região A almoço",
            category: "gastronomy",
            latitude: 0.011,
            longitude: 0.011,
          },
          {
            candidateId: "region-b-food",
            title: "Região B almoço",
            category: "gastronomy",
            latitude: 1.001,
            longitude: 1.001,
          },
        ],
      }),
    );

    const dayA = result.proposedActivities
      .filter((activity) => activity.targetTripDayId === "day-a")
      .map((activity) => activity.title);
    const dayB = result.proposedActivities
      .filter((activity) => activity.targetTripDayId === "day-b")
      .map((activity) => activity.title);

    expect(dayA).toEqual(["Região A principal", "Região A almoço"]);
    expect(dayB).toEqual(["Região B principal", "Região B almoço"]);
  });

  it("mantém o fallback de balanceamento quando não existem sinais contextuais", async () => {
    const generator = new DeterministicItineraryProposalGenerator();
    const result = await generator.generate(
      baseInput({
        days: [
          {
            tripDayId: "day-a",
            date: "2026-10-10",
            existingActivityCount: 0,
            protectedFreePeriodCount: 0,
            flexibleFreePeriodCount: 0,
          },
          {
            tripDayId: "day-b",
            date: "2026-10-11",
            existingActivityCount: 0,
            protectedFreePeriodCount: 0,
            flexibleFreePeriodCount: 0,
          },
        ],
        candidates: [
          { candidateId: "a", title: "A" },
          { candidateId: "b", title: "B" },
          { candidateId: "c", title: "C" },
          { candidateId: "d", title: "D" },
        ],
      }),
    );

    expect(result.proposedActivities.map((activity) => activity.targetTripDayId)).toEqual([
      "day-a",
      "day-b",
      "day-a",
      "day-b",
    ]);
  });

  it("rejeita coordenada parcial de candidato e âncora inválida", async () => {
    const generator = new DeterministicItineraryProposalGenerator();

    await expect(
      generator.generate(
        baseInput({
          candidates: [
            {
              candidateId: "partial",
              title: "Parcial",
              category: "nature",
              latitude: 10,
            },
          ],
        }),
      ),
    ).rejects.toMatchObject({ code: "invalid-candidate" });

    await expect(
      generator.generate(
        baseInput({
          anchorCoordinate: { latitude: 100, longitude: 0 },
          candidates: [{ candidateId: "valid", title: "Válido", category: "nature" }],
        }),
      ),
    ).rejects.toMatchObject({ code: "invalid-anchor-coordinate" });
  });
});
