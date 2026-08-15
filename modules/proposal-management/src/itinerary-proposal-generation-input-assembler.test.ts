import { describe, expect, it } from "vitest";

import {
  assembleItineraryProposalGenerationInput,
  ItineraryProposalGenerationInputAssemblyError,
  type AssembleItineraryProposalGenerationInput,
} from "./itinerary-proposal-generation-input-assembler";

const asOf = new Date("2026-08-22T12:00:00.000Z");

function input(
  overrides: Partial<AssembleItineraryProposalGenerationInput> = {},
): AssembleItineraryProposalGenerationInput {
  return {
    itinerary: {
      tripId: "trip-1",
      days: [
        {
          tripDayId: "day-2",
          date: "2026-08-23",
          activities: [{ id: "activity-1" }],
          freePeriods: [
            { freePeriodId: "free-protected", mode: "protected" },
            { freePeriodId: "free-flexible", mode: "flexible" },
          ],
        },
        { tripDayId: "day-1", date: "2026-08-22", activities: [], freePeriods: [] },
      ],
    },
    recommendations: [
      {
        recommendationId: "recommendation-2",
        tripId: "trip-1",
        placeId: "place-2",
        status: "presented",
        score: 80,
        validFrom: new Date("2026-08-20T00:00:00.000Z"),
        reason: "Boa opção para o grupo.",
      },
      {
        recommendationId: "recommendation-1",
        tripId: "trip-1",
        placeId: "place-1",
        status: "generated",
        score: 90,
        validFrom: new Date("2026-08-20T00:00:00.000Z"),
        expiresAt: new Date("2026-08-23T00:00:00.000Z"),
      },
    ],
    places: [
      {
        placeId: "place-1",
        title: "Praia do Amor",
        description: "Praia ao sul do centro.",
        durationMinutes: 120,
        estimatedCostAmount: 0,
        estimatedCostCurrency: "brl",
      },
      { placeId: "place-2", title: "Baía dos Golfinhos" },
    ],
    asOf,
    ...overrides,
  };
}

function expectCode(run: () => unknown, code: string): void {
  expect(run).toThrowError(ItineraryProposalGenerationInputAssemblyError);
  try {
    run();
  } catch (error) {
    expect((error as ItineraryProposalGenerationInputAssemblyError).code).toBe(code);
  }
}

