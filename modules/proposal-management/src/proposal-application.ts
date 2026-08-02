import { createHash, randomUUID } from "node:crypto";

const proposalApplicationIdBrand: unique symbol = Symbol("ProposalApplicationId");

export type ProposalApplicationId = string & {
  readonly [proposalApplicationIdBrand]: true;
};

export const proposalApplicationTypes = ["full", "partial"] as const;

export type ProposalApplicationType = (typeof proposalApplicationTypes)[number];

export const proposalApplicationStatuses = ["started", "succeeded", "failed"] as const;

export type ProposalApplicationStatus = (typeof proposalApplicationStatuses)[number];

export const proposalApplicationRequestFingerprintSchemaVersion = 1 as const;

export type ProposalApplicationRequestFingerprintInput = Readonly<{
  itineraryProposalId: string;
  itineraryId: string;
  applicationType: ProposalApplicationType;
  expectedItineraryVersion: number;
  actorType: string;
  actorId?: string;
  proposedActivityIds: readonly string[];
}>;

type ProposalApplicationBase = Readonly<{
  id: ProposalApplicationId;
  itineraryProposalId: string;
  idempotencyKey: string;
  requestFingerprint: string;
  applicationType: ProposalApplicationType;
  expectedItineraryVersion: number;
  actorType: string;
  actorId?: string;
  startedAt: Date;
}>;

export type StartedProposalApplication = ProposalApplicationBase &
  Readonly<{
    status: "started";
  }>;

export type SucceededProposalApplication = ProposalApplicationBase &
  Readonly<{
    status: "succeeded";
    resultingItineraryVersion: number;
    completedAt: Date;
  }>;

export type FailedProposalApplication = ProposalApplicationBase &
  Readonly<{
    status: "failed";
    completedAt: Date;
    failureCode: string;
  }>;

export type ProposalApplication =
  StartedProposalApplication | SucceededProposalApplication | FailedProposalApplication;

export type StartProposalApplicationInput = ProposalApplicationRequestFingerprintInput &
  Readonly<{
    id?: string;
    idempotencyKey: string;
    startedAt: Date;
  }>;

export type SucceedProposalApplicationInput = Readonly<{
  resultingItineraryVersion: number;
  completedAt: Date;
}>;

export type FailProposalApplicationInput = Readonly<{
  failureCode: string;
  completedAt: Date;
}>;

export class ProposalApplicationValidationError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Readonly<Record<string, string>>,
  ) {
    super(message);
    this.name = "ProposalApplicationValidationError";
  }
}

export class ProposalApplicationTransitionError extends Error {
  constructor(
    message: string,
    readonly currentStatus: ProposalApplicationStatus,
    readonly attemptedStatus: Exclude<ProposalApplicationStatus, "started">,
  ) {
    super(message);
    this.name = "ProposalApplicationTransitionError";
  }
}

function invalid(field: string, message: string): never {
  throw new ProposalApplicationValidationError("Proposal Application inválida.", {
    [field]: message,
  });
}

function requiredText(value: string, field: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    invalid(field, "Informe um valor não vazio.");
  }
  return normalized;
}

function optionalText(value: string | undefined, field: string): string | undefined {
  return value === undefined ? undefined : requiredText(value, field);
}

function positiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 1) {
    invalid(field, "Use um inteiro positivo.");
  }
  return value;
}

function validDate(value: Date, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    invalid(field, "Informe uma data válida.");
  }
  return new Date(value.getTime());
}

function normalizeApplicationType(value: ProposalApplicationType): ProposalApplicationType {
  if (!proposalApplicationTypes.includes(value)) {
    invalid("applicationType", "Use full ou partial.");
  }
  return value;
}

function normalizeProposedActivityIds(values: readonly string[]): readonly string[] {
  if (!Array.isArray(values)) {
    invalid("proposedActivityIds", "Informe uma coleção de Proposed Activity IDs.");
  }

  const normalized = values.map((value, index) =>
    requiredText(value, `proposedActivityIds.${index}`),
  );
  const firstIndexById = new Map<string, number>();

  normalized.forEach((value, index) => {
    const firstIndex = firstIndexById.get(value);
    if (firstIndex !== undefined) {
      invalid(
        `proposedActivityIds.${index}`,
        `Não repita o Proposed Activity ID já informado na posição ${firstIndex}.`,
      );
    }
    firstIndexById.set(value, index);
  });

  return Object.freeze(normalized);
}

