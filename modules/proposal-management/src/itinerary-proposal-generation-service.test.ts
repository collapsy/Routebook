import { describe, expect, it } from "vitest";

import {
  DeterministicItineraryProposalGenerationError,
  DeterministicItineraryProposalGenerator,
  type GenerateItineraryProposalInput,
  type ItineraryProposalGenerationPort,
} from "./deterministic-itinerary-proposal-generator";
import {
  INVALID_ITINERARY_PROPOSAL_GENERATION_OUTPUT_FAILURE_CODE,
  UNKNOWN_ITINERARY_PROPOSAL_GENERATION_FAILURE_CODE,
  generateAndPersistItineraryProposal,
  toItineraryProposalGenerationFailureCode,
  type GenerateAndPersistItineraryProposalCommand,
} from "./itinerary-proposal-generation-service";
import type {
  CompleteItineraryProposalGenerationInput,
  ItineraryProposal,
  ItineraryProposalId,
} from "./itinerary-proposal";
import type { ItineraryProposalRepository } from "./repository";

class MemoryItineraryProposalRepository implements ItineraryProposalRepository {
  readonly history: string[];
  readonly createCalls: ItineraryProposal[] = [];
  readonly saveCalls: ItineraryProposal[] = [];
  readonly proposals = new Map<string, ItineraryProposal>();
  createError?: Error;
  readonly saveErrors = new Map<ItineraryProposal["status"], Error>();

  constructor(history: string[] = []) {
    this.history = history;
  }

  private key(tripId: string, itineraryProposalId: ItineraryProposalId): string {
    return `${tripId}:${itineraryProposalId}`;
  }

  private seed(proposal: ItineraryProposal): void {
    this.proposals.set(this.key(proposal.tripId, proposal.id), proposal);
  }

  async create(proposal: ItineraryProposal): Promise<ItineraryProposal> {
    this.history.push(`create:${proposal.status}`);
    this.createCalls.push(proposal);
    if (this.createError) throw this.createError;
    this.seed(proposal);
    return proposal;
  }

  async save(proposal: ItineraryProposal): Promise<ItineraryProposal> {
    this.history.push(`save:${proposal.status}`);
    this.saveCalls.push(proposal);
    const error = this.saveErrors.get(proposal.status);
    if (error) throw error;
    this.seed(proposal);
    return proposal;
  }

  async findById(
    tripId: string,
    itineraryProposalId: ItineraryProposalId,
  ): Promise<ItineraryProposal | null> {
    return this.proposals.get(this.key(tripId, itineraryProposalId)) ?? null;
  }

  async listByTripId(tripId: string): Promise<readonly ItineraryProposal[]> {
    return [...this.proposals.values()].filter((proposal) => proposal.tripId === tripId);
  }
}

class ControlledGenerationPort implements ItineraryProposalGenerationPort {
  readonly calls: GenerateItineraryProposalInput[] = [];

  constructor(
    private readonly history: string[],
    private readonly result: CompleteItineraryProposalGenerationInput | Error,
  ) {}

  async generate(
    input: GenerateItineraryProposalInput,
  ): Promise<CompleteItineraryProposalGenerationInput> {
    this.history.push("generate");
    this.calls.push(input);
    if (this.result instanceof Error) throw this.result;
    return this.result;
  }
}

function generationInput(): GenerateItineraryProposalInput {
  return {
    days: [
      { tripDayId: "day-1", date: "2026-08-22", existingActivityCount: 0 },
      { tripDayId: "day-2", date: "2026-08-23", existingActivityCount: 1 },
    ],
    candidates: [
      {
        candidateId: "candidate-1",
        placeId: "place-1",
        title: "Praia do Amor",
        durationMinutes: 120,
      },
    ],
    generatedAt: new Date("2026-08-05T12:02:00.000Z"),
    createProposedActivityId: (_candidate, index) => `proposed-${index + 1}`,
  };
}

function completionContent(): CompleteItineraryProposalGenerationInput {
  return {
    generationMethod: "controlled",
    generationVersion: "1",
    proposedActivities: [
      {
        proposedActivityId: "proposed-1",
        targetTripDayId: "day-1",
        title: "Praia do Amor",
        durationMinutes: 120,
        proposedOrder: 0,
        operationType: "add",
        flexibility: "flexible",
      },
    ],
    criteria: ["Distribuição controlada para teste."],
    justifications: ["Candidato recebido pelo caso de uso."],
    limitations: [],
    planningConflictIds: [],
    generatedAt: new Date("2026-08-05T12:02:00.000Z"),
    validUntil: new Date("2026-08-06T12:02:00.000Z"),
  };
}

function command(): GenerateAndPersistItineraryProposalCommand {
  return {
    request: {
      id: "proposal-1",
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      baseTripContextVersion: 2,
      baseItineraryVersion: 3,
      contextSnapshotId: "snapshot-1",
      requestedAt: new Date("2026-08-05T12:00:00.000Z"),
    },
    startedAt: new Date("2026-08-05T12:01:00.000Z"),
    failedAt: new Date("2026-08-05T12:03:00.000Z"),
    generation: generationInput(),
  };
}

