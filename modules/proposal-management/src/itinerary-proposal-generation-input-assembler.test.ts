import { describe, expect, it } from "vitest";

import {
  assembleItineraryProposalGenerationInput,
  assembleItineraryProposalGenerationInputFromSelection,
  ItineraryProposalGenerationInputAssemblyError,
  type AssembleItineraryProposalGenerationFromSelectionInput,
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
        category: "beach",
        latitude: -6.235,
        longitude: -35.045,
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
          days: source.itinerary.days.map((day) => ({
            tripDayId: day.tripDayId,
            date: day.date,
            activities: day.activities,
          })),
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

  it("preserva metadados opcionais e contextuais do Place e a justificativa", () => {
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
        category: "beach",
        latitude: -6.235,
        longitude: -35.045,
      },
      {
        candidateId: "recommendation-2",
        placeId: "place-2",
        title: "Baía dos Golfinhos",
        reason: "Boa opção para o grupo.",
      },
    ]);
  });

  it("rejeita coordenada parcial ou fora do intervalo no Place", () => {
    const source = input();
    const placeWithoutLongitude = { ...source.places[0]! };
    delete placeWithoutLongitude.longitude;
    expectCode(
      () =>
        assembleItineraryProposalGenerationInput(
          input({
            places: [placeWithoutLongitude],
            recommendations: [source.recommendations[1]!],
          }),
        ),
      "invalid-place",
    );
    expectCode(
      () =>
        assembleItineraryProposalGenerationInput(
          input({
            places: [{ ...source.places[0]!, latitude: 91 }],
            recommendations: [source.recommendations[1]!],
          }),
        ),
      "invalid-place",
    );
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

function selectionInput(
  overrides: Partial<AssembleItineraryProposalGenerationFromSelectionInput> = {},
): AssembleItineraryProposalGenerationFromSelectionInput {
  return {
    itinerary: {
      tripId: "trip-1",
      days: [{ tripDayId: "day-1", date: "2026-08-22", activities: [], freePeriods: [] }],
    },
    preferences: [
      {
        preferenceId: "preference-want",
        tripId: "trip-1",
        placeId: "place-want",
        intent: "WANT",
        priority: null,
      },
      {
        preferenceId: "preference-must",
        tripId: "trip-1",
        placeId: "place-must",
        intent: "WANT",
        priority: "MUST_DO",
      },
      {
        preferenceId: "preference-maybe",
        tripId: "trip-1",
        placeId: "place-maybe",
        intent: "MAYBE",
        priority: null,
      },
      {
        preferenceId: "preference-no",
        tripId: "trip-1",
        placeId: "place-no",
        intent: "NOT_INTERESTED",
        priority: null,
      },
    ],
    places: [
      { placeId: "place-want", title: "Praia escolhida", category: "beach" },
      { placeId: "place-must", title: "Passeio imperdível", category: "tour" },
      { placeId: "place-maybe", title: "Café talvez", category: "gastronomy" },
      { placeId: "place-no", title: "Lugar sem interesse", category: "shopping" },
    ],
    asOf,
    ...overrides,
  };
}

describe("assembleItineraryProposalGenerationInputFromSelection", () => {
  it("usa WANT por padrão, exclui MAYBE e NOT_INTERESTED e prioriza MUST_DO", () => {
    const result = assembleItineraryProposalGenerationInputFromSelection(selectionInput());

    expect(result.candidates.map(({ placeId }) => placeId)).toEqual(["place-must", "place-want"]);
    expect(result.candidates[0]).toMatchObject({
      candidateId: "preference-must",
      reason: "Lugar marcado como Imperdível na Minha seleção.",
    });
    expect(result.candidates[1]).toMatchObject({
      candidateId: "preference-want",
      reason: "Lugar escolhido como Quero ir na Minha seleção.",
    });
  });

  it("inclui MAYBE somente com opt-in explícito e após WANT", () => {
    const result = assembleItineraryProposalGenerationInputFromSelection(
      selectionInput({ includeMaybe: true }),
    );

    expect(result.candidates.map(({ placeId }) => placeId)).toEqual([
      "place-must",
      "place-want",
      "place-maybe",
    ]);
    expect(result.candidates[2]).toMatchObject({
      reason: "Lugar marcado como Talvez e incluído explicitamente nesta geração.",
    });
  });

  it("não exige Place para preferência inelegível", () => {
    const source = selectionInput();
    const result = assembleItineraryProposalGenerationInputFromSelection(
      selectionInput({
        preferences: source.preferences.filter(({ intent }) => intent === "NOT_INTERESTED"),
        places: [],
      }),
    );

    expect(result.candidates).toEqual([]);
  });

  it("rejeita MUST_DO fora de WANT", () => {
    const source = selectionInput();
    expectCode(
      () =>
        assembleItineraryProposalGenerationInputFromSelection(
          selectionInput({
            preferences: [
              {
                ...source.preferences[2]!,
                priority: "MUST_DO",
              },
            ],
          }),
        ),
      "invalid-preference",
    );
  });

  it("rejeita preferência de outra Trip", () => {
    const source = selectionInput();
    expectCode(
      () =>
        assembleItineraryProposalGenerationInputFromSelection(
          selectionInput({
            preferences: [{ ...source.preferences[0]!, tripId: "trip-2" }],
          }),
        ),
      "preference-trip-mismatch",
    );
  });

  it("rejeita duas preferências para o mesmo Place", () => {
    const source = selectionInput();
    expectCode(
      () =>
        assembleItineraryProposalGenerationInputFromSelection(
          selectionInput({
            preferences: [
              source.preferences[0]!,
              {
                ...source.preferences[0]!,
                preferenceId: "preference-duplicate-place",
              },
            ],
          }),
        ),
      "duplicate-preference",
    );
  });

  it("rejeita Place ausente para preferência elegível", () => {
    const source = selectionInput();
    expectCode(
      () =>
        assembleItineraryProposalGenerationInputFromSelection(
          selectionInput({
            preferences: [source.preferences[0]!],
            places: [],
          }),
        ),
      "place-not-found",
    );
  });
});
