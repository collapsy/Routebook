import { describe, expect, it } from "vitest";

import {
  completeItineraryProposalGeneration,
  requestItineraryProposal,
  startItineraryProposalGeneration,
} from "./itinerary-proposal";
import {
  DEFAULT_DETERMINISTIC_ACTIVITY_DURATION_MINUTES,
  DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_METHOD,
  DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_VERSION,
  DETERMINISTIC_ITINERARY_PROPOSAL_VALIDITY_HOURS,
  DeterministicItineraryProposalGenerationError,
  DeterministicItineraryProposalGenerator,
  type GenerateItineraryProposalInput,
} from "./deterministic-itinerary-proposal-generator";

const generatedAt = new Date("2026-08-05T12:00:00.000Z");

function input(
  overrides: Partial<GenerateItineraryProposalInput> = {},
): GenerateItineraryProposalInput {
  return {
    days: [
      { tripDayId: "day-2026-08-22", date: "2026-08-22", existingActivityCount: 1 },
      { tripDayId: "day-2026-08-23", date: "2026-08-23", existingActivityCount: 0 },
    ],
    candidates: [
      {
        candidateId: "candidate-beach",
        placeId: "place-beach",
        title: "Praia do Amor",
        description: "Manhã de praia com acesso pelo mirante.",
        reason: "Lugar priorizado entre as recomendações atuais.",
      },
      {
        candidateId: "candidate-dinner",
        placeId: "place-dinner",
        title: "Jantar no centro",
        durationMinutes: 120,
        estimatedCostAmount: 90,
        estimatedCostCurrency: "brl",
      },
      {
        candidateId: "candidate-sunset",
        title: "Pôr do sol no mirante",
        durationMinutes: 60,
      },
      {
        candidateId: "candidate-nightlife",
        placeId: "place-nightlife",
        title: "Música ao vivo",
        durationMinutes: 150,
      },
    ],
    generatedAt,
    createProposedActivityId: (_candidate, index) => `proposed-${index + 1}`,
    ...overrides,
  };
}

