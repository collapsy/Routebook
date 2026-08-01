import type { ActivityFlexibility, ActivityType } from "./itinerary";

export const applyProposalItemOperationTypes = ["add", "move", "update", "remove"] as const;

export type ApplyProposalItemOperationType = (typeof applyProposalItemOperationTypes)[number];

type ActivityDraft = Readonly<{
  title: string;
  activityType?: ActivityType;
  flexibility?: ActivityFlexibility;
  startTime?: string;
  durationMinutes?: number;
  placeId?: string;
}>;

export type AddProposalItem = ActivityDraft &
  Readonly<{
    proposedActivityId: string;
    operationType: "add";
    targetTripDayId: string;
    targetOrder?: number;
  }>;

export type MoveProposalItem = Readonly<{
  proposedActivityId: string;
  operationType: "move";
  sourceActivityId: string;
  targetTripDayId: string;
  targetOrder?: number;
}>;

export type UpdateProposalItem = ActivityDraft &
  Readonly<{
    proposedActivityId: string;
    operationType: "update";
    sourceActivityId: string;
  }>;

export type RemoveProposalItem = Readonly<{
  proposedActivityId: string;
  operationType: "remove";
  sourceActivityId: string;
}>;

export type ApplyProposalItem =
  AddProposalItem | MoveProposalItem | UpdateProposalItem | RemoveProposalItem;

export type ApplyProposalItemsCommandInput = Readonly<{
  tripId: string;
  itineraryId: string;
  itineraryProposalId: string;
  expectedItineraryVersion: number;
  idempotencyKey: string;
  items: readonly ApplyProposalItem[];
}>;

export type ApplyProposalItemsCommand = ApplyProposalItemsCommandInput;

export type ApplyProposalItemsResult = Readonly<{
  itineraryId: string;
  resultingItineraryVersion: number;
  appliedProposedActivityIds: readonly string[];
}>;

export interface ApplyProposalItems {
  execute(command: ApplyProposalItemsCommand): Promise<ApplyProposalItemsResult>;
}

export class ApplyProposalItemsCommandValidationError extends Error {
  constructor(readonly fieldErrors: Readonly<Record<string, string>>) {
    super("O comando ApplyProposalItems possui dados inválidos.");
    this.name = "ApplyProposalItemsCommandValidationError";
  }
}

function requiredText(value: string, field: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    throw new ApplyProposalItemsCommandValidationError({
      [field]: "Informe um valor não vazio.",
    });
  }
  return normalized;
}

function optionalText(value: string | undefined, field: string): string | undefined {
  return value === undefined ? undefined : requiredText(value, field);
}

function positiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new ApplyProposalItemsCommandValidationError({
      [field]: "Use um inteiro positivo.",
    });
  }
  return value;
}

function optionalPositiveInteger(value: number | undefined, field: string): number | undefined {
  return value === undefined ? undefined : positiveInteger(value, field);
}

function optionalLocalTime(value: string | undefined, field: string): string | undefined {
  const normalized = optionalText(value, field);
  if (normalized === undefined) return undefined;
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(normalized)) {
    throw new ApplyProposalItemsCommandValidationError({
      [field]: "Use um horário local no formato HH:mm.",
    });
  }
  return normalized;
}

function optionalActivityType(
  value: ActivityType | undefined,
  field: string,
): ActivityType | undefined {
  if (value === undefined) return undefined;

  const allowed: readonly ActivityType[] = [
    "place-visit",
    "meal",
    "tour",
    "transport",
    "rest",
    "custom",
    "check-in",
    "check-out",
    "free-form",
  ];
  if (!allowed.includes(value)) {
    throw new ApplyProposalItemsCommandValidationError({
      [field]: "Use um tipo de Activity válido.",
    });
  }
  return value;
}

function optionalFlexibility(
  value: ActivityFlexibility | undefined,
  field: string,
): ActivityFlexibility | undefined {
  if (value === undefined) return undefined;
  const allowed: readonly ActivityFlexibility[] = ["fixed", "flexible", "suggested"];
  if (!allowed.includes(value)) {
    throw new ApplyProposalItemsCommandValidationError({
      [field]: "Use fixed, flexible ou suggested.",
    });
  }
  return value;
}

