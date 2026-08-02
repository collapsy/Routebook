import { sql, type SQL } from "drizzle-orm";

import {
  createProposalApplicationRequestFingerprint,
  failProposalApplication,
  startProposalApplication,
  succeedProposalApplication,
  type ProposalApplication,
  type ProposalApplicationId,
  type ProposalApplicationRequestFingerprintInput,
} from "@routebook/proposal-management";

export type ProposalApplicationPersistenceRecord = Readonly<{
  tripId: string;
  itineraryId: string;
  request: ProposalApplicationRequestFingerprintInput;
  application: ProposalApplication;
}>;

export type CreateProposalApplicationPersistenceResult =
  | Readonly<{
      kind: "created";
      record: ProposalApplicationPersistenceRecord;
    }>
  | Readonly<{
      kind: "replay";
      record: ProposalApplicationPersistenceRecord;
    }>
  | Readonly<{
      kind: "fingerprint-conflict";
      record: ProposalApplicationPersistenceRecord;
    }>;

export interface ProposalApplicationSqlExecutor {
  execute(query: SQL): Promise<unknown>;
}

export interface PostgresProposalApplicationRepository {
  create(
    record: ProposalApplicationPersistenceRecord,
  ): Promise<CreateProposalApplicationPersistenceResult>;
  findById(
    id: ProposalApplicationId | string,
  ): Promise<ProposalApplicationPersistenceRecord | null>;
  findByIdempotencyKey(
    itineraryProposalId: string,
    idempotencyKey: string,
  ): Promise<ProposalApplicationPersistenceRecord | null>;
  saveTerminal(record: ProposalApplicationPersistenceRecord): Promise<void>;
}

export class ProposalApplicationPersistenceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProposalApplicationPersistenceValidationError";
  }
}

export class ProposalApplicationPersistenceCorruptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProposalApplicationPersistenceCorruptionError";
  }
}

export class ProposalApplicationPersistenceConcurrencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProposalApplicationPersistenceConcurrencyError";
  }
}

type ProposalApplicationRow = Readonly<{
  id: string;
  tripId: string;
  itineraryId: string;
  itineraryProposalId: string;
  idempotencyKey: string;
  requestFingerprint: string;
  requestPayload: unknown;
  applicationType: string;
  status: string;
  expectedItineraryVersion: number;
  resultingItineraryVersion: number | null;
  actorType: string;
  actorId: string | null;
  startedAt: Date | string;
  completedAt: Date | string | null;
  failureCode: string | null;
}>;

function requiredText(value: unknown, field: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    throw new ProposalApplicationPersistenceValidationError(
      `O campo ${field} da Proposal Application persistida é obrigatório.`,
    );
  }
  return normalized;
}

function positiveInteger(value: unknown, field: string): number {
  const normalized = typeof value === "string" ? Number(value) : value;
  if (!Number.isInteger(normalized) || (normalized as number) < 1) {
    throw new ProposalApplicationPersistenceCorruptionError(
      `O campo ${field} da Proposal Application persistida deve ser um inteiro positivo.`,
    );
  }
  return normalized as number;
}

function validDate(value: unknown, field: string): Date {
  const normalized = value instanceof Date ? new Date(value.getTime()) : new Date(String(value));
  if (Number.isNaN(normalized.getTime())) {
    throw new ProposalApplicationPersistenceCorruptionError(
      `O campo ${field} da Proposal Application persistida contém uma data inválida.`,
    );
  }
  return normalized;
}

function nullableDate(value: unknown, field: string): Date | null {
  return value === null || value === undefined ? null : validDate(value, field);
}

function resultRows(result: unknown): readonly Record<string, unknown>[] {
  if (Array.isArray(result)) return result as readonly Record<string, unknown>[];
  if (result && typeof result === "object") {
    const rows = (result as { rows?: unknown }).rows;
    if (Array.isArray(rows)) return rows as readonly Record<string, unknown>[];
  }
  return [];
}

