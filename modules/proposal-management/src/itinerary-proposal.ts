import { randomUUID } from "node:crypto";

const itineraryProposalIdBrand: unique symbol = Symbol("ItineraryProposalId");

export type ItineraryProposalId = string & {
  readonly [itineraryProposalIdBrand]: true;
};

export const itineraryProposalStatuses = [
  "requested",
  "generating",
  "ready",
  "partially-accepted",
  "accepted",
  "rejected",
  "expired",
  "failed",
  "cancelled",
  "superseded",
] as const;

export type ItineraryProposalStatus = (typeof itineraryProposalStatuses)[number];

export const proposedActivityOperationTypes = ["add", "move", "update", "remove"] as const;

export type ProposedActivityOperationType = (typeof proposedActivityOperationTypes)[number];

export const itineraryProposalGenerationScopes = ["INITIAL", "REPLAN"] as const;

export type ItineraryProposalGenerationScope = (typeof itineraryProposalGenerationScopes)[number];

export const proposalCandidateOrigins = ["USER_SELECTED", "ROUTEBOOK_RECOMMENDED"] as const;

export type ProposalCandidateOrigin = (typeof proposalCandidateOrigins)[number];

export type ProposalCandidateProvenance = Readonly<{
  sourceId?: string;
  reasonCode?: string;
}>;

export type ItineraryProposalCandidateSnapshotItem = Readonly<{
  candidateId: string;
  placeId: string;
  origin: ProposalCandidateOrigin;
  provenance: ProposalCandidateProvenance;
}>;

export type ItineraryProposalSelectionSnapshotItem = Readonly<{
  preferenceId: string;
  placeId: string;
  intent: "WANT" | "MAYBE" | "NOT_INTERESTED";
  priority: "MUST_DO" | null;
}>;

export type ItineraryProposalReplanningWindowSnapshot = Readonly<{
  capturedAt: string;
  timeZone: string;
  localDate: string;
  localTime: string;
  eligibleDayIds: readonly string[];
  eligibleActivityIds: readonly string[];
  protectedActivityIds: readonly string[];
  reasonByActivityId: Readonly<Record<string, string>>;
}>;

export type ItineraryProposalGenerationContext = Readonly<{
  schemaVersion: 1;
  includeMaybe: boolean;
  selection: readonly ItineraryProposalSelectionSnapshotItem[];
  /** Ausência preserva compatibilidade com snapshots anteriores ao RB-INC-208. */
  candidates?: readonly ItineraryProposalCandidateSnapshotItem[];
  replanningWindow?: ItineraryProposalReplanningWindowSnapshot;
}>;

export type ProposedActivity = Readonly<{
  proposedActivityId: string;
  targetTripDayId?: string;
  sourceActivityId?: string;
  placeId?: string;
  title: string;
  description?: string;
  proposedStartTime?: string;
  durationMinutes?: number;
  proposedOrder?: number;
  operationType: ProposedActivityOperationType;
  flexibility?: string;
  estimatedCostAmount?: number;
  estimatedCostCurrency?: string;
  reason?: string;
}>;

export type ProposedActivityInput = ProposedActivity;

export type CompleteItineraryProposalGenerationInput = Readonly<{
  generationMethod: string;
  generationVersion: string;
  proposedActivities: readonly ProposedActivityInput[];
  criteria: readonly string[];
  justifications: readonly string[];
  limitations: readonly string[];
  planningConflictIds: readonly string[];
  validUntil: Date;
  generatedAt: Date;
}>;

export type ItineraryProposal = Readonly<{
  id: ItineraryProposalId;
  tripId: string;
  itineraryId: string;
  baseTripContextVersion: number;
  baseItineraryVersion: number;
  contextSnapshotId: string;
  /** Ausência em objetos legados equivale a INITIAL. Novas Proposals sempre materializam o scope. */
  generationScope?: ItineraryProposalGenerationScope;
  generationContext?: ItineraryProposalGenerationContext;
  status: ItineraryProposalStatus;
  requestedAt: Date;
  updatedAt: Date;
  generationStartedAt?: Date;
  generationMethod?: string;
  generationVersion?: string;
  proposedActivities?: readonly ProposedActivity[];
  criteria?: readonly string[];
  justifications?: readonly string[];
  limitations?: readonly string[];
  planningConflictIds?: readonly string[];
  validUntil?: Date;
  generatedAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  expiredAt?: Date;
  failedAt?: Date;
  failureCode?: string;
  cancelledAt?: Date;
}>;

