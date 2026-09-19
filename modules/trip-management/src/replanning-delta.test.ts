import { describe, expect, it } from "vitest";

import type { ApplyProposalItem } from "./proposal-application";
import { ReplanningDeltaValidationError, validateReplanningDelta } from "./replanning-delta";
import type { ReplanningWindow } from "./replanning-window";

const window: ReplanningWindow = Object.freeze({
  capturedAt: new Date("2026-08-23T15:00:00.000Z"),
  timeZone: "America/Fortaleza",
  localDate: "2026-08-23",
  localTime: "12:00",
  eligibleDayIds: Object.freeze(["day-current", "day-future"]),
  eligibleActivityIds: Object.freeze(["activity-current-future", "activity-future"]),
  protectedActivityIds: Object.freeze(["activity-past", "activity-fixed"]),
  reasonByActivityId: Object.freeze({
    "activity-past": "PAST_DAY",
    "activity-fixed": "FIXED_ACTIVITY",
  }),
});

describe("validateReplanningDelta", () => {
  it("aceita add em Dia elegível", () => {
    const items: readonly ApplyProposalItem[] = [
      {
        proposedActivityId: "proposal-add",
        operationType: "add",
        targetTripDayId: "day-future",
        title: "Novo passeio",
      },
    ];

    const result = validateReplanningDelta(window, items);

    expect(result).toEqual(items);
    expect(result).not.toBe(items);
  });

  it("aceita move quando origem e destino são elegíveis", () => {
    const items: readonly ApplyProposalItem[] = [
      {
        proposedActivityId: "proposal-move",
        operationType: "move",
        sourceActivityId: "activity-future",
        targetTripDayId: "day-current",
      },
    ];

    expect(validateReplanningDelta(window, items)).toEqual(items);
  });

  it.each(["update", "remove"] as const)("aceita %s para Activity elegível", (operationType) => {
    const item: ApplyProposalItem =
      operationType === "update"
        ? {
            proposedActivityId: "proposal-update",
            operationType,
            sourceActivityId: "activity-future",
            title: "Passeio atualizado",
          }
        : {
            proposedActivityId: "proposal-remove",
            operationType,
            sourceActivityId: "activity-future",
          };

    expect(validateReplanningDelta(window, [item])).toEqual([item]);
  });

  it("rejeita Dia alvo fora da janela", () => {
    try {
      validateReplanningDelta(window, [
        {
          proposedActivityId: "proposal-add",
          operationType: "add",
          targetTripDayId: "day-past",
          title: "Inválida",
        },
      ]);
      throw new Error("A validação deveria falhar.");
    } catch (error) {
      expect(error).toBeInstanceOf(ReplanningDeltaValidationError);
      expect((error as ReplanningDeltaValidationError).code).toBe("target-day-outside-window");
    }
  });

  it("rejeita Activity protegida e preserva o motivo estruturado", () => {
    try {
      validateReplanningDelta(window, [
        {
          proposedActivityId: "proposal-remove",
          operationType: "remove",
          sourceActivityId: "activity-fixed",
        },
      ]);
      throw new Error("A validação deveria falhar.");
    } catch (error) {
      expect(error).toBeInstanceOf(ReplanningDeltaValidationError);
      const validationError = error as ReplanningDeltaValidationError;
      expect(validationError.code).toBe("source-activity-outside-window");
      expect(validationError.protectionReason).toBe("FIXED_ACTIVITY");
    }
  });

  it("rejeita move quando a origem está protegida antes de avaliar o destino", () => {
    try {
      validateReplanningDelta(window, [
        {
          proposedActivityId: "proposal-move",
          operationType: "move",
          sourceActivityId: "activity-past",
          targetTripDayId: "day-past",
        },
      ]);
      throw new Error("A validação deveria falhar.");
    } catch (error) {
      const validationError = error as ReplanningDeltaValidationError;
      expect(validationError.code).toBe("source-activity-outside-window");
      expect(validationError.protectionReason).toBe("PAST_DAY");
    }
  });

  it("rejeita ProposedActivityId duplicado", () => {
    const items: readonly ApplyProposalItem[] = [
      {
        proposedActivityId: "same-id",
        operationType: "add",
        targetTripDayId: "day-future",
        title: "Primeira",
      },
      {
        proposedActivityId: "same-id",
        operationType: "remove",
        sourceActivityId: "activity-future",
      },
    ];

    expect(() => validateReplanningDelta(window, items)).toThrow(ReplanningDeltaValidationError);
  });

  it("rejeita janela inconsistente", () => {
    const invalidWindow: ReplanningWindow = {
      ...window,
      eligibleActivityIds: ["activity-fixed"],
    };

    expect(() => validateReplanningDelta(invalidWindow, [])).toThrow(
      ReplanningDeltaValidationError,
    );
  });

  it("não muta itens nem a janela", () => {
    const items: readonly ApplyProposalItem[] = [
      {
        proposedActivityId: "proposal-update",
        operationType: "update",
        sourceActivityId: "activity-future",
        title: "Atualizada",
      },
    ];
    const beforeItems = structuredClone(items);
    const beforeWindow = structuredClone(window);

    validateReplanningDelta(window, items);

    expect(items).toEqual(beforeItems);
    expect(window).toEqual(beforeWindow);
  });
});
