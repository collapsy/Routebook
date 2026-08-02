import { describe, expect, it, vi } from "vitest";

import {
  failProposalApplication,
  startProposalApplication,
  succeedProposalApplication,
  type ProposalApplication,
  type ProposalApplicationRequestFingerprintInput,
} from "@routebook/proposal-management";

import {
  createProposalApplicationTransactionFragment,
  ProposalApplicationTransactionFragmentValidationError,
  type ProposalApplicationTransactionRepository,
  type ReserveProposalApplicationInput,
} from "./proposal-application-transaction-fragment";
import type {
  CreateProposalApplicationPersistenceResult,
  ProposalApplicationPersistenceRecord,
  ProposalApplicationSqlExecutor,
} from "./proposal-application-repository";

const startedAt = new Date("2026-08-02T12:00:00.000Z");
const completedAt = new Date("2026-08-02T12:05:00.000Z");

function reservationInput(): ReserveProposalApplicationInput {
  return {
    tripId: " trip-1 ",
    itineraryProposalId: " proposal-1 ",
    itineraryId: " itinerary-1 ",
    applicationType: "full",
    expectedItineraryVersion: 7,
    actorType: " participant ",
    actorId: " participant-1 ",
    proposedActivityIds: [" activity-1 ", "activity-2"],
    applicationId: " application-1 ",
    idempotencyKey: " idempotency-1 ",
    startedAt,
  };
}

function request(): ProposalApplicationRequestFingerprintInput {
  return Object.freeze({
    itineraryProposalId: "proposal-1",
    itineraryId: "itinerary-1",
    applicationType: "full",
    expectedItineraryVersion: 7,
    actorType: "participant",
    actorId: "participant-1",
    proposedActivityIds: Object.freeze(["activity-1", "activity-2"]),
  });
}

function persistenceRecord(
  status: ProposalApplication["status"],
): ProposalApplicationPersistenceRecord {
  const requestValue = request();
  const started = startProposalApplication({
    ...requestValue,
    id: "application-1",
    idempotencyKey: "idempotency-1",
    startedAt,
  });
  const application =
    status === "started"
      ? started
      : status === "succeeded"
        ? succeedProposalApplication(started, {
            resultingItineraryVersion: 8,
            completedAt,
          })
        : failProposalApplication(started, {
            failureCode: "proposal-invalid",
            completedAt,
          });

  return Object.freeze({
    tripId: "trip-1",
    itineraryId: "itinerary-1",
    request: requestValue,
    application,
  });
}

function executor(): ProposalApplicationSqlExecutor {
  return {
    async execute() {
      return [];
    },
  };
}

function repository(createResult?: CreateProposalApplicationPersistenceResult): Readonly<{
  value: ProposalApplicationTransactionRepository;
  create: ReturnType<typeof vi.fn>;
  saveTerminal: ReturnType<typeof vi.fn>;
}> {
  const create = vi.fn(
    async (record: ProposalApplicationPersistenceRecord) =>
      createResult ?? ({ kind: "created", record } as const),
  );
  const saveTerminal = vi.fn(async () => undefined);

  return {
    value: { create, saveTerminal },
    create,
    saveTerminal,
  };
}

