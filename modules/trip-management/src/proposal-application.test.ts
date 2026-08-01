import { describe, expect, it } from "vitest";

import {
  applyProposalItemOperationTypes,
  ApplyProposalItemsCommandValidationError,
  createApplyProposalItemsCommand,
  type ApplyProposalItem,
  type ApplyProposalItems,
} from "./proposal-application";

function input(items: readonly ApplyProposalItem[] = []) {
  return {
    tripId: " trip-1 ",
    itineraryId: " itinerary-1 ",
    itineraryProposalId: " proposal-1 ",
    expectedItineraryVersion: 4,
    idempotencyKey: " accept-proposal-1 ",
    items,
  } as const;
}

describe("contrato ApplyProposalItems", () => {
  it("publica somente as quatro operações canônicas", () => {
    expect(applyProposalItemOperationTypes).toEqual(["add", "move", "update", "remove"]);
  });

  it("normaliza as quatro variantes e preserva a coleção vazia como válida", () => {
    const command = createApplyProposalItemsCommand(
      input([
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

    expect(command).toEqual({
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      itineraryProposalId: "proposal-1",
      expectedItineraryVersion: 4,
      idempotencyKey: "accept-proposal-1",
      items: [
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
      ],
    });
    expect(createApplyProposalItemsCommand(input()).items).toEqual([]);
  });

  it("congela o comando, a coleção e cada item sem mutar o input", () => {
    const original = input([
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
    expect(() => createApplyProposalItemsCommand({ ...input(), ...override })).toThrowError(
      expect.objectContaining({
        fieldErrors: expect.objectContaining({ [field]: expect.any(String) }),
      }),
    );
  });

  it("rejeita coleção ausente", () => {
    expect(() =>
      createApplyProposalItemsCommand({ ...input(), items: undefined } as never),
    ).toThrowError(
      expect.objectContaining({
        fieldErrors: { items: "Informe uma coleção de itens." },
      }),
    );
  });

  it.each([
    ["items.0.targetTripDayId", { operationType: "add", targetTripDayId: " ", title: "Museu" }],
    [
      "items.0.sourceActivityId",
      {
        operationType: "move",
        sourceActivityId: " ",
        targetTripDayId: "day-2",
      },
    ],
    [
      "items.0.targetTripDayId",
      {
        operationType: "move",
        sourceActivityId: "activity-1",
        targetTripDayId: " ",
      },
    ],
    [
      "items.0.sourceActivityId",
      {
        operationType: "update",
        sourceActivityId: " ",
        title: "Museu",
      },
    ],
    ["items.0.sourceActivityId", { operationType: "remove", sourceActivityId: " " }],
  ])("rejeita referência obrigatória em %s", (field, item) => {
    expect(() =>
      createApplyProposalItemsCommand(
        input([{ proposedActivityId: "proposed-1", ...item } as ApplyProposalItem]),
      ),
    ).toThrowError(
      expect.objectContaining({
        fieldErrors: expect.objectContaining({ [field]: expect.any(String) }),
      }),
    );
  });

  it.each([
    ["items.0.title", { title: " " }],
    ["items.0.activityType", { activityType: "flight" }],
    ["items.0.flexibility", { flexibility: "automatic" }],
    ["items.0.startTime", { startTime: "24:00" }],
    ["items.0.durationMinutes", { durationMinutes: 0 }],
    ["items.0.targetOrder", { targetOrder: 0 }],
    ["items.0.placeId", { placeId: " " }],
  ])("rejeita dado de Activity inválido em %s", (field, override) => {
    expect(() =>
      createApplyProposalItemsCommand(
        input([
          {
            proposedActivityId: "proposed-1",
            operationType: "add",
            targetTripDayId: "day-1",
            title: "Museu",
            ...override,
          } as ApplyProposalItem,
        ]),
      ),
    ).toThrowError(
      expect.objectContaining({
        fieldErrors: expect.objectContaining({ [field]: expect.any(String) }),
      }),
    );
  });

  it("rejeita operação desconhecida", () => {
    expect(() =>
      createApplyProposalItemsCommand(
        input([
          {
            proposedActivityId: "proposed-1",
            operationType: "replace",
          } as never,
        ]),
      ),
    ).toThrowError(ApplyProposalItemsCommandValidationError);
  });

  it("expõe um port assíncrono sem implementação ou dependência externa", async () => {
    const port: ApplyProposalItems = {
      async execute(command) {
        return {
          itineraryId: command.itineraryId,
          resultingItineraryVersion: command.expectedItineraryVersion + 1,
          appliedProposedActivityIds: command.items.map((item) => item.proposedActivityId),
        };
      },
    };

    await expect(port.execute(createApplyProposalItemsCommand(input()))).resolves.toEqual({
      itineraryId: "itinerary-1",
      resultingItineraryVersion: 5,
      appliedProposedActivityIds: [],
    });
  });
});
