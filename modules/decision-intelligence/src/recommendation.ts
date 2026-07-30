import { randomUUID } from "node:crypto";

const recommendationIdBrand: unique symbol = Symbol("RecommendationId");
const decisionIdBrand: unique symbol = Symbol("DecisionId");

export type RecommendationId = string & { readonly [recommendationIdBrand]: true };
export type DecisionId = string & { readonly [decisionIdBrand]: true };

export const recommendationStatuses = [
  "generated",
  "presented",
  "accepted",
  "rejected",
  "expired",
  "invalidated",
  "superseded",
] as const;

export type RecommendationStatus = (typeof recommendationStatuses)[number];
export type RecommendationConfidenceLevel = "low" | "medium" | "high";
export type RecommendationEvidenceValue = string | number | boolean;

export type DecisionContextSnapshot = Readonly<{
  schemaVersion: 1;
  tripId: string;
  destinationId: string;
  tripContextVersion: number;
  capturedAt: Date;
  travelerProfileVersion?: number;
  itineraryVersion?: number;
}>;

export type RecommendationTarget = Readonly<{
  kind: "place";
  placeId: string;
  destinationId: string;
  publicationStatus: "published";
}>;

export type RecommendationReason = Readonly<{
  code: string;
  message: string;
  evidence: Readonly<Record<string, RecommendationEvidenceValue>>;
}>;

export type RecommendationLimitation = Readonly<{
  code: string;
  message: string;
}>;

export type RecommendationScore = Readonly<{
  value: number;
  purpose: "ordering-only";
}>;

export type RecommendationConfidence = Readonly<{
  level: RecommendationConfidenceLevel;
  basis: readonly string[];
}>;

export type RecommendationValidity = Readonly<{
  validFrom: Date;
  expiresAt?: Date;
}>;

export type RecommendationGenerationMetadata = Readonly<{
  generator: "deterministic" | "manual";
  policyVersion: string;
  generatedAt: Date;
}>;

export type Recommendation = Readonly<{
  id: RecommendationId;
  status: RecommendationStatus;
  snapshot: DecisionContextSnapshot;
  target: RecommendationTarget;
  reasons: readonly RecommendationReason[];
  limitations: readonly RecommendationLimitation[];
  score: RecommendationScore;
  confidence: RecommendationConfidence;
  validity: RecommendationValidity;
  generation: RecommendationGenerationMetadata;
  createdAt: Date;
  updatedAt: Date;
  presentedAt?: Date;
  resolvedAt?: Date;
  linkedDecisionId?: DecisionId;
  statusReason?: string;
  supersededByRecommendationId?: RecommendationId;
}>;

export type CreateRecommendationInput = Readonly<{
  id?: string;
  snapshot: DecisionContextSnapshot;
  target: RecommendationTarget;
  reasons?: readonly RecommendationReason[];
  limitations?: readonly RecommendationLimitation[];
  score: RecommendationScore;
  confidence: RecommendationConfidence;
  validity: RecommendationValidity;
  generation: RecommendationGenerationMetadata;
}>;

export class RecommendationValidationError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Readonly<Record<string, string>>,
  ) {
    super(message);
    this.name = "RecommendationValidationError";
  }
}

export class RecommendationTransitionError extends Error {
  constructor(
    message: string,
    readonly currentStatus: RecommendationStatus,
    readonly attemptedStatus: RecommendationStatus,
  ) {
    super(message);
    this.name = "RecommendationTransitionError";
  }
}

function requiredText(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new RecommendationValidationError("Recommendation inválida.", {
      [field]: "Informe um valor não vazio.",
    });
  }
  return normalized;
}

function positiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new RecommendationValidationError("Recommendation inválida.", {
      [field]: "Use um inteiro positivo.",
    });
  }
  return value;
}

function validDate(value: Date, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new RecommendationValidationError("Recommendation inválida.", {
      [field]: "Informe uma data válida.",
    });
  }
  return new Date(value.getTime());
}

