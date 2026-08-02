import { describe, expect, it } from "vitest";

import type { Activity, FreePeriod, Itinerary } from "./itinerary";
import {
  applyProposalItemOperationTypes,
  applyProposalItemsToItinerary,
  ApplyProposalItemsCommandValidationError,
  ApplyProposalItemsDomainError,
  createApplyProposalItemsCommand,
  type ApplyProposalItem,
  type ApplyProposalItems,
  type ApplyProposalItemsCommandInput,
  type ApplyProposalItemsDomainErrorCode,
} from "./proposal-application";

const baseTime = new Date("2026-08-01T18:00:00.000Z");
const applicationTime = new Date("2026-08-01T19:00:00.000Z");

function contractInput(items: readonly ApplyProposalItem[] = []) {
  return {
    tripId: " trip-1 ",
    itineraryId: " itinerary-1 ",
    itineraryProposalId: " proposal-1 ",
    expectedItineraryVersion: 4,
    idempotencyKey: " accept-proposal-1 ",
    items,
  } as const;
}

function createActivity(
  id: string,
  title: string,
  order: number,
  override: Partial<Activity> = {},
): Activity {
  return {
    id,
    title,
    type: "custom",
    status: "planned",
    flexibility: "flexible",
    order,
    createdAt: new Date(baseTime),
    updatedAt: new Date(baseTime),
    ...override,
  };
}

function createFreePeriod(override: Partial<FreePeriod> = {}): FreePeriod {
  return {
    id: "free-protected",
    mode: "protected",
    order: 1,
    startTime: "15:00",
    durationMinutes: 120,
    createdAt: new Date(baseTime),
    updatedAt: new Date(baseTime),
    ...override,
  };
}

function createItineraryFixture(): Itinerary {
  return {
    id: "itinerary-1",
    tripId: "trip-1",
    period: {
      startDate: "2026-08-22",
      endDate: "2026-08-23",
      timeZone: "America/Fortaleza",
    },
    days: [
      {
        id: "day-1",
        date: "2026-08-22",
        position: 1,
        activities: [
          createActivity("activity-1", "Café", 1, {
            type: "meal",
            startTime: "08:00",
            durationMinutes: 60,
          }),
          createActivity("activity-fixed", "Check-in", 2, {
            type: "check-in",
            flexibility: "fixed",
            startTime: "14:00",
          }),
          createActivity("activity-3", "Praia", 3, {
            type: "place-visit",
            placeId: "place-praia",
          }),
        ],
        freePeriods: [],
      },
      {
        id: "day-2",
        date: "2026-08-23",
        position: 2,
        activities: [
          createActivity("activity-2", "Almoço", 1, {
            type: "meal",
            startTime: "12:00",
            durationMinutes: 90,
            placeId: "place-restaurante",
          }),
        ],
        freePeriods: [createFreePeriod()],
      },
    ],
    version: 4,
    createdAt: new Date(baseTime),
    updatedAt: new Date(baseTime),
  };
}

function applicationInput(
  items: readonly ApplyProposalItem[],
  override: Partial<ApplyProposalItemsCommandInput> = {},
): ApplyProposalItemsCommandInput {
  return {
    tripId: "trip-1",
    itineraryId: "itinerary-1",
    itineraryProposalId: "proposal-1",
    expectedItineraryVersion: 4,
    idempotencyKey: "accept-proposal-1",
    items,
    ...override,
  };
}

function expectDomainError(
  operation: () => unknown,
  code: ApplyProposalItemsDomainErrorCode,
  itemIndex?: number,
): void {
  expect(operation).toThrowError(
    expect.objectContaining({
      code,
      ...(itemIndex !== undefined ? { itemIndex } : {}),
    }),
  );
}