function normalizeFingerprintInput(
  input: ProposalApplicationRequestFingerprintInput,
): ProposalApplicationRequestFingerprintInput {
  if (!input || typeof input !== "object") {
    invalid("request", "Informe os dados da solicitação de aplicação.");
  }

  const actorId = optionalText(input.actorId, "actorId");

  return Object.freeze({
    itineraryProposalId: requiredText(input.itineraryProposalId, "itineraryProposalId"),
    itineraryId: requiredText(input.itineraryId, "itineraryId"),
    applicationType: normalizeApplicationType(input.applicationType),
    expectedItineraryVersion: positiveInteger(
      input.expectedItineraryVersion,
      "expectedItineraryVersion",
    ),
    actorType: requiredText(input.actorType, "actorType"),
    ...(actorId !== undefined ? { actorId } : {}),
    proposedActivityIds: normalizeProposedActivityIds(input.proposedActivityIds),
  });
}

function hashFingerprintInput(input: ProposalApplicationRequestFingerprintInput): string {
  const canonicalPayload = [
    proposalApplicationRequestFingerprintSchemaVersion,
    input.itineraryProposalId,
    input.itineraryId,
    input.applicationType,
    input.expectedItineraryVersion,
    input.actorType,
    input.actorId ?? null,
    input.proposedActivityIds,
  ] as const;

  return createHash("sha256").update(JSON.stringify(canonicalPayload)).digest("hex");
}

function copyBase(application: ProposalApplication): ProposalApplicationBase {
  return {
    id: application.id,
    itineraryProposalId: application.itineraryProposalId,
    idempotencyKey: application.idempotencyKey,
    requestFingerprint: application.requestFingerprint,
    applicationType: application.applicationType,
    expectedItineraryVersion: application.expectedItineraryVersion,
    actorType: application.actorType,
    ...(application.actorId !== undefined ? { actorId: application.actorId } : {}),
    startedAt: new Date(application.startedAt.getTime()),
  };
}

function validCompletionDate(application: ProposalApplication, value: Date): Date {
  const completedAt = validDate(value, "completedAt");
  if (completedAt.getTime() < application.startedAt.getTime()) {
    invalid("completedAt", "A conclusão não pode ocorrer antes do início.");
  }
  return completedAt;
}

function assertStarted(
  application: ProposalApplication,
  attemptedStatus: Exclude<ProposalApplicationStatus, "started">,
): asserts application is StartedProposalApplication {
  if (application.status !== "started") {
    throw new ProposalApplicationTransitionError(
      `Proposal Application ${application.status} não pode transicionar para ${attemptedStatus}.`,
      application.status,
      attemptedStatus,
    );
  }
}

export function createProposalApplicationId(value = randomUUID()): ProposalApplicationId {
  return requiredText(value, "id") as ProposalApplicationId;
}

export function createProposalApplicationRequestFingerprint(
  input: ProposalApplicationRequestFingerprintInput,
): string {
  return hashFingerprintInput(normalizeFingerprintInput(input));
}

export function startProposalApplication(
  input: StartProposalApplicationInput,
): StartedProposalApplication {
  if (!input || typeof input !== "object") {
    invalid("application", "Informe os dados da Proposal Application.");
  }

  const normalizedRequest = normalizeFingerprintInput(input);

  return Object.freeze({
    id: createProposalApplicationId(input.id),
    itineraryProposalId: normalizedRequest.itineraryProposalId,
    idempotencyKey: requiredText(input.idempotencyKey, "idempotencyKey"),
    requestFingerprint: hashFingerprintInput(normalizedRequest),
    applicationType: normalizedRequest.applicationType,
    expectedItineraryVersion: normalizedRequest.expectedItineraryVersion,
    actorType: normalizedRequest.actorType,
    ...(normalizedRequest.actorId !== undefined ? { actorId: normalizedRequest.actorId } : {}),
    startedAt: validDate(input.startedAt, "startedAt"),
    status: "started",
  });
}

export function succeedProposalApplication(
  application: ProposalApplication,
  input: SucceedProposalApplicationInput,
): SucceededProposalApplication {
  assertStarted(application, "succeeded");
  const completedAt = validCompletionDate(application, input.completedAt);

  return Object.freeze({
    ...copyBase(application),
    status: "succeeded",
    resultingItineraryVersion: positiveInteger(
      input.resultingItineraryVersion,
      "resultingItineraryVersion",
    ),
    completedAt,
  });
}

export function failProposalApplication(
  application: ProposalApplication,
  input: FailProposalApplicationInput,
): FailedProposalApplication {
  assertStarted(application, "failed");
  const completedAt = validCompletionDate(application, input.completedAt);

  return Object.freeze({
    ...copyBase(application),
    status: "failed",
    completedAt,
    failureCode: requiredText(input.failureCode, "failureCode"),
  });
}
