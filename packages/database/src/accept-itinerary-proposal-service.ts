import {
  AcceptItineraryProposalError,
  createAcceptItineraryProposal,
  type AcceptItineraryProposal,
  type AcceptItineraryProposalCommand,
  type AcceptItineraryProposalResult,
  type ApplyItineraryProposalTransaction,
} from "@routebook/proposal-management";
import { ApplyProposalItemsDomainError } from "@routebook/trip-management";

import { createPostgresApplyItineraryProposalTransaction } from "./apply-itinerary-proposal-transaction";

export type ApplyItineraryProposalTransactionFactory = () => ApplyItineraryProposalTransaction;

type PostgreSqlError = Readonly<{
  code: string;
  constraint?: string;
}>;

const proposalForeignKeyConstraints = new Set([
  "proposal_applications_itinerary_proposal_id_fkey",
  "itinerary_proposals_pkey",
]);

const itineraryForeignKeyConstraints = new Set([
  "proposal_applications_itinerary_id_fkey",
  "itinerary_proposals_itinerary_id_fkey",
]);

const idempotencyUniqueConstraints = new Set([
  "proposal_applications_proposal_idempotency_unique",
]);

function publicError(
  code: ConstructorParameters<typeof AcceptItineraryProposalError>[0],
  message: string,
): never {
  throw new AcceptItineraryProposalError(code, message);
}

function mapApplyProposalItemsDomainError(error: ApplyProposalItemsDomainError): never {
  switch (error.code) {
    case "itinerary-version-mismatch":
      return publicError(
        "itinerary-version-mismatch",
        "A versão atual do Itinerary diverge da versão esperada pela Proposal.",
      );
    case "trip-mismatch":
    case "itinerary-mismatch":
      return publicError(
        "itinerary-not-found",
        "O Itinerary não pertence ao contexto solicitado.",
      );
    case "duplicate-proposed-activity-id":
    case "duplicate-source-activity-id":
    case "target-trip-day-not-found":
    case "source-activity-not-found":
    case "fixed-activity-protected":
    case "target-order-out-of-range":
    case "generated-activity-id-invalid":
    case "generated-activity-id-duplicate":
      return publicError(
        "proposal-items-mismatch",
        "Os itens da Itinerary Proposal não podem ser aplicados ao Itinerary atual.",
      );
    case "application-time-invalid":
      throw error;
  }
}

function postgresError(error: unknown): PostgreSqlError | null {
  let current = error;
  const visited = new Set<unknown>();

  while (current && typeof current === "object" && !visited.has(current)) {
    visited.add(current);
    const candidate = current as {
      code?: unknown;
      constraint?: unknown;
      cause?: unknown;
    };
    if (typeof candidate.code === "string") {
      return {
        code: candidate.code,
        ...(typeof candidate.constraint === "string"
          ? { constraint: candidate.constraint }
          : {}),
      };
    }
    current = candidate.cause;
  }

  return null;
}

function mapPostgreSqlError(error: unknown): never {
  const postgres = postgresError(error);
  if (!postgres) throw error;

  if (
    postgres.code === "23505" &&
    postgres.constraint !== undefined &&
    idempotencyUniqueConstraints.has(postgres.constraint)
  ) {
    return publicError(
      "fingerprint-conflict",
      "A idempotency key já foi usada com outro conteúdo de aceite.",
    );
  }

  if (postgres.code === "23503" && postgres.constraint !== undefined) {
    if (proposalForeignKeyConstraints.has(postgres.constraint)) {
      return publicError("proposal-not-found", "A Itinerary Proposal não foi encontrada.");
    }
    if (itineraryForeignKeyConstraints.has(postgres.constraint)) {
      return publicError("itinerary-not-found", "O Itinerary não foi encontrado.");
    }
  }

  throw error;
}

function mapTransactionError(error: unknown): never {
  if (error instanceof AcceptItineraryProposalError) throw error;
  if (error instanceof ApplyProposalItemsDomainError) {
    return mapApplyProposalItemsDomainError(error);
  }
  return mapPostgreSqlError(error);
}

function withOfficialErrorMapping(
  transaction: ApplyItineraryProposalTransaction,
): ApplyItineraryProposalTransaction {
  if (!transaction || typeof transaction.execute !== "function") {
    throw new TypeError("A factory não retornou um ApplyItineraryProposalTransaction válido.");
  }

  return Object.freeze({
    async execute(
      command: AcceptItineraryProposalCommand,
    ): Promise<AcceptItineraryProposalResult> {
      try {
        return await transaction.execute(command);
      } catch (error) {
        return mapTransactionError(error);
      }
    },
  });
}

export function createPostgresAcceptItineraryProposal(
  transactionFactory: ApplyItineraryProposalTransactionFactory =
    createPostgresApplyItineraryProposalTransaction,
): AcceptItineraryProposal {
  if (typeof transactionFactory !== "function") {
    throw new TypeError("Informe uma factory de ApplyItineraryProposalTransaction válida.");
  }

  return createAcceptItineraryProposal(withOfficialErrorMapping(transactionFactory()));
}
