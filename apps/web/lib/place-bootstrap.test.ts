import { describe, expect, it, vi } from "vitest";

import {
  derivePlaceBootstrapStage,
  isRetryablePlaceProviderError,
  placeBootstrapStageCopy,
  resolvePlaceBootstrapPolicy,
  runPlaceBootstrapStep,
} from "./place-bootstrap";

describe("resolvePlaceBootstrapPolicy", () => {
  it("usa defaults governados sem ampliar contratos", () => {
    expect(resolvePlaceBootstrapPolicy({})).toEqual({
      discovery: { enabled: true, maxAttempts: 2, candidateLimit: 200 },
      quality: { enabled: true, maxAttempts: 2, targetLimit: 60 },
      media: { enabled: true, maxAttempts: 2, previewBudget: 12 },
    });
  });

  it("aplica kill switches e clamps de retry/budget", () => {
    expect(
      resolvePlaceBootstrapPolicy({
        ROUTEBOOK_PLACE_DISCOVERY_ENABLED: "false",
        ROUTEBOOK_PLACE_DISCOVERY_MAX_ATTEMPTS: "99",
        ROUTEBOOK_PLACE_QUALITY_ENABLED: "0",
        ROUTEBOOK_PLACE_QUALITY_MAX_ATTEMPTS: "0",
        ROUTEBOOK_PLACE_QUALITY_TARGET_LIMIT: "999",
        ROUTEBOOK_PLACE_MEDIA_ENABLED: "off",
        ROUTEBOOK_PLACE_MEDIA_MAX_ATTEMPTS: "3",
        ROUTEBOOK_PLACE_MEDIA_PREVIEW_BUDGET: "999",
      }),
    ).toEqual({
      discovery: { enabled: false, maxAttempts: 3, candidateLimit: 200 },
      quality: { enabled: false, maxAttempts: 1, targetLimit: 60 },
      media: { enabled: false, maxAttempts: 3, previewBudget: 12 },
    });
  });
});

describe("runPlaceBootstrapStep", () => {
  it("não executa Provider quando kill switch está desligado", async () => {
    const operation = vi.fn(async () => "unused");

    await expect(
      runPlaceBootstrapStep({
        enabled: false,
        maxAttempts: 2,
        operation,
      }),
    ).resolves.toEqual({ status: "disabled", attempts: 0, durationMs: 0 });
    expect(operation).not.toHaveBeenCalled();
  });

  it("repete somente falha transitória e preserva idempotência read-only", async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("Provider respondeu 503"))
      .mockResolvedValueOnce("ok");
    const sleep = vi.fn(async () => undefined);
    let tick = 0;

    const result = await runPlaceBootstrapStep({
      enabled: true,
      maxAttempts: 3,
      operation,
      sleep,
      now: () => tick++ * 10,
    });

    expect(result).toMatchObject({ status: "success", value: "ok", attempts: 2 });
    expect(operation).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it("não repete erro permanente conhecido", async () => {
    const operation = vi.fn(async () => {
      throw new Error("Parâmetros inválidos para a Fonte.");
    });

    const result = await runPlaceBootstrapStep({
      enabled: true,
      maxAttempts: 3,
      operation,
      sleep: async () => undefined,
    });

    expect(result).toMatchObject({ status: "failed", attempts: 1, retryable: false });
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("classifica falhas transitórias sem transformar qualquer erro em retry", () => {
    expect(isRetryablePlaceProviderError(new Error("HTTP 429"))).toBe(true);
    expect(isRetryablePlaceProviderError(new Error("network failure"))).toBe(true);
    expect(isRetryablePlaceProviderError(new Error("categoria inválida"))).toBe(false);
    expect(
      isRetryablePlaceProviderError(
        new AggregateError([new Error("HTTP 429"), new Error("HTTP 503")]),
      ),
    ).toBe(true);
    expect(
      isRetryablePlaceProviderError(
        new AggregateError([new Error("HTTP 503"), new Error("HTTP 400")]),
      ),
    ).toBe(false);
  });
});

describe("derivePlaceBootstrapStage", () => {
  it("representa preparar, descobrir, enriquecer e pronto sem progresso artificial", () => {
    expect(
      derivePlaceBootstrapStage({
        regionResolved: false,
        safePlaceCount: 0,
        discoveryStatus: "disabled",
        mediaExpected: false,
      }),
    ).toBe("preparing");
    expect(
      derivePlaceBootstrapStage({
        regionResolved: true,
        safePlaceCount: 0,
        discoveryStatus: "failed",
        mediaExpected: false,
      }),
    ).toBe("discovering");
    expect(
      derivePlaceBootstrapStage({
        regionResolved: true,
        safePlaceCount: 10,
        discoveryStatus: "success",
        mediaExpected: true,
      }),
    ).toBe("enriching");
    expect(
      derivePlaceBootstrapStage({
        regionResolved: true,
        safePlaceCount: 10,
        discoveryStatus: "success",
        mediaExpected: false,
      }),
    ).toBe("ready");

    expect(placeBootstrapStageCopy("ready").label).toBe("Guia pronto");
  });
});