export type RequestItineraryProposalInput = Readonly<{
  id?: string;
  tripId: string;
  itineraryId: string;
  baseTripContextVersion: number;
  baseItineraryVersion: number;
  contextSnapshotId: string;
  generationScope?: ItineraryProposalGenerationScope;
  generationContext?: ItineraryProposalGenerationContext;
  requestedAt: Date;
}>;

export class ItineraryProposalValidationError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Readonly<Record<string, string>>,
  ) {
    super(message);
    this.name = "ItineraryProposalValidationError";
  }
}

export class ItineraryProposalTransitionError extends Error {
  constructor(
    message: string,
    readonly currentStatus: ItineraryProposalStatus,
    readonly attemptedStatus: ItineraryProposalStatus,
  ) {
    super(message);
    this.name = "ItineraryProposalTransitionError";
  }
}

function requiredText(value: string, field: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Informe um valor não vazio.",
    });
  }
  return normalized;
}

function optionalText(value: string | undefined, field: string): string | undefined {
  return value === undefined ? undefined : requiredText(value, field);
}

function optionalPositiveInteger(value: number | undefined, field: string): number | undefined {
  return value === undefined ? undefined : positiveInteger(value, field);
}

function optionalNonNegativeInteger(value: number | undefined, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || value < 0) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Use um inteiro maior ou igual a zero.",
    });
  }
  return value;
}

function optionalNonNegativeNumber(value: number | undefined, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isFinite(value) || value < 0) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Use um número finito maior ou igual a zero.",
    });
  }
  return value;
}

function optionalLocalTime(value: string | undefined, field: string): string | undefined {
  const normalized = optionalText(value, field);
  if (normalized === undefined) return undefined;
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(normalized)) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Use um horário local no formato HH:mm ou HH:mm:ss.",
    });
  }
  return normalized;
}

function optionalCurrency(value: string | undefined, field: string): string | undefined {
  const normalized = optionalText(value, field)?.toUpperCase();
  if (normalized === undefined) return undefined;
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Use um código de moeda com três letras.",
    });
  }
  return normalized;
}

function normalizedTexts(
  values: readonly string[],
  field: string,
  requireAtLeastOne: boolean,
): readonly string[] {
  if (!Array.isArray(values) || (requireAtLeastOne && values.length === 0)) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Informe ao menos um item.",
    });
  }

  return Object.freeze(values.map((value, index) => requiredText(value, `${field}.${index}`)));
}

function normalizeProposedActivity(
  activity: ProposedActivityInput,
  index: number,
): ProposedActivity {
  const field = `proposedActivities.${index}`;
  if (!activity || typeof activity !== "object") {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Informe uma Proposed Activity válida.",
    });
  }

  if (!proposedActivityOperationTypes.includes(activity.operationType)) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [`${field}.operationType`]: "Use add, move, update ou remove.",
    });
  }

  const targetTripDayId = optionalText(activity.targetTripDayId, `${field}.targetTripDayId`);
  const sourceActivityId = optionalText(activity.sourceActivityId, `${field}.sourceActivityId`);
  const placeId = optionalText(activity.placeId, `${field}.placeId`);
  const description = optionalText(activity.description, `${field}.description`);
  const proposedStartTime = optionalLocalTime(
    activity.proposedStartTime,
    `${field}.proposedStartTime`,
  );
  const durationMinutes = optionalPositiveInteger(
    activity.durationMinutes,
    `${field}.durationMinutes`,
  );
  const proposedOrder = optionalNonNegativeInteger(
    activity.proposedOrder,
    `${field}.proposedOrder`,
  );
  const flexibility = optionalText(activity.flexibility, `${field}.flexibility`);
  const estimatedCostAmount = optionalNonNegativeNumber(
    activity.estimatedCostAmount,
    `${field}.estimatedCostAmount`,
  );
  const estimatedCostCurrency = optionalCurrency(
    activity.estimatedCostCurrency,
    `${field}.estimatedCostCurrency`,
  );
  const reason = optionalText(activity.reason, `${field}.reason`);

  return Object.freeze({
    proposedActivityId: requiredText(activity.proposedActivityId, `${field}.proposedActivityId`),
    title: requiredText(activity.title, `${field}.title`),
    operationType: activity.operationType,
    ...(targetTripDayId ? { targetTripDayId } : {}),
    ...(sourceActivityId ? { sourceActivityId } : {}),
    ...(placeId ? { placeId } : {}),
    ...(description ? { description } : {}),
    ...(proposedStartTime ? { proposedStartTime } : {}),
    ...(durationMinutes !== undefined ? { durationMinutes } : {}),
    ...(proposedOrder !== undefined ? { proposedOrder } : {}),
    ...(flexibility ? { flexibility } : {}),
    ...(estimatedCostAmount !== undefined ? { estimatedCostAmount } : {}),
    ...(estimatedCostCurrency ? { estimatedCostCurrency } : {}),
    ...(reason ? { reason } : {}),
  });
}

