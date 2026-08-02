import { describe, expect, it } from "vitest";

import {
  createProposalApplicationRequestFingerprint,
  failProposalApplication,
  startProposalApplication,
  succeedProposalApplication,
  type ProposalApplicationRequestFingerprintInput,
} from "@routebook/proposal-management";

import {
  createPostgresProposalApplicationRepository,
  ProposalApplicationPersistenceConcurrencyError,
  ProposalApplicationPersistenceCorruptionError,
  ProposalApplicationPersistenceValidationError,
  type ProposalApplicationPersistenceRecord,
  type ProposalApplicationSqlExecutor,
} from "./proposal-application-repository";

const ids = {
  application: "00000000-0000-4000-8000-000000000071",
  trip: "00000000-0000-4000-8000-000000000001",
  itinerary: "00000000-0000-4000-8000-000000000002",
  proposal: "00000000-0000-4000-8000-000000000003",
};

const startedAt = new Date("2026-08-01T20:00:00.000Z");
const completedAt = new Date("2026-08-01T20:00:05.000Z");

function request(
  override: Partial<ProposalApplicationRequestFingerprintInput> = {},
): ProposalApplicationRequestFingerprintInput {
  return {
    itineraryProposalId: ids.proposal,
    itineraryId: ids.itinerary,
    applicationType: "full",
    expectedItineraryVersion: 4,
    actorType: "participant",
    actorId: "participant-local",
    proposedActivityIds: ["proposed-1", "proposed-2"],
    ...override,
  };
}

function startedRecord(
  override: Partial<ProposalApplicationPersistenceRecord> = {},
): ProposalApplicationPersistenceRecord {
  const canonicalRequest = request();
  return {
    tripId: ids.trip,
    itineraryId: ids.itinerary,
    request: canonicalRequest,
    application: startProposalApplication({
      ...canonicalRequest,
      id: ids.application,
      idempotencyKey: "accept-proposal-1",
      startedAt,
    }),
    ...override,
  };
}

function row(
  override: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  const canonicalRequest = request();
  return {
    id: ids.application,
    tripId: ids.trip,
    itineraryId: ids.itinerary,
    itineraryProposalId: ids.proposal,
    idempotencyKey: "accept-proposal-1",
    requestFingerprint: createProposalApplicationRequestFingerprint(canonicalRequest),
    requestPayload: canonicalRequest,
    applicationType: "full",
    status: "started",
    expectedItineraryVersion: 4,
    resultingItineraryVersion: null,
    actorType: "participant",
    actorId: "participant-local",
    startedAt,
    completedAt: null,
    failureCode: null,
    ...override,
  };
}

class FakeExecutor implements ProposalApplicationSqlExecutor {
  readonly calls: unknown[] = [];

  constructor(private readonly results: unknown[]) {}

  async execute(query: unknown): Promise<unknown> {
    this.calls.push(query);
    return this.results.shift() ?? { rows: [] };
  }
}