function parseRequestPayload(value: unknown): ProposalApplicationRequestFingerprintInput {
  let payload = value;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload) as unknown;
    } catch {
      throw new ProposalApplicationPersistenceCorruptionError(
        "O request_payload da Proposal Application não contém JSON válido.",
      );
    }
  }
  if (!payload || typeof payload !== "object") {
    throw new ProposalApplicationPersistenceCorruptionError(
      "O request_payload da Proposal Application é inválido.",
    );
  }

  const candidate = payload as Record<string, unknown>;
  if (!Array.isArray(candidate.proposedActivityIds)) {
    throw new ProposalApplicationPersistenceCorruptionError(
      "O request_payload da Proposal Application não contém Proposed Activity IDs válidos.",
    );
  }

  return {
    itineraryProposalId: requiredText(candidate.itineraryProposalId, "request.itineraryProposalId"),
    itineraryId: requiredText(candidate.itineraryId, "request.itineraryId"),
    applicationType: requiredText(candidate.applicationType, "request.applicationType") as
      "full" | "partial",
    expectedItineraryVersion: positiveInteger(
      candidate.expectedItineraryVersion,
      "request.expectedItineraryVersion",
    ),
    actorType: requiredText(candidate.actorType, "request.actorType"),
    ...(candidate.actorId === undefined || candidate.actorId === null
      ? {}
      : { actorId: requiredText(candidate.actorId, "request.actorId") }),
    proposedActivityIds: candidate.proposedActivityIds.map((item, index) =>
      requiredText(item, `request.proposedActivityIds.${index}`),
    ),
  };
}

function normalizeRow(value: Record<string, unknown>): ProposalApplicationRow {
  return {
    id: requiredText(value.id, "id"),
    tripId: requiredText(value.tripId, "tripId"),
    itineraryId: requiredText(value.itineraryId, "itineraryId"),
    itineraryProposalId: requiredText(value.itineraryProposalId, "itineraryProposalId"),
    idempotencyKey: requiredText(value.idempotencyKey, "idempotencyKey"),
    requestFingerprint: requiredText(value.requestFingerprint, "requestFingerprint"),
    requestPayload: value.requestPayload,
    applicationType: requiredText(value.applicationType, "applicationType"),
    status: requiredText(value.status, "status"),
    expectedItineraryVersion: positiveInteger(
      value.expectedItineraryVersion,
      "expectedItineraryVersion",
    ),
    resultingItineraryVersion:
      value.resultingItineraryVersion === null || value.resultingItineraryVersion === undefined
        ? null
        : positiveInteger(value.resultingItineraryVersion, "resultingItineraryVersion"),
    actorType: requiredText(value.actorType, "actorType"),
    actorId:
      value.actorId === null || value.actorId === undefined
        ? null
        : requiredText(value.actorId, "actorId"),
    startedAt: validDate(value.startedAt, "startedAt"),
    completedAt: nullableDate(value.completedAt, "completedAt"),
    failureCode:
      value.failureCode === null || value.failureCode === undefined
        ? null
        : requiredText(value.failureCode, "failureCode"),
  };
}