function normalizedGenerationScope(
  value: ItineraryProposalGenerationScope | undefined,
): ItineraryProposalGenerationScope {
  const scope = value ?? "INITIAL";
  if (!itineraryProposalGenerationScopes.includes(scope)) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      generationScope: "Use INITIAL ou REPLAN.",
    });
  }
  return scope;
}

function normalizedUniqueTexts(values: readonly string[], field: string): readonly string[] {
  if (!Array.isArray(values)) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Informe uma coleção válida.",
    });
  }
  const normalized = values.map((value, index) => requiredText(value, `${field}.${index}`));
  if (new Set(normalized).size !== normalized.length) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Não repita identidades no snapshot.",
    });
  }
  return Object.freeze(normalized);
}

function normalizedSelectionSnapshot(
  value: readonly ItineraryProposalSelectionSnapshotItem[],
): readonly ItineraryProposalSelectionSnapshotItem[] {
  if (!Array.isArray(value)) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      "generationContext.selection": "Informe uma coleção válida.",
    });
  }

  const preferenceIds = new Set<string>();
  const placeIds = new Set<string>();
  return Object.freeze(
    value.map((item, index) => {
      const field = `generationContext.selection.${index}`;
      if (!item || typeof item !== "object") {
        throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
          [field]: "Informe uma preferência válida.",
        });
      }
      const preferenceId = requiredText(item.preferenceId, `${field}.preferenceId`);
      const placeId = requiredText(item.placeId, `${field}.placeId`);
      if (preferenceIds.has(preferenceId) || placeIds.has(placeId)) {
        throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
          [field]: "Cada preferência e Place devem aparecer uma única vez.",
        });
      }
      preferenceIds.add(preferenceId);
      placeIds.add(placeId);
      if (!["WANT", "MAYBE", "NOT_INTERESTED"].includes(item.intent)) {
        throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
          [`${field}.intent`]: "Use WANT, MAYBE ou NOT_INTERESTED.",
        });
      }
      if (item.priority !== null && item.priority !== "MUST_DO") {
        throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
          [`${field}.priority`]: "Use MUST_DO ou null.",
        });
      }
      if (item.priority === "MUST_DO" && item.intent !== "WANT") {
        throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
          [`${field}.priority`]: "MUST_DO só é válido para WANT.",
        });
      }
      return Object.freeze({
        preferenceId,
        placeId,
        intent: item.intent,
        priority: item.priority,
      });
    }),
  );
}