describe("PostgresProposalApplicationRepository", () => {
  it("reidrata uma Proposal Application started", async () => {
    const executor = new FakeExecutor([{ rows: [row()] }]);
    const repository = createPostgresProposalApplicationRepository(executor);

    await expect(repository.findById(ids.application)).resolves.toEqual(startedRecord());
    expect(executor.calls).toHaveLength(1);
  });

  it("reidrata resultados succeeded e failed pelas operações públicas do domínio", async () => {
    const succeededExecutor = new FakeExecutor([
      {
        rows: [
          row({
            status: "succeeded",
            resultingItineraryVersion: 5,
            completedAt,
          }),
        ],
      },
    ]);
    const succeededRepository = createPostgresProposalApplicationRepository(succeededExecutor);
    const succeeded = await succeededRepository.findById(ids.application);

    expect(succeeded?.application).toEqual(
      succeedProposalApplication(startedRecord().application, {
        resultingItineraryVersion: 5,
        completedAt,
      }),
    );

    const failedExecutor = new FakeExecutor([
      {
        rows: [
          row({
            status: "failed",
            completedAt,
            failureCode: "itinerary-version-mismatch",
          }),
        ],
      },
    ]);
    const failedRepository = createPostgresProposalApplicationRepository(failedExecutor);
    const failed = await failedRepository.findById(ids.application);

    expect(failed?.application).toEqual(
      failProposalApplication(startedRecord().application, {
        failureCode: "itinerary-version-mismatch",
        completedAt,
      }),
    );
  });

  it("retorna null quando a tentativa não existe", async () => {
    const repository = createPostgresProposalApplicationRepository(
      new FakeExecutor([{ rows: [] }]),
    );

    await expect(repository.findById(ids.application)).resolves.toBeNull();
  });

  it("rejeita corrupção entre request_payload e fingerprint", async () => {
    const repository = createPostgresProposalApplicationRepository(
      new FakeExecutor([
        {
          rows: [row({ requestFingerprint: "a".repeat(64) })],
        },
      ]),
    );

    await expect(repository.findById(ids.application)).rejects.toThrowError(
      ProposalApplicationPersistenceCorruptionError,
    );
  });

  it("cria uma tentativa started e devolve o round trip canônico", async () => {
    const executor = new FakeExecutor([{ rows: [row()] }]);
    const repository = createPostgresProposalApplicationRepository(executor);

    await expect(repository.create(startedRecord())).resolves.toEqual({
      kind: "created",
      record: startedRecord(),
    });
    expect(executor.calls).toHaveLength(1);
  });

  it("classifica replay equivalente após conflito da chave idempotente", async () => {
    const executor = new FakeExecutor([{ rows: [] }, { rows: [row()] }]);
    const repository = createPostgresProposalApplicationRepository(executor);

    await expect(repository.create(startedRecord())).resolves.toEqual({
      kind: "replay",
      record: startedRecord(),
    });
    expect(executor.calls).toHaveLength(2);
  });

  it("classifica reutilização da chave com fingerprint divergente", async () => {
    const divergentRequest = request({ expectedItineraryVersion: 5 });
    const executor = new FakeExecutor([
      { rows: [] },
      {
        rows: [
          row({
            requestFingerprint: createProposalApplicationRequestFingerprint(divergentRequest),
            requestPayload: divergentRequest,
            expectedItineraryVersion: 5,
          }),
        ],
      },
    ]);
    const repository = createPostgresProposalApplicationRepository(executor);

    await expect(repository.create(startedRecord())).resolves.toMatchObject({
      kind: "fingerprint-conflict",
      record: {
        application: {
          expectedItineraryVersion: 5,
        },
      },
    });
  });

  it("falha quando o conflito de unicidade não pode carregar a linha canônica", async () => {
    const repository = createPostgresProposalApplicationRepository(
      new FakeExecutor([{ rows: [] }, { rows: [] }]),
    );

    await expect(repository.create(startedRecord())).rejects.toThrowError(
      ProposalApplicationPersistenceConcurrencyError,
    );
  });

  it("salva uma conclusão succeeded", async () => {
    const terminal = succeedProposalApplication(startedRecord().application, {
      resultingItineraryVersion: 5,
      completedAt,
    });
    const executor = new FakeExecutor([
      {
        rows: [
          row({
            status: "succeeded",
            resultingItineraryVersion: 5,
            completedAt,
          }),
        ],
      },
    ]);
    const repository = createPostgresProposalApplicationRepository(executor);

    await expect(
      repository.saveTerminal({ ...startedRecord(), application: terminal }),
    ).resolves.toBeUndefined();
  });

  it("aceita retry idempotente do mesmo resultado terminal", async () => {
    const terminal = failProposalApplication(startedRecord().application, {
      failureCode: "itinerary-version-mismatch",
      completedAt,
    });
    const terminalRow = row({
      status: "failed",
      completedAt,
      failureCode: "itinerary-version-mismatch",
    });
    const repository = createPostgresProposalApplicationRepository(
      new FakeExecutor([{ rows: [] }, { rows: [terminalRow] }]),
    );

    await expect(
      repository.saveTerminal({ ...startedRecord(), application: terminal }),
    ).resolves.toBeUndefined();
  });

  it("rejeita criação terminal e salvamento de tentativa started", async () => {
    const terminal = succeedProposalApplication(startedRecord().application, {
      resultingItineraryVersion: 5,
      completedAt,
    });
    const repository = createPostgresProposalApplicationRepository(new FakeExecutor([]));

    await expect(
      repository.create({ ...startedRecord(), application: terminal }),
    ).rejects.toThrowError(ProposalApplicationPersistenceValidationError);
    await expect(repository.saveTerminal(startedRecord())).rejects.toThrowError(
      ProposalApplicationPersistenceValidationError,
    );
  });
});