describe("generateAndPersistItineraryProposal", () => {
  it("persiste requested, generating e ready na ordem canônica", async () => {
    const history: string[] = [];
    const repository = new MemoryItineraryProposalRepository(history);
    const port = new ControlledGenerationPort(history, completionContent());
    const input = command();

    const result = await generateAndPersistItineraryProposal(repository, port, input);

    expect(result).toMatchObject({
      id: "proposal-1",
      tripId: "trip-1",
      status: "ready",
      generationMethod: "controlled",
    });
    expect(history).toEqual([
      "create:requested",
      "save:generating",
      "generate",
      "save:ready",
    ]);
    expect(port.calls).toEqual([input.generation]);
    expect(repository.createCalls).toHaveLength(1);
    expect(repository.saveCalls.map((proposal) => proposal.status)).toEqual([
      "generating",
      "ready",
    ]);
  });

  it("compõe o lifecycle com o adapter determinístico real", async () => {
    const repository = new MemoryItineraryProposalRepository();
    const generator = new DeterministicItineraryProposalGenerator();

    const result = await generateAndPersistItineraryProposal(repository, generator, command());

    expect(result).toMatchObject({
      status: "ready",
      generationMethod: "deterministic-candidate-balancing",
      generationVersion: "1",
      proposedActivities: [
        expect.objectContaining({
          proposedActivityId: "proposed-1",
          targetTripDayId: "day-1",
          placeId: "place-1",
          title: "Praia do Amor",
          proposedOrder: 0,
        }),
      ],
    });
  });

  it("persiste failed com código estável quando a porta retorna erro conhecido", async () => {
    const history: string[] = [];
    const repository = new MemoryItineraryProposalRepository(history);
    const port = new ControlledGenerationPort(
      history,
      new DeterministicItineraryProposalGenerationError("Dia inválido.", "invalid-day"),
    );

    const result = await generateAndPersistItineraryProposal(repository, port, command());

    expect(result).toMatchObject({
      status: "failed",
      failureCode: "itinerary-proposal-generation-invalid-day",
      failedAt: new Date("2026-08-05T12:03:00.000Z"),
    });
    expect(history).toEqual([
      "create:requested",
      "save:generating",
      "generate",
      "save:failed",
    ]);
  });

  it("usa fallback estável para falha desconhecida da porta", async () => {
    const repository = new MemoryItineraryProposalRepository();
    const port = new ControlledGenerationPort([], new Error("Falha inesperada."));

    const result = await generateAndPersistItineraryProposal(repository, port, command());

    expect(result).toMatchObject({
      status: "failed",
      failureCode: UNKNOWN_ITINERARY_PROPOSAL_GENERATION_FAILURE_CODE,
    });
  });

  it("persiste failed quando a porta retorna conteúdo incompatível com ready", async () => {
    const repository = new MemoryItineraryProposalRepository();
    const invalidContent = {
      ...completionContent(),
      criteria: [],
    } satisfies CompleteItineraryProposalGenerationInput;
    const port = new ControlledGenerationPort([], invalidContent);

    const result = await generateAndPersistItineraryProposal(repository, port, command());

    expect(result).toMatchObject({
      status: "failed",
      failureCode: INVALID_ITINERARY_PROPOSAL_GENERATION_OUTPUT_FAILURE_CODE,
    });
    expect(repository.saveCalls.map((proposal) => proposal.status)).toEqual([
      "generating",
      "failed",
    ]);
  });

  it("propaga falha de create sem iniciar a geração", async () => {
    const repository = new MemoryItineraryProposalRepository();
    repository.createError = new Error("create unavailable");
    const port = new ControlledGenerationPort([], completionContent());

    await expect(
      generateAndPersistItineraryProposal(repository, port, command()),
    ).rejects.toThrow("create unavailable");
    expect(port.calls).toEqual([]);
    expect(repository.saveCalls).toEqual([]);
  });

  it("propaga falha ao persistir generating sem invocar a porta", async () => {
    const repository = new MemoryItineraryProposalRepository();
    repository.saveErrors.set("generating", new Error("generating unavailable"));
    const port = new ControlledGenerationPort([], completionContent());

    await expect(
      generateAndPersistItineraryProposal(repository, port, command()),
    ).rejects.toThrow("generating unavailable");
    expect(port.calls).toEqual([]);
    expect(repository.saveCalls.map((proposal) => proposal.status)).toEqual(["generating"]);
  });

  it("propaga falha ao persistir ready sem tentar convertê-la em falha da porta", async () => {
    const repository = new MemoryItineraryProposalRepository();
    repository.saveErrors.set("ready", new Error("ready unavailable"));
    const port = new ControlledGenerationPort([], completionContent());

    await expect(
      generateAndPersistItineraryProposal(repository, port, command()),
    ).rejects.toThrow("ready unavailable");
    expect(port.calls).toHaveLength(1);
    expect(repository.saveCalls.map((proposal) => proposal.status)).toEqual([
      "generating",
      "ready",
    ]);
  });

  it("normaliza códigos estruturados e preserva o namespace canônico", () => {
    expect(toItineraryProposalGenerationFailureCode({ code: " Provider_Timeout " })).toBe(
      "itinerary-proposal-generation-provider-timeout",
    );
    expect(
      toItineraryProposalGenerationFailureCode({
        code: "itinerary-proposal-generation-invalid-day",
      }),
    ).toBe("itinerary-proposal-generation-invalid-day");
    expect(toItineraryProposalGenerationFailureCode({ code: "   " })).toBe(
      UNKNOWN_ITINERARY_PROPOSAL_GENERATION_FAILURE_CODE,
    );
  });

  it("não altera o comando recebido", async () => {
    const repository = new MemoryItineraryProposalRepository();
    const port = new ControlledGenerationPort([], completionContent());
    const input = command();
    const before = structuredClone(input);

    await generateAndPersistItineraryProposal(repository, port, input);

    expect(input).toEqual(before);
  });
});