function assertTransitionTime(recommendation: Recommendation, at: Date): Date {
  const normalized = validDate(at, "transitionAt");
  if (normalized.getTime() < recommendation.updatedAt.getTime()) {
    throw new RecommendationValidationError("Instante de transição inválido.", {
      transitionAt: "O instante não pode ser anterior à última atualização.",
    });
  }
  return normalized;
}

function freezeEvidence(
  evidence: Readonly<Record<string, RecommendationEvidenceValue>>,
): Readonly<Record<string, RecommendationEvidenceValue>> {
  return Object.freeze({ ...evidence });
}

function freezeReasons(reasons: readonly RecommendationReason[]): readonly RecommendationReason[] {
  return Object.freeze(
    reasons.map((reason) =>
      Object.freeze({
        code: requiredText(reason.code, "reason.code"),
        message: requiredText(reason.message, "reason.message"),
        evidence: freezeEvidence(reason.evidence),
      }),
    ),
  );
}

function freezeLimitations(
  limitations: readonly RecommendationLimitation[],
): readonly RecommendationLimitation[] {
  return Object.freeze(
    limitations.map((limitation) =>
      Object.freeze({
        code: requiredText(limitation.code, "limitation.code"),
        message: requiredText(limitation.message, "limitation.message"),
      }),
    ),
  );
}

function freezeSnapshot(snapshot: DecisionContextSnapshot): DecisionContextSnapshot {
  const normalized: DecisionContextSnapshot = Object.freeze({
    schemaVersion: 1,
    tripId: requiredText(snapshot.tripId, "snapshot.tripId"),
    destinationId: requiredText(snapshot.destinationId, "snapshot.destinationId"),
    tripContextVersion: positiveInteger(
      snapshot.tripContextVersion,
      "snapshot.tripContextVersion",
    ),
    capturedAt: validDate(snapshot.capturedAt, "snapshot.capturedAt"),
    ...(snapshot.travelerProfileVersion !== undefined
      ? {
          travelerProfileVersion: positiveInteger(
            snapshot.travelerProfileVersion,
            "snapshot.travelerProfileVersion",
          ),
        }
      : {}),
    ...(snapshot.itineraryVersion !== undefined
      ? {
          itineraryVersion: positiveInteger(snapshot.itineraryVersion, "snapshot.itineraryVersion"),
        }
      : {}),
  });

  return normalized;
}

function freezeTarget(
  target: RecommendationTarget,
  snapshot: DecisionContextSnapshot,
): RecommendationTarget {
  if (target.kind !== "place" || target.publicationStatus !== "published") {
    throw new RecommendationValidationError("Alvo de Recommendation inválido.", {
      target: "O alvo inicial deve ser um Place publicado.",
    });
  }

  const normalized: RecommendationTarget = Object.freeze({
    kind: "place",
    placeId: requiredText(target.placeId, "target.placeId"),
    destinationId: requiredText(target.destinationId, "target.destinationId"),
    publicationStatus: "published",
  });

  if (normalized.destinationId !== snapshot.destinationId) {
    throw new RecommendationValidationError("Alvo incompatível com o Context Snapshot.", {
      "target.destinationId": "O Place deve pertencer ao Destino avaliado.",
    });
  }

  return normalized;
}

function freezeScore(score: RecommendationScore): RecommendationScore {
  if (!Number.isFinite(score.value) || score.value < 0) {
    throw new RecommendationValidationError("RecommendationScore inválido.", {
      score: "Use um número finito maior ou igual a zero.",
    });
  }

  if (score.purpose !== "ordering-only") {
    throw new RecommendationValidationError("RecommendationScore inválido.", {
      score: "O score deve ser usado exclusivamente para ordenação interna.",
    });
  }

  return Object.freeze({ value: score.value, purpose: "ordering-only" });
}

