import { describe, expect, it } from "vitest";

import {
  calculateBayesianReputation,
  calculatePlaceQualityScore,
  validatePlaceQualitySignals,
  type PlaceQualitySignals,
} from "./place-quality";

function signals(overrides: Partial<PlaceQualitySignals> = {}): PlaceQualitySignals {
  return {
    provider: "quality-provider",
    externalId: "place-1",
    rating: { value: 4.8, scaleMax: 5, reviewCount: 1_200 },
    popularity: { value: 0.82, scaleMax: 1 },
    collectedAt: new Date("2026-08-27T12:00:00.000Z"),
    ...overrides,
  };
}

describe("PlaceQualitySignals", () => {
  it("valida escala, Provenance mínima e quantidade de avaliações", () => {
    expect(() => validatePlaceQualitySignals(signals())).not.toThrow();
    expect(() =>
      validatePlaceQualitySignals(
        signals({
          rating: { value: 5.1, scaleMax: 5, reviewCount: 10 },
        }),
      ),
    ).toThrow("rating externo");
    expect(() =>
      validatePlaceQualitySignals(
        signals({
          rating: { value: 4.8, scaleMax: 5, reviewCount: -1 },
        }),
      ),
    ).toThrow("inteiro não negativo");
  });

  it("reduz o viés de nota perfeita com amostra minúscula", () => {
    const sparsePerfect = calculateBayesianReputation({
      value: 5,
      scaleMax: 5,
      reviewCount: 3,
    });
    const establishedExcellent = calculateBayesianReputation({
      value: 4.8,
      scaleMax: 5,
      reviewCount: 1_200,
    });

    expect(establishedExcellent).toBeGreaterThan(sparsePerfect);
  });

  it("não inventa score quando só existem distância ou horário", () => {
    expect(
      calculatePlaceQualityScore({
        category: "nightlife",
        distanceMeters: 300,
        contextualNow: true,
        signals: {
          provider: "quality-provider",
          externalId: "place-without-quality",
          openNow: true,
          collectedAt: new Date("2026-08-27T12:00:00.000Z"),
        },
      }),
    ).toBeUndefined();
  });

  it("combina reputação, popularidade e distância sem perder determinismo", () => {
    const input = {
      category: "beach" as const,
      distanceMeters: 900,
      signals: signals(),
    };

    const first = calculatePlaceQualityScore(input);
    const second = calculatePlaceQualityScore(input);

    expect(first).toEqual(second);
    expect(first?.score).toBeGreaterThan(0);
    expect(first?.reasons).toEqual(
      expect.arrayContaining(["Muito bem avaliado", "Muitas avaliações", "Popular na região"]),
    );
  });

  it("usa abertura como sinal contextual para vida noturna somente quando solicitado", () => {
    const openSignals = signals({ openNow: true });
    const closedSignals = signals({ openNow: false });

    const openNow = calculatePlaceQualityScore({
      category: "nightlife",
      distanceMeters: 1_000,
      contextualNow: true,
      signals: openSignals,
    });
    const closedNow = calculatePlaceQualityScore({
      category: "nightlife",
      distanceMeters: 1_000,
      contextualNow: true,
      signals: closedSignals,
    });
    const openWithoutCurrentContext = calculatePlaceQualityScore({
      category: "nightlife",
      distanceMeters: 1_000,
      contextualNow: false,
      signals: openSignals,
    });
    const closedWithoutCurrentContext = calculatePlaceQualityScore({
      category: "nightlife",
      distanceMeters: 1_000,
      contextualNow: false,
      signals: closedSignals,
    });

    expect(openNow!.score).toBeGreaterThan(closedNow!.score);
    expect(openWithoutCurrentContext?.score).toBe(closedWithoutCurrentContext?.score);
  });

  it("falha fechado para sinais expirando antes da coleta", () => {
    expect(
      calculatePlaceQualityScore({
        category: "gastronomy",
        signals: signals({
          expiresAt: new Date("2026-08-27T11:59:59.000Z"),
        }),
      }),
    ).toBeUndefined();
  });
});