function normalizedCandidateSnapshot(
  value: readonly ItineraryProposalCandidateSnapshotItem[] | undefined,
  selection: readonly ItineraryProposalSelectionSnapshotItem[],
  includeMaybe: boolean,
): readonly ItineraryProposalCandidateSnapshotItem[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      "generationContext.candidates": "Informe uma coleção válida.",
    });
  }

  const candidateIds = new Set<string>();
  return Object.freeze(
    value.map((item, index) => {
      const field = `generationContext.candidates.${index}`;
      if (!item || typeof item !== "object") {
        throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
          [field]: "Informe um candidato válido.",
        });
      }
      const candidateId = requiredText(item.candidateId, `${field}.candidateId`);
      if (candidateIds.has(candidateId)) {
        throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
          [field]: "Cada candidato deve possuir identidade única.",
        });
      }
      candidateIds.add(candidateId);
      const placeId = requiredText(item.placeId, `${field}.placeId`);
      if (!proposalCandidateOrigins.includes(item.origin)) {
        throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
          [`${field}.origin`]: "Use USER_SELECTED ou ROUTEBOOK_RECOMMENDED.",
        });
      }
      if (!item.provenance || typeof item.provenance !== "object") {
        throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
          [`${field}.provenance`]: "Informe proveniência estruturada.",
        });
      }
      const sourceId = optionalText(item.provenance.sourceId, `${field}.provenance.sourceId`);
      const reasonCode = optionalText(item.provenance.reasonCode, `${field}.provenance.reasonCode`);
      if (item.origin === "USER_SELECTED") {
        if (!sourceId) {
          throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
            [`${field}.provenance.sourceId`]: "USER_SELECTED exige a origem da preferência.",
          });
        }
        const preference = selection.find((item) => item.preferenceId === sourceId);
        if (
          !preference ||
          preference.placeId !== placeId ||
          preference.intent === "NOT_INTERESTED" ||
          (preference.intent === "MAYBE" && !includeMaybe)
        ) {
          throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
            [field]: "USER_SELECTED deve referenciar uma preferência elegível do mesmo Place.",
          });
        }
      }
      if (item.origin === "ROUTEBOOK_RECOMMENDED") {
        if (!reasonCode) {
          throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
            [`${field}.provenance.reasonCode`]: "ROUTEBOOK_RECOMMENDED exige uma razão estrutural.",
          });
        }
        if (selection.some((item) => item.placeId === placeId)) {
          throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
            [field]:
              "ROUTEBOOK_RECOMMENDED não pode representar um Place com TripPlacePreference.",
          });
        }
      }
      return Object.freeze({
        candidateId,
        placeId,
        origin: item.origin,
        provenance: Object.freeze({
          ...(sourceId ? { sourceId } : {}),
          ...(reasonCode ? { reasonCode } : {}),
        }),
      });
    }),
  );
}

function normalizedReplanningWindowSnapshot(
  value: ItineraryProposalReplanningWindowSnapshot,
): ItineraryProposalReplanningWindowSnapshot {
  if (!value || typeof value !== "object") {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      "generationContext.replanningWindow": "Informe uma ReplanningWindow válida.",
    });
  }
  const capturedAtDate = new Date(value.capturedAt);
  if (!Number.isFinite(capturedAtDate.getTime())) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      "generationContext.replanningWindow.capturedAt": "Informe um instante ISO válido.",
    });
  }
  const timeZone = requiredText(value.timeZone, "generationContext.replanningWindow.timeZone");
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
  } catch {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      "generationContext.replanningWindow.timeZone": "Informe um timezone IANA válido.",
    });
  }
  const localDate = requiredText(value.localDate, "generationContext.replanningWindow.localDate");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      "generationContext.replanningWindow.localDate": "Use YYYY-MM-DD.",
    });
  }
  const localTime = requiredText(value.localTime, "generationContext.replanningWindow.localTime");
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(localTime)) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      "generationContext.replanningWindow.localTime": "Use HH:mm.",
    });
  }

  const eligibleDayIds = normalizedUniqueTexts(
    value.eligibleDayIds,
    "generationContext.replanningWindow.eligibleDayIds",
  );
  const eligibleActivityIds = normalizedUniqueTexts(
    value.eligibleActivityIds,
    "generationContext.replanningWindow.eligibleActivityIds",
  );
  const protectedActivityIds = normalizedUniqueTexts(
    value.protectedActivityIds,
    "generationContext.replanningWindow.protectedActivityIds",
  );
  if (eligibleActivityIds.some((id) => protectedActivityIds.includes(id))) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      "generationContext.replanningWindow": "Uma Activity não pode ser elegível e protegida.",
    });
  }

  if (!value.reasonByActivityId || typeof value.reasonByActivityId !== "object") {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      "generationContext.replanningWindow.reasonByActivityId": "Informe os motivos de proteção.",
    });
  }
  const reasonByActivityId: Record<string, string> = {};
  for (const activityId of protectedActivityIds) {
    reasonByActivityId[activityId] = requiredText(
      value.reasonByActivityId[activityId] ?? "",
      `generationContext.replanningWindow.reasonByActivityId.${activityId}`,
    );
  }

  return Object.freeze({
    capturedAt: capturedAtDate.toISOString(),
    timeZone,
    localDate,
    localTime,
    eligibleDayIds,
    eligibleActivityIds,
    protectedActivityIds,
    reasonByActivityId: Object.freeze(reasonByActivityId),
  });
}