describe("createProposalApplicationTransactionFragment", () => {
  it("cria o repository com o executor escopado e reserva uma tentativa started", async () => {
    const scopedExecutor = executor();
    const stored = repository();
    const repositoryFactory = vi.fn(() => stored.value);
    const fragment = createProposalApplicationTransactionFragment(
      scopedExecutor,
      repositoryFactory,
    );

    const result = await fragment.reserve(reservationInput());

    expect(repositoryFactory).toHaveBeenCalledWith(scopedExecutor);
    expect(repositoryFactory).toHaveBeenCalledTimes(1);
    expect(stored.create).toHaveBeenCalledTimes(1);
    expect(result.kind).toBe("reserved");
    if (result.kind !== "reserved") throw new Error("Reserva não criada.");
    expect(result.record.tripId).toBe("trip-1");
    expect(result.record.itineraryId).toBe("itinerary-1");
    expect(result.record.request).toEqual(request());
    expect(Object.isFrozen(result.record.request.proposedActivityIds)).toBe(true);
    expect(result.record.application).toMatchObject({
      id: "application-1",
      itineraryProposalId: "proposal-1",
      idempotencyKey: "idempotency-1",
      status: "started",
      actorType: "participant",
      actorId: "participant-1",
    });
  });

  it("classifica replay succeeded como replay canônico", async () => {
    const record = persistenceRecord("succeeded");
    const stored = repository({ kind: "replay", record });
    const fragment = createProposalApplicationTransactionFragment(executor(), () => stored.value);

    const result = await fragment.reserve(reservationInput());

    expect(result).toEqual({ kind: "replay", record });
  });

  it("classifica replay started como application-in-progress", async () => {
    const record = persistenceRecord("started");
    const stored = repository({ kind: "replay", record });
    const fragment = createProposalApplicationTransactionFragment(executor(), () => stored.value);

    const result = await fragment.reserve(reservationInput());

    expect(result).toEqual({ kind: "application-in-progress", record });
  });

  it("classifica replay failed como application-failed", async () => {
    const record = persistenceRecord("failed");
    const stored = repository({ kind: "replay", record });
    const fragment = createProposalApplicationTransactionFragment(executor(), () => stored.value);

    const result = await fragment.reserve(reservationInput());

    expect(result).toEqual({ kind: "application-failed", record });
  });

  it("preserva fingerprint-conflict sem carregar ou alterar outro aggregate", async () => {
    const record = persistenceRecord("started");
    const stored = repository({ kind: "fingerprint-conflict", record });
    const fragment = createProposalApplicationTransactionFragment(executor(), () => stored.value);

    const result = await fragment.reserve(reservationInput());

    expect(result).toEqual({ kind: "fingerprint-conflict", record });
    expect(stored.saveTerminal).not.toHaveBeenCalled();
  });

  it("conclui uma reserva com sucesso e persiste a versão resultante", async () => {
    const stored = repository();
    const fragment = createProposalApplicationTransactionFragment(executor(), () => stored.value);
    const reserved = await fragment.reserve(reservationInput());
    if (reserved.kind !== "reserved") throw new Error("Reserva não criada.");

    const result = await fragment.succeed(reserved.record, {
      resultingItineraryVersion: 8,
      completedAt,
    });

    expect(result.application).toMatchObject({
      status: "succeeded",
      resultingItineraryVersion: 8,
      completedAt,
    });
    expect(result.request).toBe(reserved.record.request);
    expect(stored.saveTerminal).toHaveBeenCalledWith(result);
    expect(stored.saveTerminal).toHaveBeenCalledTimes(1);
  });

  it("conclui uma reserva com falha e persiste o failure code", async () => {
    const stored = repository();
    const fragment = createProposalApplicationTransactionFragment(executor(), () => stored.value);
    const reserved = await fragment.reserve(reservationInput());
    if (reserved.kind !== "reserved") throw new Error("Reserva não criada.");

    const result = await fragment.fail(reserved.record, {
      failureCode: " itinerary-version-mismatch ",
      completedAt,
    });

    expect(result.application).toMatchObject({
      status: "failed",
      failureCode: "itinerary-version-mismatch",
      completedAt,
    });
    expect(stored.saveTerminal).toHaveBeenCalledWith(result);
    expect(stored.saveTerminal).toHaveBeenCalledTimes(1);
  });

  it("propaga falha de reserva sem retry", async () => {
    const error = new Error("reservation failure");
    const stored = repository();
    stored.create.mockRejectedValueOnce(error);
    const fragment = createProposalApplicationTransactionFragment(executor(), () => stored.value);

    await expect(fragment.reserve(reservationInput())).rejects.toBe(error);
    expect(stored.create).toHaveBeenCalledTimes(1);
  });

  it("propaga falha terminal sem retry", async () => {
    const error = new Error("terminal failure");
    const stored = repository();
    stored.saveTerminal.mockRejectedValueOnce(error);
    const fragment = createProposalApplicationTransactionFragment(executor(), () => stored.value);
    const reserved = await fragment.reserve(reservationInput());
    if (reserved.kind !== "reserved") throw new Error("Reserva não criada.");

    await expect(
      fragment.succeed(reserved.record, {
        resultingItineraryVersion: 8,
        completedAt,
      }),
    ).rejects.toBe(error);
    expect(stored.saveTerminal).toHaveBeenCalledTimes(1);
  });

  it("rejeita executor, factory e repository inválidos", () => {
    const stored = repository();

    expect(() =>
      createProposalApplicationTransactionFragment(undefined as never, () => stored.value),
    ).toThrowError(TypeError);
    expect(() =>
      createProposalApplicationTransactionFragment(executor(), null as never),
    ).toThrowError(TypeError);
    expect(() =>
      createProposalApplicationTransactionFragment(executor(), () => undefined as never),
    ).toThrowError(TypeError);
  });

  it("rejeita reserva sem contexto antes de acessar o repository", async () => {
    const stored = repository();
    const fragment = createProposalApplicationTransactionFragment(executor(), () => stored.value);

    await expect(fragment.reserve(undefined as never)).rejects.toBeInstanceOf(
      ProposalApplicationTransactionFragmentValidationError,
    );
    expect(stored.create).not.toHaveBeenCalled();
  });
});