function freezeConfidence(confidence: RecommendationConfidence): RecommendationConfidence {
  if (!(["low", "medium", "high"] as const).includes(confidence.level)) {
    throw new RecommendationValidationError("RecommendationConfidence inválida.", {
      confidence: "Use low, medium ou high.",
    });
  }

  const basis = confidence.basis.map((item) => requiredText(item, "confidence.basis"));
  if (basis.length === 0) {
    throw new RecommendationValidationError("RecommendationConfidence inválida.", {
      confidence: "Registre ao menos uma base contextual para a confiança.",
    });
  }

  return Object.freeze({ level: confidence.level, basis: Object.freeze(basis) });
}

function freezeValidity(validity: RecommendationValidity): RecommendationValidity {
  const validFrom = validDate(validity.validFrom, "validity.validFrom");
  const expiresAt = validity.expiresAt
    ? validDate(validity.expiresAt, "validity.expiresAt")
    : undefined;

  if (expiresAt && expiresAt.getTime() <= validFrom.getTime()) {
    throw new RecommendationValidationError("RecommendationValidity inválida.", {
      expiresAt: "A expiração deve ser posterior ao início da validade.",
    });
  }

  return Object.freeze({
    validFrom,
    ...(expiresAt ? { expiresAt } : {}),
  });
}

function freezeGeneration(
  generation: RecommendationGenerationMetadata,
): RecommendationGenerationMetadata {
  if (generation.generator !== "deterministic" && generation.generator !== "manual") {
    throw new RecommendationValidationError("Metadados de geração inválidos.", {
      generator: "Use deterministic ou manual.",
    });
  }

  return Object.freeze({
    generator: generation.generator,
    policyVersion: requiredText(generation.policyVersion, "generation.policyVersion"),
    generatedAt: validDate(generation.generatedAt, "generation.generatedAt"),
  });
}

function freezeRecommendation(recommendation: Recommendation): Recommendation {
  return Object.freeze(recommendation);
}

export function createRecommendationId(value: string = randomUUID()): RecommendationId {
  return requiredText(value, "recommendationId") as RecommendationId;
}

export function createDecisionId(value: string): DecisionId {
  return requiredText(value, "decisionId") as DecisionId;
}

export function createRecommendation(input: CreateRecommendationInput): Recommendation {
  const snapshot = freezeSnapshot(input.snapshot);
  const target = freezeTarget(input.target, snapshot);
  const generation = freezeGeneration(input.generation);
  const validity = freezeValidity(input.validity);

  if (generation.generatedAt.getTime() < validity.validFrom.getTime()) {
    throw new RecommendationValidationError("Instante de geração incompatível com a validade.", {
      generatedAt: "A geração não pode ocorrer antes do início da validade.",
    });
  }

  const createdAt = new Date(generation.generatedAt.getTime());

  return freezeRecommendation({
    id: createRecommendationId(input.id),
    status: "generated",
    snapshot,
    target,
    reasons: freezeReasons(input.reasons ?? []),
    limitations: freezeLimitations(input.limitations ?? []),
    score: freezeScore(input.score),
    confidence: freezeConfidence(input.confidence),
    validity,
    generation,
    createdAt,
    updatedAt: new Date(createdAt.getTime()),
  });
}

export function isRecommendationExpiredAt(
  recommendation: Recommendation,
  at: Date,
): boolean {
  const instant = validDate(at, "at");
  return Boolean(
    recommendation.validity.expiresAt &&
      instant.getTime() >= recommendation.validity.expiresAt.getTime(),
  );
}

function assertActiveTransition(
  recommendation: Recommendation,
  attemptedStatus: RecommendationStatus,
): void {
  if (recommendation.status !== "generated" && recommendation.status !== "presented") {
    throw new RecommendationTransitionError(
      `Recommendation em estado ${recommendation.status} não aceita esta transição.`,
      recommendation.status,
      attemptedStatus,
    );
  }
}