function normalizedGenerationContext(
  value: ItineraryProposalGenerationContext | undefined,
  scope: ItineraryProposalGenerationScope,
): ItineraryProposalGenerationContext | undefined {
  if (value === undefined) {
    if (scope === "REPLAN") {
      throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
        generationContext: "REPLAN exige snapshot de geração.",
      });
    }
    return undefined;
  }
  if (!value || typeof value !== "object" || value.schemaVersion !== 1) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      generationContext: "Use schemaVersion 1.",
    });
  }
  if (typeof value.includeMaybe !== "boolean") {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      "generationContext.includeMaybe": "Informe um booleano.",
    });
  }

  const selection = normalizedSelectionSnapshot(value.selection);
  const candidates = normalizedCandidateSnapshot(
    value.candidates,
    selection,
    value.includeMaybe,
  );
  const replanningWindow = value.replanningWindow
    ? normalizedReplanningWindowSnapshot(value.replanningWindow)
    : undefined;
  if (scope === "REPLAN" && !replanningWindow) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      "generationContext.replanningWindow": "REPLAN exige ReplanningWindow.",
    });
  }
  if (scope === "INITIAL" && replanningWindow) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      "generationContext.replanningWindow": "INITIAL não deve registrar ReplanningWindow.",
    });
  }

  return Object.freeze({
    schemaVersion: 1 as const,
    includeMaybe: value.includeMaybe,
    selection,
    ...(candidates ? { candidates } : {}),
    ...(replanningWindow ? { replanningWindow } : {}),
  });
}

function positiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Use um inteiro positivo.",
    });
  }
  return value;
}

function validDate(value: Date, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Informe uma data válida.",
    });
  }
  return new Date(value.getTime());
}

function transitionDate(proposal: ItineraryProposal, value: Date): Date {
  const normalized = validDate(value, "transitionAt");
  if (normalized.getTime() < proposal.updatedAt.getTime()) {
    throw new ItineraryProposalValidationError("Instante de transição inválido.", {
      transitionAt: "O instante não pode ser anterior à última atualização.",
    });
  }
  return normalized;
}

function assertStatus(
  proposal: ItineraryProposal,
  allowedStatuses: readonly ItineraryProposalStatus[],
  attemptedStatus: ItineraryProposalStatus,
): void {
  if (!allowedStatuses.includes(proposal.status)) {
    throw new ItineraryProposalTransitionError(
      `Não é possível alterar Itinerary Proposal de ${proposal.status} para ${attemptedStatus}.`,
      proposal.status,
      attemptedStatus,
    );
  }
}

export function createItineraryProposalId(value: string = randomUUID()): ItineraryProposalId {
  return requiredText(value, "id") as ItineraryProposalId;
}

export function requestItineraryProposal(input: RequestItineraryProposalInput): ItineraryProposal {
  const requestedAt = validDate(input.requestedAt, "requestedAt");
  const generationScope = normalizedGenerationScope(input.generationScope);
  const generationContext = normalizedGenerationContext(input.generationContext, generationScope);

  return Object.freeze({
    id: createItineraryProposalId(input.id),
    tripId: requiredText(input.tripId, "tripId"),
    itineraryId: requiredText(input.itineraryId, "itineraryId"),
    baseTripContextVersion: positiveInteger(input.baseTripContextVersion, "baseTripContextVersion"),
    baseItineraryVersion: positiveInteger(input.baseItineraryVersion, "baseItineraryVersion"),
    contextSnapshotId: requiredText(input.contextSnapshotId, "contextSnapshotId"),
    generationScope,
    ...(generationContext ? { generationContext } : {}),
    status: "requested",
    requestedAt,
    updatedAt: new Date(requestedAt.getTime()),
  });
}

export function startItineraryProposalGeneration(
  proposal: ItineraryProposal,
  startedAt: Date,
): ItineraryProposal {
  assertStatus(proposal, ["requested"], "generating");
  const generationStartedAt = transitionDate(proposal, startedAt);

  return Object.freeze({
    ...proposal,
    status: "generating",
    generationStartedAt,
    updatedAt: new Date(generationStartedAt.getTime()),
  });
}

