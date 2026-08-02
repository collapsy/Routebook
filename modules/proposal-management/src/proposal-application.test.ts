import { describe, expect, it } from "vitest";

import {
  createProposalApplicationRequestFingerprint,
  failProposalApplication,
  proposalApplicationRequestFingerprintSchemaVersion,
  proposalApplicationStatuses,
  proposalApplicationTypes,
  ProposalApplicationTransitionError,
  ProposalApplicationValidationError,
  startProposalApplication,
  succeedProposalApplication,
  type ProposalApplicationRequestFingerprintInput,
  type StartProposalApplicationInput,
} from "./proposal-application";

function requestInput(
  override: Partial<ProposalApplicationRequestFingerprintInput> = {},
): ProposalApplicationRequestFingerprintInput {
  return {
    itineraryProposalId: " proposal-1 ",
    itineraryId: " itinerary-1 ",
    applicationType: "full",
    expectedItineraryVersion: 4,
    actorType: " participant ",
    actorId: " participant-1 ",
    proposedActivityIds: [" proposed-1 ", " proposed-2 "],
    ...override,
  };
}

function startInput(
  override: Partial<StartProposalApplicationInput> = {},
): StartProposalApplicationInput {
  return {
    id: " application-1 ",
    idempotencyKey: " accept-proposal-1 ",
    startedAt: new Date("2026-08-01T18:00:00.000Z"),
    ...requestInput(),
    ...override,
  };
}

