export type PlaceBootstrapStage = "preparing" | "discovering" | "enriching" | "ready";

export type PlaceBootstrapPolicy = Readonly<{
  discovery: Readonly<{
    enabled: boolean;
    maxAttempts: number;
    candidateLimit: number;
  }>;
  quality: Readonly<{
    enabled: boolean;
    maxAttempts: number;
    targetLimit: number;
  }>;
  media: Readonly<{
    enabled: boolean;
    maxAttempts: number;
    previewBudget: number;
  }>;
}>;

export type PlaceBootstrapStepResult<T> =
  | Readonly<{
      status: "success";
      value: T;
      attempts: number;
      durationMs: number;
    }>
  | Readonly<{
      status: "disabled";
      attempts: 0;
      durationMs: 0;
    }>
  | Readonly<{
      status: "failed";
      attempts: number;
      durationMs: number;
      retryable: boolean;
    }>;

const DEFAULT_POLICY: PlaceBootstrapPolicy = Object.freeze({
  discovery: Object.freeze({ enabled: true, maxAttempts: 2, candidateLimit: 200 }),
  quality: Object.freeze({ enabled: true, maxAttempts: 2, targetLimit: 60 }),
  media: Object.freeze({ enabled: true, maxAttempts: 2, previewBudget: 12 }),
});

function parseEnabled(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || !value.trim()) return fallback;
  const normalized = value.trim().toLowerCase();
  if (["0", "false", "off", "disabled", "no"].includes(normalized)) return false;
  if (["1", "true", "on", "enabled", "yes"].includes(normalized)) return true;
  return fallback;
}

function boundedInteger(
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (!value?.trim()) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

export function resolvePlaceBootstrapPolicy(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): PlaceBootstrapPolicy {
  return {
    discovery: {
      enabled: parseEnabled(
        environment.ROUTEBOOK_PLACE_DISCOVERY_ENABLED,
        DEFAULT_POLICY.discovery.enabled,
      ),
      maxAttempts: boundedInteger(
        environment.ROUTEBOOK_PLACE_DISCOVERY_MAX_ATTEMPTS,
        DEFAULT_POLICY.discovery.maxAttempts,
        1,
        3,
      ),
      candidateLimit: DEFAULT_POLICY.discovery.candidateLimit,
    },
    quality: {
      enabled: parseEnabled(
        environment.ROUTEBOOK_PLACE_QUALITY_ENABLED,
        DEFAULT_POLICY.quality.enabled,
      ),
      maxAttempts: boundedInteger(
        environment.ROUTEBOOK_PLACE_QUALITY_MAX_ATTEMPTS,
        DEFAULT_POLICY.quality.maxAttempts,
        1,
        3,
      ),
      targetLimit: boundedInteger(
        environment.ROUTEBOOK_PLACE_QUALITY_TARGET_LIMIT,
        DEFAULT_POLICY.quality.targetLimit,
        1,
        DEFAULT_POLICY.quality.targetLimit,
      ),
    },
    media: {
      enabled: parseEnabled(
        environment.ROUTEBOOK_PLACE_MEDIA_ENABLED,
        DEFAULT_POLICY.media.enabled,
      ),
      maxAttempts: boundedInteger(
        environment.ROUTEBOOK_PLACE_MEDIA_MAX_ATTEMPTS,
        DEFAULT_POLICY.media.maxAttempts,
        1,
        3,
      ),
      previewBudget: boundedInteger(
        environment.ROUTEBOOK_PLACE_MEDIA_PREVIEW_BUDGET,
        DEFAULT_POLICY.media.previewBudget,
        0,
        DEFAULT_POLICY.media.previewBudget,
      ),
    },
  };
}

export function isRetryablePlaceProviderError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return [
    "429",
    "500",
    "502",
    "503",
    "504",
    "timeout",
    "timed out",
    "abort",
    "network",
    "fetch failed",
    "temporar",
    "indispon",
    "connection reset",
  ].some((token) => message.includes(token));
}

type RunPlaceBootstrapStepInput<T> = Readonly<{
  enabled: boolean;
  maxAttempts: number;
  operation: () => Promise<T>;
  now?: () => number;
  sleep?: (milliseconds: number) => Promise<void>;
}>;

export async function runPlaceBootstrapStep<T>(
  input: RunPlaceBootstrapStepInput<T>,
): Promise<PlaceBootstrapStepResult<T>> {
  if (!input.enabled) return { status: "disabled", attempts: 0, durationMs: 0 };

  const now =
    input.now ??
    (() => Number(process.hrtime.bigint()) / 1_000_000);
  const sleep =
    input.sleep ??
    ((milliseconds: number) =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, milliseconds);
      }));
  const startedAt = now();
  let attempts = 0;
  let lastRetryable = false;

  while (attempts < input.maxAttempts) {
    attempts += 1;
    try {
      const value = await input.operation();
      return {
        status: "success",
        value,
        attempts,
        durationMs: Math.max(0, now() - startedAt),
      };
    } catch (error) {
      lastRetryable = isRetryablePlaceProviderError(error);
      if (!lastRetryable || attempts >= input.maxAttempts) {
        return {
          status: "failed",
          attempts,
          durationMs: Math.max(0, now() - startedAt),
          retryable: lastRetryable,
        };
      }
      await sleep(50 * attempts);
    }
  }

  return {
    status: "failed",
    attempts,
    durationMs: Math.max(0, now() - startedAt),
    retryable: lastRetryable,
  };
}

export function derivePlaceBootstrapStage(input: Readonly<{
  regionResolved: boolean;
  safePlaceCount: number;
  discoveryStatus: PlaceBootstrapStepResult<unknown>["status"];
  mediaExpected: boolean;
}>): PlaceBootstrapStage {
  if (!input.regionResolved) return "preparing";
  if (input.safePlaceCount === 0 && input.discoveryStatus === "failed") return "discovering";
  if (input.safePlaceCount > 0 && input.mediaExpected) return "enriching";
  return "ready";
}

export function placeBootstrapStageCopy(stage: PlaceBootstrapStage): Readonly<{
  label: string;
  description: string;
}> {
  switch (stage) {
    case "preparing":
      return {
        label: "Preparando seu guia",
        description: "Estamos organizando o contexto espacial disponível para esta viagem.",
      };
    case "discovering":
      return {
        label: "Descobrindo lugares",
        description:
          "A base segura ainda está sendo montada. Nenhum dado será inventado enquanto a fonte não responder.",
      };
    case "enriching":
      return {
        label: "Enriquecendo seu guia",
        description:
          "Os lugares já podem ser usados. Fotos e outros detalhes opcionais continuam sendo verificados sob demanda.",
      };
    case "ready":
      return {
        label: "Guia pronto",
        description: "A base segura disponível para este recorte já pode ser explorada.",
      };
  }
}