export function completeItineraryProposalGeneration(
  proposal: ItineraryProposal,
  input: CompleteItineraryProposalGenerationInput,
): ItineraryProposal {
  assertStatus(proposal, ["generating"], "ready");
  const generatedAt = transitionDate(proposal, input.generatedAt);
  const validUntil = validDate(input.validUntil, "validUntil");
  const generationMethod = requiredText(input.generationMethod, "generationMethod");
  const generationVersion = requiredText(input.generationVersion, "generationVersion");
  if (!Array.isArray(input.proposedActivities)) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      proposedActivities: "Informe uma coleção de Proposed Activities.",
    });
  }

  const proposedActivities = Object.freeze(input.proposedActivities.map(normalizeProposedActivity));
  const criteria = normalizedTexts(input.criteria, "criteria", true);
  const justifications = normalizedTexts(input.justifications, "justifications", true);
  const limitations = normalizedTexts(input.limitations, "limitations", false);
  const planningConflictIds = normalizedTexts(
    input.planningConflictIds,
    "planningConflictIds",
    false,
  );

  return Object.freeze({
    ...proposal,
    status: "ready",
    generationMethod,
    generationVersion,
    proposedActivities,
    criteria,
    justifications,
    limitations,
    planningConflictIds,
    validUntil,
    generatedAt,
    updatedAt: new Date(generatedAt.getTime()),
  });
}

export function expireItineraryProposalByTime(
  proposal: ItineraryProposal,
  expiredAt: Date,
): ItineraryProposal {
  assertStatus(proposal, ["ready"], "expired");
  const normalizedExpiredAt = transitionDate(proposal, expiredAt);
  if (!proposal.validUntil) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      validUntil: "A Proposal pronta deve possuir validade temporal.",
    });
  }
  const validUntil = validDate(proposal.validUntil, "validUntil");
  if (normalizedExpiredAt.getTime() < validUntil.getTime()) {
    throw new ItineraryProposalValidationError("A validade da Itinerary Proposal não terminou.", {
      expiredAt: "O instante de expiração deve alcançar ou ultrapassar validUntil.",
    });
  }

  return Object.freeze({
    ...proposal,
    status: "expired",
    expiredAt: new Date(normalizedExpiredAt.getTime()),
    updatedAt: new Date(normalizedExpiredAt.getTime()),
  });
}

export function rejectItineraryProposal(
  proposal: ItineraryProposal,
  rejectedAt: Date,
): ItineraryProposal {
  assertStatus(proposal, ["ready"], "rejected");
  const normalizedRejectedAt = transitionDate(proposal, rejectedAt);

  return Object.freeze({
    ...proposal,
    status: "rejected",
    rejectedAt: new Date(normalizedRejectedAt.getTime()),
    updatedAt: new Date(normalizedRejectedAt.getTime()),
  });
}

export function finalizeAppliedItineraryProposalAcceptance(
  proposal: ItineraryProposal,
  acceptedAt: Date,
): ItineraryProposal {
  assertStatus(proposal, ["ready"], "accepted");
  const normalizedAcceptedAt = transitionDate(proposal, acceptedAt);
  if (!proposal.validUntil) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      validUntil: "A Proposal pronta deve possuir validade temporal.",
    });
  }
  const validUntil = validDate(proposal.validUntil, "validUntil");
  if (normalizedAcceptedAt.getTime() >= validUntil.getTime()) {
    throw new ItineraryProposalValidationError("A Itinerary Proposal não está mais válida.", {
      acceptedAt: "O aceite deve ser finalizado antes de validUntil.",
    });
  }

  return Object.freeze({
    ...proposal,
    status: "accepted",
    acceptedAt: new Date(normalizedAcceptedAt.getTime()),
    updatedAt: new Date(normalizedAcceptedAt.getTime()),
  });
}

export function failItineraryProposalGeneration(
  proposal: ItineraryProposal,
  failureCode: string,
  failedAt: Date,
): ItineraryProposal {
  assertStatus(proposal, ["generating"], "failed");
  const normalizedFailureCode = requiredText(failureCode, "failureCode");
  const normalizedFailedAt = transitionDate(proposal, failedAt);

  return Object.freeze({
    ...proposal,
    status: "failed",
    failureCode: normalizedFailureCode,
    failedAt: normalizedFailedAt,
    updatedAt: new Date(normalizedFailedAt.getTime()),
  });
}

export function cancelItineraryProposalGeneration(
  proposal: ItineraryProposal,
  cancelledAt: Date,
): ItineraryProposal {
  assertStatus(proposal, ["requested", "generating"], "cancelled");
  const normalizedCancelledAt = transitionDate(proposal, cancelledAt);

  return Object.freeze({
    ...proposal,
    status: "cancelled",
    cancelledAt: normalizedCancelledAt,
    updatedAt: new Date(normalizedCancelledAt.getTime()),
  });
}