describe("contrato ApplyProposalItems", () => {
  it("publica somente as quatro operações canônicas", () => {
    expect(applyProposalItemOperationTypes).toEqual([
      "add",
      "move",
      "update",
      "remove",
    ]);
  });

  it("normaliza as quatro variantes e preserva coleção vazia", () => {
    const command = createApplyProposalItemsCommand(
      contractInput([
        {
          proposedActivityId: " proposed-add ",
          operationType: "add",
          targetTripDayId: " day-1 ",
          targetOrder: 2,
          title: " Museu ",
          activityType: "place-visit",
          flexibility: "suggested",
          startTime: "09:30",
          durationMinutes: 90,
          placeId: " place-1 ",
        },
        {
          proposedActivityId: " proposed-move ",
          operationType: "move",
          sourceActivityId: " activity-1 ",
          targetTripDayId: " day-2 ",
        },
        {
          proposedActivityId: " proposed-update ",
          operationType: "update",
          sourceActivityId: " activity-2 ",
          title: " Almoço ",
          startTime: "12:00",
        },
        {
          proposedActivityId: " proposed-remove ",
          operationType: "remove",
          sourceActivityId: " activity-3 ",
        },
      ]),
    );

    expect(command).toMatchObject({
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      itineraryProposalId: "proposal-1",
      expectedItineraryVersion: 4,
      idempotencyKey: "accept-proposal-1",
    });
    expect(command.items).toEqual([
      {
        proposedActivityId: "proposed-add",
        operationType: "add",
        targetTripDayId: "day-1",
        targetOrder: 2,
        title: "Museu",
        activityType: "place-visit",
        flexibility: "suggested",
        startTime: "09:30",
        durationMinutes: 90,
        placeId: "place-1",
      },
      {
        proposedActivityId: "proposed-move",
        operationType: "move",
        sourceActivityId: "activity-1",
        targetTripDayId: "day-2",
      },
      {
        proposedActivityId: "proposed-update",
        operationType: "update",
        sourceActivityId: "activity-2",
        title: "Almoço",
        startTime: "12:00",
      },
      {
        proposedActivityId: "proposed-remove",
        operationType: "remove",
        sourceActivityId: "activity-3",
      },
    ]);
    expect(createApplyProposalItemsCommand(contractInput()).items).toEqual([]);
  });

  it("congela o comando sem mutar o input", () => {
    const original = contractInput([
      {
        proposedActivityId: " proposed-add ",
        operationType: "add",
        targetTripDayId: " day-1 ",
        title: " Museu ",
      },
    ]);
    const command = createApplyProposalItemsCommand(original);

    expect(Object.isFrozen(command)).toBe(true);
    expect(Object.isFrozen(command.items)).toBe(true);
    expect(Object.isFrozen(command.items[0])).toBe(true);
    expect(original.tripId).toBe(" trip-1 ");
    expect(original.items[0]?.proposedActivityId).toBe(" proposed-add ");
  });

  it.each([
    ["tripId", { tripId: " " }],
    ["itineraryId", { itineraryId: " " }],
    ["itineraryProposalId", { itineraryProposalId: " " }],
    ["expectedItineraryVersion", { expectedItineraryVersion: 0 }],
    ["expectedItineraryVersion", { expectedItineraryVersion: 1.5 }],
    ["idempotencyKey", { idempotencyKey: " " }],
  ])("rejeita raiz inválida em %s", (field, override) => {
    expect(() =>
      createApplyProposalItemsCommand({
        ...contractInput(),
        ...override,
      }),
    ).toThrowError(
      expect.objectContaining({
        fieldErrors: expect.objectContaining({
          [field]: expect.any(String),
        }),
      }),
    );
  });

  it("rejeita coleção ausente", () => {
    expect(() =>
      createApplyProposalItemsCommand({
        ...contractInput(),
        items: undefined,
      } as never),
    ).toThrowError(
      expect.objectContaining({
        fieldErrors: {
          items: "Informe uma coleção de itens.",
        },
      }),
    );
  });

  it("rejeita referência e dados inválidos", () => {
    expect(() =>
      createApplyProposalItemsCommand(
        contractInput([
          {
            proposedActivityId: "proposed-1",
            operationType: "add",
            targetTripDayId: " ",
            title: " ",
          },
        ]),
      ),
    ).toThrowError(ApplyProposalItemsCommandValidationError);

    expect(() =>
      createApplyProposalItemsCommand(
        contractInput([
          {
            proposedActivityId: "proposed-1",
            operationType: "move",
            sourceActivityId: " ",
            targetTripDayId: "day-2",
          },
        ]),
      ),
    ).toThrowError(ApplyProposalItemsCommandValidationError);

    expect(() =>
      createApplyProposalItemsCommand(
        contractInput([
          {
            proposedActivityId: "proposed-1",
            operationType: "add",
            targetTripDayId: "day-1",
            title: "Museu",
            startTime: "24:00",
          },
        ]),
      ),
    ).toThrowError(ApplyProposalItemsCommandValidationError);
  });

  it("rejeita operação desconhecida", () => {
    expect(() =>
      createApplyProposalItemsCommand(
        contractInput([
          {
            proposedActivityId: "proposed-1",
            operationType: "replace",
          } as never,
        ]),
      ),
    ).toThrowError(ApplyProposalItemsCommandValidationError);
  });

  it("expõe um port assíncrono sem implementação externa", async () => {
    const port: ApplyProposalItems = {
      async execute(command) {
        return {
          itineraryId: command.itineraryId,
          resultingItineraryVersion: command.expectedItineraryVersion + 1,
          appliedProposedActivityIds: command.items.map(
            (item) => item.proposedActivityId,
          ),
        };
      },
    };

    await expect(
      port.execute(createApplyProposalItemsCommand(contractInput())),
    ).resolves.toEqual({
      itineraryId: "itinerary-1",
      resultingItineraryVersion: 5,
      appliedProposedActivityIds: [],
    });
  });
});