function rehydrateRecord(value: Record<string, unknown>): ProposalApplicationPersistenceRecord {
  const row = normalizeRow(value);
  const request = parseRequestPayload(row.requestPayload);
  const computedFingerprint = createProposalApplicationRequestFingerprint(request);

  if (request.itineraryProposalId !== row.itineraryProposalId) {
    throw new ProposalApplicationPersistenceCorruptionError(
      "O request_payload não corresponde à Itinerary Proposal persistida.",
    );
  }
  if (request.itineraryId !== row.itineraryId) {
    throw new ProposalApplicationPersistenceCorruptionError(
      "O request_payload não corresponde ao Itinerary persistido.",
    );
  }
  if (request.applicationType !== row.applicationType) {
    throw new ProposalApplicationPersistenceCorruptionError(
      "O request_payload não corresponde ao tipo de aplicação persistido.",
    );
  }
  if (request.expectedItineraryVersion !== row.expectedItineraryVersion) {
    throw new ProposalApplicationPersistenceCorruptionError(
      "O request_payload não corresponde à versão esperada persistida.",
    );
  }
  if (request.actorType !== row.actorType || (request.actorId ?? null) !== row.actorId) {
    throw new ProposalApplicationPersistenceCorruptionError(
      "O request_payload não corresponde ao ator persistido.",
    );
  }
  if (computedFingerprint !== row.requestFingerprint) {
    throw new ProposalApplicationPersistenceCorruptionError(
      "O fingerprint persistido não corresponde ao request_payload canônico.",
    );
  }

  const started = startProposalApplication({
    ...request,
    id: row.id,
    idempotencyKey: row.idempotencyKey,
    startedAt: validDate(row.startedAt, "startedAt"),
  });

  let application: ProposalApplication;
  if (row.status === "started") {
    if (
      row.completedAt !== null ||
      row.resultingItineraryVersion !== null ||
      row.failureCode !== null
    ) {
      throw new ProposalApplicationPersistenceCorruptionError(
        "Uma Proposal Application started não pode possuir resultado terminal.",
      );
    }
    application = started;
  } else if (row.status === "succeeded") {
    if (
      row.completedAt === null ||
      row.resultingItineraryVersion === null ||
      row.failureCode !== null
    ) {
      throw new ProposalApplicationPersistenceCorruptionError(
        "Uma Proposal Application succeeded precisa de versão resultante e conclusão.",
      );
    }
    application = succeedProposalApplication(started, {
      resultingItineraryVersion: row.resultingItineraryVersion,
      completedAt: validDate(row.completedAt, "completedAt"),
    });
  } else if (row.status === "failed") {
    if (
      row.completedAt === null ||
      row.failureCode === null ||
      row.resultingItineraryVersion !== null
    ) {
      throw new ProposalApplicationPersistenceCorruptionError(
        "Uma Proposal Application failed precisa de código e conclusão sem versão resultante.",
      );
    }
    application = failProposalApplication(started, {
      failureCode: row.failureCode,
      completedAt: validDate(row.completedAt, "completedAt"),
    });
  } else {
    throw new ProposalApplicationPersistenceCorruptionError(
      `Status de Proposal Application desconhecido: ${row.status}.`,
    );
  }

  return Object.freeze({
    tripId: row.tripId,
    itineraryId: row.itineraryId,
    request: Object.freeze({
      ...request,
      proposedActivityIds: Object.freeze([...request.proposedActivityIds]),
    }),
    application,
  });
}

const returningColumns = sql`
  id::text AS "id",
  trip_id::text AS "tripId",
  itinerary_id::text AS "itineraryId",
  itinerary_proposal_id::text AS "itineraryProposalId",
  idempotency_key AS "idempotencyKey",
  request_fingerprint AS "requestFingerprint",
  request_payload AS "requestPayload",
  application_type AS "applicationType",
  status,
  expected_itinerary_version AS "expectedItineraryVersion",
  resulting_itinerary_version AS "resultingItineraryVersion",
  actor_type AS "actorType",
  actor_id AS "actorId",
  started_at AS "startedAt",
  completed_at AS "completedAt",
  failure_code AS "failureCode"
`;

function validateRecord(record: ProposalApplicationPersistenceRecord): void {
  requiredText(record.tripId, "tripId");
  const itineraryId = requiredText(record.itineraryId, "itineraryId");
  const fingerprint = createProposalApplicationRequestFingerprint(record.request);

  if (record.request.itineraryId.trim() !== itineraryId) {
    throw new ProposalApplicationPersistenceValidationError(
      "O Itinerary do request não corresponde ao contexto persistido.",
    );
  }
  if (record.request.itineraryProposalId.trim() !== record.application.itineraryProposalId) {
    throw new ProposalApplicationPersistenceValidationError(
      "A Itinerary Proposal do request não corresponde à aplicação.",
    );
  }
  if (fingerprint !== record.application.requestFingerprint) {
    throw new ProposalApplicationPersistenceValidationError(
      "O request não corresponde ao fingerprint da aplicação.",
    );
  }
}

async function firstRow(
  executor: ProposalApplicationSqlExecutor,
  query: SQL,
): Promise<Record<string, unknown> | null> {
  const rows = resultRows(await executor.execute(query));
  return rows[0] ?? null;
}

