import {
  failProposalApplication,
  startProposalApplication,
  succeedProposalApplication,
  type FailedProposalApplication,
  type FailProposalApplicationInput,
  type ProposalApplication,
  type ProposalApplicationRequestFingerprintInput,
  type StartedProposalApplication,
  type SucceededProposalApplication,
  type SucceedProposalApplicationInput,
} from "@routebook/proposal-management";

import {
  createPostgresProposalApplicationRepository,
  type PostgresProposalApplicationRepository,
  type ProposalApplicationPersistenceRecord,
  type ProposalApplicationSqlExecutor,
} from "./proposal-application-repository";

export type ProposalApplicationTransactionRecord<
  TApplication extends ProposalApplication = ProposalApplication,
> = Omit<ProposalApplicationPersistenceRecord, "application"> &
  Readonly<{
    application: TApplication;
  }>;

export type ReserveProposalApplicationInput = ProposalApplicationRequestFingerprintInput &
  Readonly<{
    tripId: string;
    idempotencyKey: string;
    startedAt: Date;
    applicationId?: string;
  }>;

export type ReservedProposalApplication = Readonly<{
  kind: "reserved";
  record: ProposalApplicationTransactionRecord<StartedProposalApplication>;
}>;

export type ReplayedProposalApplication = Readonly<{
  kind: "replay";
  record: ProposalApplicationTransactionRecord<SucceededProposalApplication>;
}>;

export type ConflictingProposalApplication = Readonly<{
  kind: "fingerprint-conflict";
  record: ProposalApplicationTransactionRecord;
}>;

export type InProgressProposalApplication = Readonly<{
  kind: "application-in-progress";
  record: ProposalApplicationTransactionRecord<StartedProposalApplication>;
}>;

export type PreviouslyFailedProposalApplication = Readonly<{
  kind: "application-failed";
  record: ProposalApplicationTransactionRecord<FailedProposalApplication>;
}>;

export type ReserveProposalApplicationResult =
  | ReservedProposalApplication
  | ReplayedProposalApplication
  | ConflictingProposalApplication
  | InProgressProposalApplication
  | PreviouslyFailedProposalApplication;

export type ProposalApplicationTransactionRepository = Pick<
  PostgresProposalApplicationRepository,
  "create" | "saveTerminal"
>;

export type ProposalApplicationTransactionRepositoryFactory<
  TExecutor extends ProposalApplicationSqlExecutor = ProposalApplicationSqlExecutor,
> = (executor: TExecutor) => ProposalApplicationTransactionRepository;

export interface ProposalApplicationTransactionFragment {
  reserve(input: ReserveProposalApplicationInput): Promise<ReserveProposalApplicationResult>;
  succeed(
    record: ProposalApplicationTransactionRecord<StartedProposalApplication>,
    input: SucceedProposalApplicationInput,
  ): Promise<ProposalApplicationTransactionRecord<SucceededProposalApplication>>;
  fail(
    record: ProposalApplicationTransactionRecord<StartedProposalApplication>,
    input: FailProposalApplicationInput,
  ): Promise<ProposalApplicationTransactionRecord<FailedProposalApplication>>;
}

export class ProposalApplicationTransactionFragmentValidationError extends Error {
  constructor(readonly fieldErrors: Readonly<Record<string, string>>) {
    super("O fragment transacional de Proposal Application recebeu dados inválidos.");
    this.name = "ProposalApplicationTransactionFragmentValidationError";
  }
}

function invalid(field: string, message: string): never {
  throw new ProposalApplicationTransactionFragmentValidationError({ [field]: message });
}

function requiredText(value: unknown, field: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) invalid(field, "Informe um valor não vazio.");
  return normalized;
}

function createRequest(
  input: ReserveProposalApplicationInput,
  application: StartedProposalApplication,
): ProposalApplicationRequestFingerprintInput {
  return Object.freeze({
    itineraryProposalId: application.itineraryProposalId,
    itineraryId: requiredText(input.itineraryId, "itineraryId"),
    applicationType: application.applicationType,
    expectedItineraryVersion: application.expectedItineraryVersion,
    actorType: application.actorType,
    ...(application.actorId !== undefined ? { actorId: application.actorId } : {}),
    proposedActivityIds: Object.freeze(input.proposedActivityIds.map((value) => value.trim())),
  });
}