describe("DeterministicItineraryProposalGenerator", () => {
  it("gera conteúdo estável, balanceado e anexável ao Roteiro", async () => {
    const generator = new DeterministicItineraryProposalGenerator();

    const result = await generator.generate(input());

    expect(result.generationMethod).toBe(DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_METHOD);
    expect(result.generationVersion).toBe(DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_VERSION);
    expect(result.generatedAt).toEqual(generatedAt);
    expect(result.generatedAt).not.toBe(generatedAt);
    expect(result.validUntil).toEqual(
      new Date(
        generatedAt.getTime() + DETERMINISTIC_ITINERARY_PROPOSAL_VALIDITY_HOURS * 60 * 60 * 1_000,
      ),
    );
    expect(result.planningConflictIds).toEqual([]);
    expect(result.proposedActivities).toEqual([
      expect.objectContaining({
        proposedActivityId: "proposed-1",
        targetTripDayId: "day-2026-08-23",
        placeId: "place-beach",
        title: "Praia do Amor",
        durationMinutes: DEFAULT_DETERMINISTIC_ACTIVITY_DURATION_MINUTES,
        proposedOrder: 0,
        operationType: "add",
        flexibility: "flexible",
      }),
      expect.objectContaining({
        proposedActivityId: "proposed-2",
        targetTripDayId: "day-2026-08-22",
        title: "Jantar no centro",
        durationMinutes: 120,
        proposedOrder: 1,
        estimatedCostAmount: 90,
        estimatedCostCurrency: "BRL",
      }),
      expect.objectContaining({
        proposedActivityId: "proposed-3",
        targetTripDayId: "day-2026-08-23",
        title: "Pôr do sol no mirante",
        proposedOrder: 1,
      }),
      expect.objectContaining({
        proposedActivityId: "proposed-4",
        targetTripDayId: "day-2026-08-22",
        title: "Música ao vivo",
        proposedOrder: 2,
      }),
    ]);
    expect(
      result.proposedActivities.every((activity) => activity.proposedStartTime === undefined),
    ).toBe(true);
    expect(result.limitations).toContain(
      `Candidatos sem duração conhecida receberam a estimativa padrão de ${DEFAULT_DETERMINISTIC_ACTIVITY_DURATION_MINUTES} minutos.`,
    );
  });

  it("usa a ordem canônica dos Dias como desempate sem depender de locale ou ordem de entrada", async () => {
    const generator = new DeterministicItineraryProposalGenerator();
    const days = [
      { tripDayId: "day-a", date: "2026-08-22", existingActivityCount: 0 },
      { tripDayId: "day-Z", date: "2026-08-22", existingActivityCount: 0 },
    ] as const;

    const result = await generator.generate(
      input({
        days,
        candidates: input().candidates.slice(0, 2),
      }),
    );

    expect(result.proposedActivities.map((activity) => activity.targetTripDayId)).toEqual([
      "day-Z",
      "day-a",
    ]);
  });

  it("produz saída equivalente para a mesma entrada e factories determinísticas", async () => {
    const generator = new DeterministicItineraryProposalGenerator();

    const first = await generator.generate(input());
    const second = await generator.generate(input());

    expect(second).toEqual(first);
  });

  it("não altera coleções ou objetos recebidos", async () => {
    const generator = new DeterministicItineraryProposalGenerator();
    const generationInput = input();
    const daysBefore = structuredClone(generationInput.days);
    const candidatesBefore = structuredClone(generationInput.candidates);

    await generator.generate(generationInput);

    expect(generationInput.days).toEqual(daysBefore);
    expect(generationInput.candidates).toEqual(candidatesBefore);
  });

  it("conclui uma Proposal generating como ready pelo lifecycle canônico", async () => {
    const generator = new DeterministicItineraryProposalGenerator();
    const requestedAt = new Date("2026-08-05T11:58:00.000Z");
    const requested = requestItineraryProposal({
      id: "proposal-deterministic",
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      baseTripContextVersion: 3,
      baseItineraryVersion: 4,
      contextSnapshotId: "snapshot-1",
      requestedAt,
    });
    const generating = startItineraryProposalGeneration(
      requested,
      new Date("2026-08-05T11:59:00.000Z"),
    );

    const generated = await generator.generate(input());
    const ready = completeItineraryProposalGeneration(generating, generated);

    expect(ready.status).toBe("ready");
    expect(ready.generationMethod).toBe(DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_METHOD);
    expect(ready.proposedActivities).toHaveLength(4);
    expect(ready.generatedAt).toEqual(generatedAt);
  });

  it("gera uma Proposal vazia e explicada quando não existem candidatos", async () => {
    const generator = new DeterministicItineraryProposalGenerator();

    const result = await generator.generate(input({ candidates: [] }));

    expect(result.proposedActivities).toEqual([]);
    expect(result.justifications).toEqual([
      "Nenhum candidato elegível foi recebido; nenhuma mudança foi proposta.",
    ]);
    expect(result.limitations).toContain(
      "Nenhum candidato elegível foi recebido; a proposta não contém mudanças e o Roteiro atual permanece preservado.",
    );
  });

  it("rejeita geração sem Dias", async () => {
    const generator = new DeterministicItineraryProposalGenerator();

    await expect(generator.generate(input({ days: [] }))).rejects.toMatchObject({
      name: "DeterministicItineraryProposalGenerationError",
      code: "days-required",
    });
  });

  it("rejeita TripDayId e CandidateId duplicados", async () => {
    const generator = new DeterministicItineraryProposalGenerator();

    await expect(
      generator.generate(
        input({
          days: [
            { tripDayId: "day-1", date: "2026-08-22", existingActivityCount: 0 },
            { tripDayId: "day-1", date: "2026-08-23", existingActivityCount: 0 },
          ],
        }),
      ),
    ).rejects.toMatchObject({ code: "duplicate-day" });

    await expect(
      generator.generate(
        input({
          candidates: [
            { candidateId: "candidate-1", title: "Primeiro" },
            { candidateId: "candidate-1", title: "Segundo" },
          ],
        }),
      ),
    ).rejects.toMatchObject({ code: "duplicate-candidate" });
  });

  it("rejeita ProposedActivityIds duplicados produzidos pela factory", async () => {
    const generator = new DeterministicItineraryProposalGenerator();

    await expect(
      generator.generate(input({ createProposedActivityId: () => "proposed-duplicate" })),
    ).rejects.toMatchObject({ code: "duplicate-proposed-activity-id" });
  });

  it("rejeita duração, custo, data, validade e ProposedActivityId inválidos com códigos estáveis", async () => {
    const generator = new DeterministicItineraryProposalGenerator();

    await expect(
      generator.generate(
        input({ candidates: [{ candidateId: "candidate-1", title: "Lugar", durationMinutes: 0 }] }),
      ),
    ).rejects.toBeInstanceOf(DeterministicItineraryProposalGenerationError);

    await expect(
      generator.generate(
        input({
          candidates: [{ candidateId: "candidate-1", title: "Lugar", estimatedCostAmount: -1 }],
        }),
      ),
    ).rejects.toMatchObject({ code: "invalid-candidate" });

    await expect(
      generator.generate(
        input({
          days: [{ tripDayId: "day-invalid", date: "2026-02-30", existingActivityCount: 0 }],
        }),
      ),
    ).rejects.toMatchObject({ code: "invalid-day" });

    await expect(
      generator.generate(input({ generatedAt: new Date("invalid") })),
    ).rejects.toMatchObject({
      code: "invalid-generated-at",
    });

    await expect(
      generator.generate(input({ generatedAt: new Date(8_640_000_000_000_000 - 1) })),
    ).rejects.toMatchObject({ code: "invalid-validity" });

    await expect(
      generator.generate(input({ createProposedActivityId: () => " " })),
    ).rejects.toMatchObject({ code: "invalid-proposed-activity-id" });
  });
});