export function presentRecommendation(
  recommendation: Recommendation,
  presentedAt: Date,
): Recommendation {
  if (recommendation.status !== "generated") {
    throw new RecommendationTransitionError(
      "Somente uma Recommendation generated pode ser apresentada.",
      recommendation.status,
      "presented",
    );
  }

  if (recommendation.reasons.length === 0) {
    throw new RecommendationValidationError("Recommendation sem motivo não pode ser apresentada.", {
      reasons: "Registre ao menos um RecommendationReason baseado em dado conhecido.",
    });
  }

  const at = assertTransitionTime(recommendation, presentedAt);
  if (isRecommendationExpiredAt(recommendation, at)) {
    throw new RecommendationTransitionError(
      "Recommendation expirada não pode ser apresentada.",
      recommendation.status,
      "presented",
    );
  }

  return freezeRecommendation({
    ...recommendation,
    status: "presented",
    presentedAt: at,
    updatedAt: new Date(at.getTime()),
  });
}

export function rejectRecommendation(
  recommendation: Recommendation,
  rejectedAt: Date,
  reason = "ignored-by-user",
): Recommendation {
  if (recommendation.status !== "presented") {
    throw new RecommendationTransitionError(
      "Somente uma Recommendation apresentada pode ser rejeitada.",
      recommendation.status,
      "rejected",
    );
  }

  const at = assertTransitionTime(recommendation, rejectedAt);
  return freezeRecommendation({
    ...recommendation,
    status: "rejected",
    resolvedAt: at,
    statusReason: requiredText(reason, "statusReason"),
    updatedAt: new Date(at.getTime()),
  });
}

export function acceptRecommendation(
  recommendation: Recommendation,
  decisionId: string,
  acceptedAt: Date,
): Recommendation {
  if (recommendation.status !== "presented") {
    throw new RecommendationTransitionError(
      "Somente uma Recommendation apresentada pode ser aceita.",
      recommendation.status,
      "accepted",
    );
  }

  const at = assertTransitionTime(recommendation, acceptedAt);
  if (isRecommendationExpiredAt(recommendation, at)) {
    throw new RecommendationTransitionError(
      "Recommendation expirada não pode ser aceita.",
      recommendation.status,
      "accepted",
    );
  }

  return freezeRecommendation({
    ...recommendation,
    status: "accepted",
    linkedDecisionId: createDecisionId(decisionId),
    resolvedAt: at,
    updatedAt: new Date(at.getTime()),
  });
}

export function expireRecommendation(
  recommendation: Recommendation,
  expiredAt: Date,
): Recommendation {
  assertActiveTransition(recommendation, "expired");
  const at = assertTransitionTime(recommendation, expiredAt);

  if (!recommendation.validity.expiresAt || !isRecommendationExpiredAt(recommendation, at)) {
    throw new RecommendationValidationError("Recommendation ainda não atingiu sua expiração.", {
      expiredAt: "Use um instante igual ou posterior a expiresAt.",
    });
  }

  return freezeRecommendation({
    ...recommendation,
    status: "expired",
    resolvedAt: at,
    statusReason: "validity-window-ended",
    updatedAt: new Date(at.getTime()),
  });
}

export function invalidateRecommendation(
  recommendation: Recommendation,
  reason: string,
  invalidatedAt: Date,
): Recommendation {
  assertActiveTransition(recommendation, "invalidated");
  const at = assertTransitionTime(recommendation, invalidatedAt);

  return freezeRecommendation({
    ...recommendation,
    status: "invalidated",
    resolvedAt: at,
    statusReason: requiredText(reason, "statusReason"),
    updatedAt: new Date(at.getTime()),
  });
}

export function supersedeRecommendation(
  recommendation: Recommendation,
  replacementRecommendationId: string,
  supersededAt: Date,
): Recommendation {
  assertActiveTransition(recommendation, "superseded");
  const at = assertTransitionTime(recommendation, supersededAt);
  const replacementId = createRecommendationId(replacementRecommendationId);

  if (replacementId === recommendation.id) {
    throw new RecommendationValidationError("Substituição inválida.", {
      replacementRecommendationId: "A Recommendation substituta deve possuir outra identidade.",
    });
  }

  return freezeRecommendation({
    ...recommendation,
    status: "superseded",
    supersededByRecommendationId: replacementId,
    resolvedAt: at,
    statusReason: "replaced-by-newer-evaluation",
    updatedAt: new Date(at.getTime()),
  });
}