function normalizeActivityDraft(item: ActivityDraft, field: string): ActivityDraft {
  const activityType = optionalActivityType(item.activityType, `${field}.activityType`);
  const flexibility = optionalFlexibility(item.flexibility, `${field}.flexibility`);
  const startTime = optionalLocalTime(item.startTime, `${field}.startTime`);
  const durationMinutes = optionalPositiveInteger(item.durationMinutes, `${field}.durationMinutes`);
  const placeId = optionalText(item.placeId, `${field}.placeId`);

  return {
    title: requiredText(item.title, `${field}.title`),
    ...(activityType !== undefined ? { activityType } : {}),
    ...(flexibility !== undefined ? { flexibility } : {}),
    ...(startTime !== undefined ? { startTime } : {}),
    ...(durationMinutes !== undefined ? { durationMinutes } : {}),
    ...(placeId !== undefined ? { placeId } : {}),
  };
}

function normalizeItem(item: ApplyProposalItem, index: number): ApplyProposalItem {
  const field = `items.${index}`;
  if (!item || typeof item !== "object") {
    throw new ApplyProposalItemsCommandValidationError({
      [field]: "Informe um item de aplicação válido.",
    });
  }

  const proposedActivityId = requiredText(item.proposedActivityId, `${field}.proposedActivityId`);

  switch (item.operationType) {
    case "add": {
      const targetOrder = optionalPositiveInteger(item.targetOrder, `${field}.targetOrder`);
      return Object.freeze({
        proposedActivityId,
        operationType: item.operationType,
        targetTripDayId: requiredText(item.targetTripDayId, `${field}.targetTripDayId`),
        ...normalizeActivityDraft(item, field),
        ...(targetOrder !== undefined ? { targetOrder } : {}),
      });
    }
    case "move": {
      const targetOrder = optionalPositiveInteger(item.targetOrder, `${field}.targetOrder`);
      return Object.freeze({
        proposedActivityId,
        operationType: item.operationType,
        sourceActivityId: requiredText(item.sourceActivityId, `${field}.sourceActivityId`),
        targetTripDayId: requiredText(item.targetTripDayId, `${field}.targetTripDayId`),
        ...(targetOrder !== undefined ? { targetOrder } : {}),
      });
    }
    case "update":
      return Object.freeze({
        proposedActivityId,
        operationType: item.operationType,
        sourceActivityId: requiredText(item.sourceActivityId, `${field}.sourceActivityId`),
        ...normalizeActivityDraft(item, field),
      });
    case "remove":
      return Object.freeze({
        proposedActivityId,
        operationType: item.operationType,
        sourceActivityId: requiredText(item.sourceActivityId, `${field}.sourceActivityId`),
      });
    default:
      throw new ApplyProposalItemsCommandValidationError({
        [`${field}.operationType`]: "Use add, move, update ou remove.",
      });
  }
}

export function createApplyProposalItemsCommand(
  input: ApplyProposalItemsCommandInput,
): ApplyProposalItemsCommand {
  if (!input || typeof input !== "object") {
    throw new ApplyProposalItemsCommandValidationError({
      command: "Informe um comando ApplyProposalItems válido.",
    });
  }
  if (!Array.isArray(input.items)) {
    throw new ApplyProposalItemsCommandValidationError({
      items: "Informe uma coleção de itens.",
    });
  }

  const items = Object.freeze(input.items.map(normalizeItem));
  return Object.freeze({
    tripId: requiredText(input.tripId, "tripId"),
    itineraryId: requiredText(input.itineraryId, "itineraryId"),
    itineraryProposalId: requiredText(input.itineraryProposalId, "itineraryProposalId"),
    expectedItineraryVersion: positiveInteger(
      input.expectedItineraryVersion,
      "expectedItineraryVersion",
    ),
    idempotencyKey: requiredText(input.idempotencyKey, "idempotencyKey"),
    items,
  });
}