function createStartedRecord(
  input: ReserveProposalApplicationInput,
): ProposalApplicationTransactionRecord<StartedProposalApplication> {
  if (!input || typeof input !== "object") {
    invalid("reservation", "Informe os dados da reserva.");
  }

  const application = startProposalApplication({
    itineraryProposalId: input.itineraryProposalId,
    itineraryId: input.itineraryId,
    applicationType: input.applicationType,
    expectedItineraryVersion: input.expectedItineraryVersion,
    actorType: input.actorType,
    ...(input.actorId !== undefined ? { actorId: input.actorId } : {}),
    proposedActivityIds: input.proposedActivityIds,
    ...(input.applicationId !== undefined ? { id: input.applicationId } : {}),
    idempotencyKey: input.idempotencyKey,
    startedAt: input.startedAt,
  });

  return Object.freeze({
    tripId: requiredText(input.tripId, "tripId"),
    itineraryId: requiredText(input.itineraryId, "itineraryId"),
    request: createRequest(input, application),
    application,
  });
}

function withApplication<TApplication extends ProposalApplication>(
  record: ProposalApplicationTransactionRecord,
  application: TApplication,
): ProposalApplicationTransactionRecord<TApplication> {
  if (!record || typeof record !== "object") {
    invalid("record", "Informe o record canônico da Proposal Application.");
  }

  return Object.freeze({
    tripId: requiredText(record.tripId, "record.tripId"),
    itineraryId: requiredText(record.itineraryId, "record.itineraryId"),
    request: record.request,
    application,
  });
}

function classifyReplay(
  record: ProposalApplicationPersistenceRecord,
): Exclude<ReserveProposalApplicationResult, ReservedProposalApplication | ConflictingProposalApplication> {
  switch (record.application.status) {
    case "started":
      return Object.freeze({
        kind: "application-in-progress",
        record: record as ProposalApplicationTransactionRecord<StartedProposalApplication>,
      });
    case "succeeded":
      return Object.freeze({
        kind: "replay",
        record: record as ProposalApplicationTransactionRecord<SucceededProposalApplication>,
      });
    case "failed":
      return Object.freeze({
        kind: "application-failed",
        record: record as ProposalApplicationTransactionRecord<FailedProposalApplication>,
      });
  }
}

export function createProposalApplicationTransactionFragment<
  TExecutor extends ProposalApplicationSqlExecutor,
>(
  executor: TExecutor,
  repositoryFactory: ProposalApplicationTransactionRepositoryFactory<TExecutor> =
    createPostgresProposalApplicationRepository,
): ProposalApplicationTransactionFragment {
  if (!executor || typeof executor.execute !== "function") {
    throw new TypeError("Informe um executor SQL transacional válido.");
  }
  if (typeof repositoryFactory !== "function") {
    throw new TypeError("Informe uma factory de repository de Proposal Application válida.");
  }

  const repository = repositoryFactory(executor);
  if (
    !repository ||
    typeof repository.create !== "function" ||
    typeof repository.saveTerminal !== "function"
  ) {
    throw new TypeError("A factory não retornou um repository de Proposal Application válido.");
  }

  return Object.freeze({
    async reserve(input) {
      const attemptedRecord = createStartedRecord(input);
      const result = await repository.create(attemptedRecord);

      if (result.kind === "created") {
        return Object.freeze({
          kind: "reserved",
          record: result.record as ProposalApplicationTransactionRecord<StartedProposalApplication>,
        });
      }
      if (result.kind === "fingerprint-conflict") {
        return Object.freeze({
          kind: "fingerprint-conflict",
          record: result.record,
        });
      }
      return classifyReplay(result.record);
    },

    async succeed(record, input) {
      const application = succeedProposalApplication(record.application, input);
      const terminalRecord = withApplication(record, application);
      await repository.saveTerminal(terminalRecord);
      return terminalRecord;
    },

    async fail(record, input) {
      const application = failProposalApplication(record.application, input);
      const terminalRecord = withApplication(record, application);
      await repository.saveTerminal(terminalRecord);
      return terminalRecord;
    },
  });
}