describe("applyProposalItemsToItinerary", () => {
  it("aplica quatro operações em ordem com uma única nova versão", () => {
    const itinerary = createItineraryFixture();
    const original = structuredClone(itinerary);
    const protectedPeriod = structuredClone(
      itinerary.days[1]?.freePeriods[0],
    );
    const command = applicationInput([
      {
        proposedActivityId: "proposed-add",
        operationType: "add",
        targetTripDayId: "day-1",
        targetOrder: 2,
        title: "Museu",
        activityType: "place-visit",
        flexibility: "suggested",
        startTime: "09:30",
        durationMinutes: 90,
        placeId: "place-museu",
      },
      {
        proposedActivityId: "proposed-move",
        operationType: "move",
        sourceActivityId: "activity-3",
        targetTripDayId: "day-2",
        targetOrder: 1,
      },
      {
        proposedActivityId: "proposed-update",
        operationType: "update",
        sourceActivityId: "activity-2",
        title: "Jantar",
        startTime: "20:00",
        durationMinutes: 120,
      },
      {
        proposedActivityId: "proposed-remove",
        operationType: "remove",
        sourceActivityId: "activity-1",
      },
    ]);

    const applied = applyProposalItemsToItinerary(itinerary, command, {
      now: applicationTime,
      createActivityId: () => "activity-new",
    });

    expect(applied.itinerary.version).toBe(5);
    expect(applied.itinerary.updatedAt).toEqual(applicationTime);
    expect(
      applied.itinerary.days[0]?.activities.map(({ id, order }) => ({
        id,
        order,
      })),
    ).toEqual([
      { id: "activity-new", order: 1 },
      { id: "activity-fixed", order: 2 },
    ]);
    expect(applied.itinerary.days[0]?.activities[0]).toMatchObject({
      title: "Museu",
      type: "place-visit",
      status: "planned",
      flexibility: "suggested",
      startTime: "09:30",
      durationMinutes: 90,
      placeId: "place-museu",
      createdAt: applicationTime,
      updatedAt: applicationTime,
    });
    expect(
      applied.itinerary.days[1]?.activities.map(({ id, order }) => ({
        id,
        order,
      })),
    ).toEqual([
      { id: "activity-3", order: 1 },
      { id: "activity-2", order: 2 },
    ]);
    expect(applied.itinerary.days[1]?.activities[1]).toMatchObject({
      id: "activity-2",
      title: "Jantar",
      type: "meal",
      status: "planned",
      flexibility: "flexible",
      startTime: "20:00",
      durationMinutes: 120,
      placeId: "place-restaurante",
      createdAt: baseTime,
      updatedAt: applicationTime,
    });
    expect(applied.itinerary.days[1]?.freePeriods[0]).toEqual(
      protectedPeriod,
    );
    expect(applied.result).toEqual({
      itineraryId: "itinerary-1",
      resultingItineraryVersion: 5,
      appliedProposedActivityIds: [
        "proposed-add",
        "proposed-move",
        "proposed-update",
        "proposed-remove",
      ],
    });
    expect(itinerary).toEqual(original);
    expect(applied.itinerary).not.toBe(itinerary);
    expect(applied.itinerary.days[1]?.freePeriods[0]).not.toBe(
      itinerary.days[1]?.freePeriods[0],
    );
  });

  it("aceita coleção vazia com versão única e cópia independente", () => {
    const itinerary = createItineraryFixture();
    const applied = applyProposalItemsToItinerary(
      itinerary,
      applicationInput([]),
      {
        now: applicationTime,
      },
    );

    expect(applied.itinerary).toEqual({
      ...itinerary,
      version: 5,
      updatedAt: applicationTime,
    });
    expect(applied.itinerary.days).not.toBe(itinerary.days);
    expect(applied.itinerary.days[1]?.freePeriods[0]).not.toBe(
      itinerary.days[1]?.freePeriods[0],
    );
    expect(applied.result.appliedProposedActivityIds).toEqual([]);
  });

  it("reposiciona uma Activity dentro do mesmo Dia", () => {
    const applied = applyProposalItemsToItinerary(
      createItineraryFixture(),
      applicationInput([
        {
          proposedActivityId: "proposed-move",
          operationType: "move",
          sourceActivityId: "activity-3",
          targetTripDayId: "day-1",
          targetOrder: 1,
        },
      ]),
      {
        now: applicationTime,
      },
    );

    expect(
      applied.itinerary.days[0]?.activities.map((activity) => activity.id),
    ).toEqual(["activity-3", "activity-1", "activity-fixed"]);
    expect(
      applied.itinerary.days[0]?.activities.map(
        (activity) => activity.order,
      ),
    ).toEqual([1, 2, 3]);
  });

  it("preserva tipo, flexibilidade e Place no update", () => {
    const applied = applyProposalItemsToItinerary(
      createItineraryFixture(),
      applicationInput([
        {
          proposedActivityId: "proposed-update",
          operationType: "update",
          sourceActivityId: "activity-2",
          title: "Almoço sem horário",
        },
      ]),
      {
        now: applicationTime,
      },
    );
    const activity = applied.itinerary.days[1]?.activities[0];

    expect(activity).toMatchObject({
      id: "activity-2",
      title: "Almoço sem horário",
      type: "meal",
      flexibility: "flexible",
      placeId: "place-restaurante",
    });
    expect(activity?.startTime).toBeUndefined();
    expect(activity?.durationMinutes).toBeUndefined();
  });

  it.each([
    ["trip-mismatch", { tripId: "trip-2" }],
    ["itinerary-mismatch", { itineraryId: "itinerary-2" }],
    ["itinerary-version-mismatch", { expectedItineraryVersion: 3 }],
  ] as const)("rejeita %s antes de aplicar itens", (code, override) => {
    expectDomainError(
      () =>
        applyProposalItemsToItinerary(
          createItineraryFixture(),
          applicationInput([], override),
          {
            now: applicationTime,
          },
        ),
      code,
    );
  });

  it("rejeita Proposed Activity IDs duplicados", () => {
    expectDomainError(
      () =>
        applyProposalItemsToItinerary(
          createItineraryFixture(),
          applicationInput([
            {
              proposedActivityId: "duplicate",
              operationType: "add",
              targetTripDayId: "day-1",
              title: "Museu",
            },
            {
              proposedActivityId: "duplicate",
              operationType: "remove",
              sourceActivityId: "activity-1",
            },
          ]),
          {
            now: applicationTime,
          },
        ),
      "duplicate-proposed-activity-id",
      1,
    );
  });

  it("rejeita múltiplas operações sobre a mesma Activity", () => {
    expectDomainError(
      () =>
        applyProposalItemsToItinerary(
          createItineraryFixture(),
          applicationInput([
            {
              proposedActivityId: "update",
              operationType: "update",
              sourceActivityId: "activity-1",
              title: "Café cedo",
            },
            {
              proposedActivityId: "remove",
              operationType: "remove",
              sourceActivityId: "activity-1",
            },
          ]),
          {
            now: applicationTime,
          },
        ),
      "duplicate-source-activity-id",
      1,
    );
  });

  it("rejeita Dia alvo e Activity de origem inexistentes", () => {
    expectDomainError(
      () =>
        applyProposalItemsToItinerary(
          createItineraryFixture(),
          applicationInput([
            {
              proposedActivityId: "add",
              operationType: "add",
              targetTripDayId: "day-inexistente",
              title: "Museu",
            },
          ]),
          {
            now: applicationTime,
          },
        ),
      "target-trip-day-not-found",
      0,
    );

    expectDomainError(
      () =>
        applyProposalItemsToItinerary(
          createItineraryFixture(),
          applicationInput([
            {
              proposedActivityId: "remove",
              operationType: "remove",
              sourceActivityId: "activity-inexistente",
            },
          ]),
          {
            now: applicationTime,
          },
        ),
      "source-activity-not-found",
      0,
    );
  });

  it.each(["move", "update", "remove"] as const)(
    "protege Activity fixed contra %s",
    (operationType) => {
      let item: ApplyProposalItem;

      if (operationType === "move") {
        item = {
          proposedActivityId: "fixed",
          operationType,
          sourceActivityId: "activity-fixed",
          targetTripDayId: "day-2",
        };
      } else if (operationType === "update") {
        item = {
          proposedActivityId: "fixed",
          operationType,
          sourceActivityId: "activity-fixed",
          title: "Check-in alterado",
        };
      } else {
        item = {
          proposedActivityId: "fixed",
          operationType,
          sourceActivityId: "activity-fixed",
        };
      }

      expectDomainError(
        () =>
          applyProposalItemsToItinerary(
            createItineraryFixture(),
            applicationInput([item]),
            {
              now: applicationTime,
            },
          ),
        "fixed-activity-protected",
        0,
      );
    },
  );

  it("rejeita targetOrder fora da faixa", () => {
    expectDomainError(
      () =>
        applyProposalItemsToItinerary(
          createItineraryFixture(),
          applicationInput([
            {
              proposedActivityId: "add",
              operationType: "add",
              targetTripDayId: "day-1",
              targetOrder: 5,
              title: "Museu",
            },
          ]),
          {
            now: applicationTime,
          },
        ),
      "target-order-out-of-range",
      0,
    );

    expectDomainError(
      () =>
        applyProposalItemsToItinerary(
          createItineraryFixture(),
          applicationInput([
            {
              proposedActivityId: "move",
              operationType: "move",
              sourceActivityId: "activity-3",
              targetTripDayId: "day-2",
              targetOrder: 3,
            },
          ]),
          {
            now: applicationTime,
          },
        ),
      "target-order-out-of-range",
      0,
    );
  });

  it("rejeita ActivityId vazio ou já existente", () => {
    const command = applicationInput([
      {
        proposedActivityId: "add",
        operationType: "add",
        targetTripDayId: "day-1",
        title: "Museu",
      },
    ]);

    expectDomainError(
      () =>
        applyProposalItemsToItinerary(
          createItineraryFixture(),
          command,
          {
            now: applicationTime,
            createActivityId: () => " ",
          },
        ),
      "generated-activity-id-invalid",
      0,
    );
    expectDomainError(
      () =>
        applyProposalItemsToItinerary(
          createItineraryFixture(),
          command,
          {
            now: applicationTime,
            createActivityId: () => "activity-1",
          },
        ),
      "generated-activity-id-duplicate",
      0,
    );
  });

  it("rejeita identidade repetida entre duas Activities criadas", () => {
    expectDomainError(
      () =>
        applyProposalItemsToItinerary(
          createItineraryFixture(),
          applicationInput([
            {
              proposedActivityId: "add-1",
              operationType: "add",
              targetTripDayId: "day-1",
              title: "Museu",
            },
            {
              proposedActivityId: "add-2",
              operationType: "add",
              targetTripDayId: "day-2",
              title: "Mirante",
            },
          ]),
          {
            now: applicationTime,
            createActivityId: () => "activity-new",
          },
        ),
      "generated-activity-id-duplicate",
      1,
    );
  });

  it("rejeita instante de aplicação inválido", () => {
    expectDomainError(
      () =>
        applyProposalItemsToItinerary(
          createItineraryFixture(),
          applicationInput([]),
          {
            now: new Date("invalid"),
          },
        ),
      "application-time-invalid",
    );
  });

  it("não expõe mutação parcial quando item posterior falha", () => {
    const itinerary = createItineraryFixture();
    const original = structuredClone(itinerary);

    expectDomainError(
      () =>
        applyProposalItemsToItinerary(
          itinerary,
          applicationInput([
            {
              proposedActivityId: "add",
              operationType: "add",
              targetTripDayId: "day-1",
              title: "Museu",
            },
            {
              proposedActivityId: "remove",
              operationType: "remove",
              sourceActivityId: "activity-inexistente",
            },
          ]),
          {
            now: applicationTime,
            createActivityId: () => "activity-new",
          },
        ),
      "source-activity-not-found",
      1,
    );
    expect(itinerary).toEqual(original);
  });

  it("congela o envelope e o resultado", () => {
    const applied = applyProposalItemsToItinerary(
      createItineraryFixture(),
      applicationInput([]),
      {
        now: applicationTime,
      },
    );

    expect(Object.isFrozen(applied)).toBe(true);
    expect(Object.isFrozen(applied.result)).toBe(true);
    expect(
      Object.isFrozen(applied.result.appliedProposedActivityIds),
    ).toBe(true);
    expect(applied).toBeTypeOf("object");
    expect(applied.result).toBeTypeOf("object");
  });

  it("expõe erro de domínio específico", () => {
    expect(() =>
      applyProposalItemsToItinerary(
        createItineraryFixture(),
        applicationInput([], {
          expectedItineraryVersion: 3,
        }),
        {
          now: applicationTime,
        },
      ),
    ).toThrowError(ApplyProposalItemsDomainError);
  });
});