describe("assembleItineraryProposalGenerationInput", () => {
  it("ordena Dias canonicamente e deriva Activities e Free Periods", () => {
    const result = assembleItineraryProposalGenerationInput(input());

    expect(result.days).toEqual([
      {
        tripDayId: "day-1",
        date: "2026-08-22",
        existingActivityCount: 0,
        protectedFreePeriodCount: 0,
        flexibleFreePeriodCount: 0,
      },
      {
        tripDayId: "day-2",
        date: "2026-08-23",
        existingActivityCount: 1,
        protectedFreePeriodCount: 1,
        flexibleFreePeriodCount: 1,
      },
    ]);
  });

  it("preserva contexto de Free Periods desconhecido sem assumir zero", () => {
    const source = input();
    const result = assembleItineraryProposalGenerationInput(
      input({
        itinerary: {
          ...source.itinerary,
          days: source.itinerary.days.map(({ freePeriods: _freePeriods, ...day }) => day),
        },
      }),
    );

    expect(result.days).toEqual([
      { tripDayId: "day-1", date: "2026-08-22", existingActivityCount: 0 },
      { tripDayId: "day-2", date: "2026-08-23", existingActivityCount: 1 },
    ]);
  });

  it("ordena candidatos por score decrescente e RecommendationId", () => {
    const result = assembleItineraryProposalGenerationInput(input());

    expect(result.candidates.map(({ candidateId }) => candidateId)).toEqual([
      "recommendation-1",
      "recommendation-2",
    ]);
  });

  it("preserva metadados opcionais do Place e a justificativa", () => {
    const result = assembleItineraryProposalGenerationInput(input());

    expect(result.candidates).toEqual([
      {
        candidateId: "recommendation-1",
        placeId: "place-1",
        title: "Praia do Amor",
        description: "Praia ao sul do centro.",
        durationMinutes: 120,
        estimatedCostAmount: 0,
        estimatedCostCurrency: "BRL",
      },
      {
        candidateId: "recommendation-2",
        placeId: "place-2",
        title: "Baía dos Golfinhos",
        reason: "Boa opção para o grupo.",
      },
    ]);
  });

  it("exclui Recommendations inelegíveis, futuras e expiradas", () => {
    const base = input();
    const result = assembleItineraryProposalGenerationInput(
      input({
        recommendations: [
          ...base.recommendations,
          {
            recommendationId: "rejected",
            tripId: "trip-1",
            placeId: "place-1",
            status: "rejected",
            score: 100,
            validFrom: new Date("2026-08-20T00:00:00.000Z"),
          },
          {
            recommendationId: "future",
            tripId: "trip-1",
            placeId: "place-1",
            status: "generated",
            score: 100,
            validFrom: new Date("2026-08-24T00:00:00.000Z"),
          },
          {
            recommendationId: "expired",
            tripId: "trip-1",
            placeId: "place-1",
            status: "generated",
            score: 100,
            validFrom: new Date("2026-08-19T00:00:00.000Z"),
            expiresAt: asOf,
          },
        ],
      }),
    );

    expect(result.candidates).toHaveLength(2);
  });

  it("gera saída semanticamente equivalente para a mesma entrada", () => {
    const source = input();
    expect(assembleItineraryProposalGenerationInput(source)).toEqual(
      assembleItineraryProposalGenerationInput(source),
    );
  });

  it("não muta entradas", () => {
    const source = input();
    const originalDayOrder = source.itinerary.days.map(({ tripDayId }) => tripDayId);
    const originalRecommendationOrder = source.recommendations.map(
      ({ recommendationId }) => recommendationId,
    );
    const originalCurrency = source.places[0]?.estimatedCostCurrency;

    assembleItineraryProposalGenerationInput(source);

    expect(source.itinerary.days.map(({ tripDayId }) => tripDayId)).toEqual(originalDayOrder);
    expect(source.recommendations.map(({ recommendationId }) => recommendationId)).toEqual(
      originalRecommendationOrder,
    );
    expect(source.places[0]?.estimatedCostCurrency).toBe(originalCurrency);
  });

  it("rejeita Dia duplicado", () => {
    const base = input();
    expectCode(
      () =>
        assembleItineraryProposalGenerationInput(
          input({
            itinerary: {
              ...base.itinerary,
              days: [base.itinerary.days[0]!, base.itinerary.days[0]!],
            },
          }),
        ),
      "duplicate-day",
    );
  });

  it("rejeita modo de Free Period desconhecido", () => {
    const base = input();
    expectCode(
      () =>
        assembleItineraryProposalGenerationInput(
          input({
            itinerary: {
              ...base.itinerary,
              days: [
                {
                  tripDayId: "day-invalid-free",
                  date: "2026-08-22",
                  activities: [],
                  freePeriods: [{ freePeriodId: "free-invalid", mode: "unknown" }],
                },
              ],
            },
          }),
        ),
      "invalid-free-period",
    );
  });

  it("rejeita snapshot com Free Periods conhecido apenas para parte dos Dias", () => {
    const base = input();
    expectCode(
      () =>
        assembleItineraryProposalGenerationInput(
          input({
            itinerary: {
              ...base.itinerary,
              days: [
                { tripDayId: "day-known", date: "2026-08-22", activities: [], freePeriods: [] },
                { tripDayId: "day-unknown", date: "2026-08-23", activities: [] },
              ],
            },
          }),
        ),
      "invalid-day",
    );
  });

  it("rejeita Recommendation duplicada", () => {
    const base = input();
    expectCode(
      () =>
        assembleItineraryProposalGenerationInput(
          input({ recommendations: [base.recommendations[0]!, base.recommendations[0]!] }),
        ),
      "duplicate-recommendation",
    );
  });

  it("rejeita Recommendation de outra Trip", () => {
    const base = input();
    expectCode(
      () =>
        assembleItineraryProposalGenerationInput(
          input({
            recommendations: [{ ...base.recommendations[0]!, tripId: "trip-2" }],
          }),
        ),
      "recommendation-trip-mismatch",
    );
  });

  it("rejeita Place ausente para Recommendation elegível", () => {
    expectCode(
      () => assembleItineraryProposalGenerationInput(input({ places: [] })),
      "place-not-found",
    );
  });

  it("rejeita validade inconsistente", () => {
    const base = input();
    expectCode(
      () =>
        assembleItineraryProposalGenerationInput(
          input({
            recommendations: [
              {
                ...base.recommendations[0]!,
                expiresAt: new Date("2026-08-19T00:00:00.000Z"),
              },
            ],
          }),
        ),
      "invalid-recommendation",
    );
  });

  it("rejeita instante asOf inválido", () => {
    expectCode(
      () => assembleItineraryProposalGenerationInput(input({ asOf: new Date("invalid") })),
      "invalid-as-of",
    );
  });
});