describe("Proposal Application", () => {
  it("publica somente tipos, estados e versão de fingerprint canônicos", () => {
    expect(proposalApplicationTypes).toEqual(["full", "partial"]);
    expect(proposalApplicationStatuses).toEqual(["started", "succeeded", "failed"]);
    expect(proposalApplicationRequestFingerprintSchemaVersion).toBe(1);
  });

  it("produz o mesmo fingerprint para o mesmo pedido após normalização", () => {
    const first = createProposalApplicationRequestFingerprint(requestInput());
    const second = createProposalApplicationRequestFingerprint(
      requestInput({
        itineraryProposalId: "proposal-1",
        itineraryId: "itinerary-1",
        actorType: "participant",
        actorId: "participant-1",
        proposedActivityIds: ["proposed-1", "proposed-2"],
      }),
    );

    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it.each([
    ["itineraryProposalId", { itineraryProposalId: "proposal-2" }],
    ["itineraryId", { itineraryId: "itinerary-2" }],
    ["applicationType", { applicationType: "partial" as const }],
    ["expectedItineraryVersion", { expectedItineraryVersion: 5 }],
    ["actorType", { actorType: "system" }],
    ["actorId", { actorId: "participant-2" }],
    ["proposedActivityIds", { proposedActivityIds: ["proposed-1", "proposed-3"] }],
  ])("altera o fingerprint quando %s muda", (_field, override) => {
    const baseline = createProposalApplicationRequestFingerprint(requestInput());
    const changed = createProposalApplicationRequestFingerprint(requestInput(override));

    expect(changed).not.toBe(baseline);
  });

  it("preserva a ordem dos itens no fingerprint", () => {
    const first = createProposalApplicationRequestFingerprint(requestInput());
    const reordered = createProposalApplicationRequestFingerprint(
      requestInput({ proposedActivityIds: ["proposed-2", "proposed-1"] }),
    );

    expect(reordered).not.toBe(first);
  });

  it("rejeita Proposed Activity IDs repetidos após normalização", () => {
    expect(() =>
      createProposalApplicationRequestFingerprint(
        requestInput({ proposedActivityIds: [" proposed-1 ", "proposed-1"] }),
      ),
    ).toThrowError(
      expect.objectContaining({
        fieldErrors: {
          "proposedActivityIds.1": "Não repita o Proposed Activity ID já informado na posição 0.",
        },
      }),
    );
  });

  it("inicia uma tentativa normalizada, congelada e independente do input", () => {
    const input = startInput();
    const originalStartedAt = input.startedAt.getTime();
    const application = startProposalApplication(input);

    input.startedAt.setUTCFullYear(2030);

    expect(application).toEqual({
      id: "application-1",
      itineraryProposalId: "proposal-1",
      idempotencyKey: "accept-proposal-1",
      requestFingerprint: createProposalApplicationRequestFingerprint(requestInput()),
      applicationType: "full",
      expectedItineraryVersion: 4,
      actorType: "participant",
      actorId: "participant-1",
      startedAt: new Date(originalStartedAt),
      status: "started",
    });
    expect(application.startedAt).not.toBe(input.startedAt);
    expect(Object.isFrozen(application)).toBe(true);
  });

  it.each([
    ["id", { id: " " }],
    ["itineraryProposalId", { itineraryProposalId: " " }],
    ["itineraryId", { itineraryId: " " }],
    ["idempotencyKey", { idempotencyKey: " " }],
    ["applicationType", { applicationType: "automatic" as never }],
    ["expectedItineraryVersion", { expectedItineraryVersion: 0 }],
    ["actorType", { actorType: " " }],
    ["actorId", { actorId: " " }],
    ["startedAt", { startedAt: new Date("invalid") }],
    ["proposedActivityIds", { proposedActivityIds: undefined as never }],
  ])("rejeita entrada inválida em %s", (field, override) => {
    expect(() => startProposalApplication(startInput(override))).toThrowError(
      expect.objectContaining({
        fieldErrors: expect.objectContaining({ [field]: expect.any(String) }),
      }),
    );
  });

  it("conclui uma tentativa iniciada com sucesso", () => {
    const started = startProposalApplication(startInput());
    const completedAt = new Date("2026-08-01T18:00:05.000Z");
    const succeeded = succeedProposalApplication(started, {
      resultingItineraryVersion: 5,
      completedAt,
    });

    completedAt.setUTCFullYear(2030);

    expect(succeeded).toEqual({
      ...started,
      status: "succeeded",
      resultingItineraryVersion: 5,
      completedAt: new Date("2026-08-01T18:00:05.000Z"),
    });
    expect(succeeded.completedAt).not.toBe(completedAt);
    expect(Object.isFrozen(succeeded)).toBe(true);
  });

  it("conclui uma tentativa iniciada com falha auditável", () => {
    const started = startProposalApplication(startInput());
    const completedAt = new Date("2026-08-01T18:00:05.000Z");
    const failed = failProposalApplication(started, {
      failureCode: " itinerary-version-mismatch ",
      completedAt,
    });

    expect(failed).toEqual({
      ...started,
      status: "failed",
      failureCode: "itinerary-version-mismatch",
      completedAt,
    });
    expect(failed.completedAt).not.toBe(completedAt);
    expect(Object.isFrozen(failed)).toBe(true);
  });

  it.each([
    [
      "succeeded",
      () =>
        succeedProposalApplication(startProposalApplication(startInput()), {
          resultingItineraryVersion: 0,
          completedAt: new Date("2026-08-01T18:00:05.000Z"),
        }),
      "resultingItineraryVersion",
    ],
    [
      "failed",
      () =>
        failProposalApplication(startProposalApplication(startInput()), {
          failureCode: " ",
          completedAt: new Date("2026-08-01T18:00:05.000Z"),
        }),
      "failureCode",
    ],
    [
      "completedAt",
      () =>
        succeedProposalApplication(startProposalApplication(startInput()), {
          resultingItineraryVersion: 5,
          completedAt: new Date("2026-08-01T17:59:59.000Z"),
        }),
      "completedAt",
    ],
  ])("rejeita finalização inválida em %s", (_case, operation, field) => {
    expect(operation).toThrowError(
      expect.objectContaining({
        fieldErrors: expect.objectContaining({ [field]: expect.any(String) }),
      }),
    );
  });

  it("impede finalizar novamente uma tentativa terminal", () => {
    const succeeded = succeedProposalApplication(startProposalApplication(startInput()), {
      resultingItineraryVersion: 5,
      completedAt: new Date("2026-08-01T18:00:05.000Z"),
    });

    expect(() =>
      failProposalApplication(succeeded, {
        failureCode: "late-failure",
        completedAt: new Date("2026-08-01T18:00:06.000Z"),
      }),
    ).toThrowError(
      expect.objectContaining({
        currentStatus: "succeeded",
        attemptedStatus: "failed",
      }),
    );
    expect(() =>
      succeedProposalApplication(succeeded, {
        resultingItineraryVersion: 6,
        completedAt: new Date("2026-08-01T18:00:06.000Z"),
      }),
    ).toThrowError(ProposalApplicationTransitionError);
  });

  it("expõe erros específicos de validação", () => {
    expect(() =>
      createProposalApplicationRequestFingerprint(requestInput({ expectedItineraryVersion: -1 })),
    ).toThrowError(ProposalApplicationValidationError);
  });
});