export function createPostgresProposalApplicationRepository(
  executor: ProposalApplicationSqlExecutor,
): PostgresProposalApplicationRepository {
  async function findById(
    id: ProposalApplicationId | string,
  ): Promise<ProposalApplicationPersistenceRecord | null> {
    const normalizedId = requiredText(id, "id");
    const row = await firstRow(
      executor,
      sql`
        SELECT ${returningColumns}
        FROM proposal_applications
        WHERE id = ${normalizedId}::uuid
        LIMIT 1
      `,
    );
    return row === null ? null : rehydrateRecord(row);
  }

  async function findByIdempotencyKey(
    itineraryProposalId: string,
    idempotencyKey: string,
  ): Promise<ProposalApplicationPersistenceRecord | null> {
    const normalizedProposalId = requiredText(itineraryProposalId, "itineraryProposalId");
    const normalizedKey = requiredText(idempotencyKey, "idempotencyKey");
    const row = await firstRow(
      executor,
      sql`
        SELECT ${returningColumns}
        FROM proposal_applications
        WHERE itinerary_proposal_id = ${normalizedProposalId}::uuid
          AND idempotency_key = ${normalizedKey}
        LIMIT 1
      `,
    );
    return row === null ? null : rehydrateRecord(row);
  }

  return {
    async create(record) {
      validateRecord(record);
      const { application, request } = record;
      if (application.status !== "started") {
        throw new ProposalApplicationPersistenceValidationError(
          "Somente uma Proposal Application started pode ser criada.",
        );
      }

      const inserted = await firstRow(
        executor,
        sql`
          INSERT INTO proposal_applications (
            id,
            trip_id,
            itinerary_id,
            itinerary_proposal_id,
            idempotency_key,
            request_fingerprint,
            request_payload,
            application_type,
            status,
            expected_itinerary_version,
            actor_type,
            actor_id,
            started_at,
            created_at,
            updated_at
          ) VALUES (
            ${application.id}::uuid,
            ${record.tripId.trim()}::uuid,
            ${record.itineraryId.trim()}::uuid,
            ${application.itineraryProposalId}::uuid,
            ${application.idempotencyKey},
            ${application.requestFingerprint},
            ${JSON.stringify(request)}::jsonb,
            ${application.applicationType},
            ${application.status},
            ${application.expectedItineraryVersion},
            ${application.actorType},
            ${application.actorId ?? null},
            ${application.startedAt},
            ${application.startedAt},
            ${application.startedAt}
          )
          ON CONFLICT (itinerary_proposal_id, idempotency_key) DO NOTHING
          RETURNING ${returningColumns}
        `,
      );

      if (inserted !== null) {
        return Object.freeze({ kind: "created", record: rehydrateRecord(inserted) });
      }

      const existing = await findByIdempotencyKey(
        application.itineraryProposalId,
        application.idempotencyKey,
      );
      if (existing === null) {
        throw new ProposalApplicationPersistenceConcurrencyError(
          "A chave idempotente entrou em conflito, mas a tentativa canônica não pôde ser carregada.",
        );
      }

      return Object.freeze({
        kind:
          existing.application.requestFingerprint === application.requestFingerprint
            ? "replay"
            : "fingerprint-conflict",
        record: existing,
      });
    },

    findById,
    findByIdempotencyKey,

    async saveTerminal(record) {
      validateRecord(record);
      const { application } = record;
      if (application.status === "started") {
        throw new ProposalApplicationPersistenceValidationError(
          "Uma Proposal Application started não possui resultado terminal para salvar.",
        );
      }

      const updated = await firstRow(
        executor,
        sql`
          UPDATE proposal_applications
          SET
            status = ${application.status},
            resulting_itinerary_version = ${
              application.status === "succeeded" ? application.resultingItineraryVersion : null
            },
            completed_at = ${application.completedAt},
            failure_code = ${application.status === "failed" ? application.failureCode : null},
            updated_at = ${application.completedAt}
          WHERE id = ${application.id}::uuid
            AND status = 'started'
          RETURNING ${returningColumns}
        `,
      );

      if (updated !== null) return;

      const existing = await findById(application.id);
      if (
        existing !== null &&
        existing.application.requestFingerprint === application.requestFingerprint &&
        ((existing.application.status === "succeeded" &&
          application.status === "succeeded" &&
          existing.application.resultingItineraryVersion ===
            application.resultingItineraryVersion) ||
          (existing.application.status === "failed" &&
            application.status === "failed" &&
            existing.application.failureCode === application.failureCode))
      ) {
        return;
      }

      throw new ProposalApplicationPersistenceConcurrencyError(
        "A Proposal Application não estava started ou foi concluída com resultado divergente.",
      );
    },
  };
}
