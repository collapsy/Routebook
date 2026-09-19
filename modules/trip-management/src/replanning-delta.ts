import type { ApplyProposalItem } from "./proposal-application";
import type {
  ReplanningWindow,
  ReplanningWindowProtectionReason,
} from "./replanning-window";

export type ReplanningDeltaValidationErrorCode =
  | "invalid-window"
  | "invalid-items"
  | "duplicate-proposed-activity"
  | "target-day-outside-window"
  | "source-activity-outside-window"
  | "invalid-operation";

export class ReplanningDeltaValidationError extends Error {
  constructor(
    message: string,
    readonly code: ReplanningDeltaValidationErrorCode,
    readonly itemIndex?: number,
    readonly protectionReason?: ReplanningWindowProtectionReason,
  ) {
    super(message);
    this.name = "ReplanningDeltaValidationError";
  }
}

function requiredText(value: string): string | undefined {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || undefined;
}

function normalizeWindow(window: ReplanningWindow): Readonly<{
  eligibleDays: ReadonlySet<string>;
  eligibleActivities: ReadonlySet<string>;
  protectedReasons: Readonly<Record<string, ReplanningWindowProtectionReason>>;
}> {
  if (
    !window ||
    typeof window !== "object" ||
    !Array.isArray(window.eligibleDayIds) ||
    !Array.isArray(window.eligibleActivityIds) ||
    !Array.isArray(window.protectedActivityIds) ||
    !window.reasonByActivityId ||
    typeof window.reasonByActivityId !== "object"
  ) {
    throw new ReplanningDeltaValidationError(
      "Informe uma ReplanningWindow válida.",
      "invalid-window",
    );
  }

  const eligibleDays = new Set<string>();
  for (const dayId of window.eligibleDayIds) {
    const normalized = requiredText(dayId);
    if (!normalized) {
      throw new ReplanningDeltaValidationError(
        "ReplanningWindow possui TripDayId elegível inválido.",
        "invalid-window",
      );
    }
    eligibleDays.add(normalized);
  }

  const eligibleActivities = new Set<string>();
  for (const activityId of window.eligibleActivityIds) {
    const normalized = requiredText(activityId);
    if (!normalized) {
      throw new ReplanningDeltaValidationError(
        "ReplanningWindow possui ActivityId elegível inválido.",
        "invalid-window",
      );
    }
    eligibleActivities.add(normalized);
  }

  for (const activityId of window.protectedActivityIds) {
    const normalized = requiredText(activityId);
    if (!normalized || eligibleActivities.has(normalized)) {
      throw new ReplanningDeltaValidationError(
        "ReplanningWindow possui classificação de Activity inconsistente.",
        "invalid-window",
      );
    }
    if (window.reasonByActivityId[normalized] === undefined) {
      throw new ReplanningDeltaValidationError(
        "Activity protegida deve possuir motivo estruturado.",
        "invalid-window",
      );
    }
  }

  return Object.freeze({
    eligibleDays,
    eligibleActivities,
    protectedReasons: window.reasonByActivityId,
  });
}

function assertTargetDay(
  targetTripDayId: string,
  itemIndex: number,
  eligibleDays: ReadonlySet<string>,
): void {
  const dayId = requiredText(targetTripDayId);
  if (!dayId || !eligibleDays.has(dayId)) {
    throw new ReplanningDeltaValidationError(
      "O Dia alvo está fora da ReplanningWindow.",
      "target-day-outside-window",
      itemIndex,
    );
  }
}

function assertSourceActivity(
  sourceActivityId: string,
  itemIndex: number,
  eligibleActivities: ReadonlySet<string>,
  protectedReasons: Readonly<Record<string, ReplanningWindowProtectionReason>>,
): void {
  const activityId = requiredText(sourceActivityId);
  if (!activityId || !eligibleActivities.has(activityId)) {
    throw new ReplanningDeltaValidationError(
      "A Activity de origem está fora da ReplanningWindow.",
      "source-activity-outside-window",
      itemIndex,
      activityId ? protectedReasons[activityId] : undefined,
    );
  }
}

export function validateReplanningDelta(
  window: ReplanningWindow,
  items: readonly ApplyProposalItem[],
): readonly ApplyProposalItem[] {
  const { eligibleDays, eligibleActivities, protectedReasons } = normalizeWindow(window);

  if (!Array.isArray(items)) {
    throw new ReplanningDeltaValidationError(
      "Informe uma coleção válida de operações de replanejamento.",
      "invalid-items",
    );
  }

  const proposedActivityIds = new Set<string>();

  items.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      throw new ReplanningDeltaValidationError(
        "Informe uma operação de replanejamento válida.",
        "invalid-items",
        index,
      );
    }

    const proposedActivityId = requiredText(item.proposedActivityId);
    if (!proposedActivityId) {
      throw new ReplanningDeltaValidationError(
        "Informe um ProposedActivityId válido.",
        "invalid-items",
        index,
      );
    }
    if (proposedActivityIds.has(proposedActivityId)) {
      throw new ReplanningDeltaValidationError(
        "Cada operação deve possuir ProposedActivityId único.",
        "duplicate-proposed-activity",
        index,
      );
    }
    proposedActivityIds.add(proposedActivityId);

    switch (item.operationType) {
      case "add":
        assertTargetDay(item.targetTripDayId, index, eligibleDays);
        return;
      case "move":
        assertSourceActivity(
          item.sourceActivityId,
          index,
          eligibleActivities,
          protectedReasons,
        );
        assertTargetDay(item.targetTripDayId, index, eligibleDays);
        return;
      case "update":
      case "remove":
        assertSourceActivity(
          item.sourceActivityId,
          index,
          eligibleActivities,
          protectedReasons,
        );
        return;
      default:
        throw new ReplanningDeltaValidationError(
          "Use add, move, update ou remove.",
          "invalid-operation",
          index,
        );
    }
  });

  return Object.freeze([...items]);
}
