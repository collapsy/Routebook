import { randomUUID } from "node:crypto";

import type {
  Activity,
  ActivityFlexibility,
  ActivityType,
  FreePeriod,
  Itinerary,
  ItineraryDay,
} from "./itinerary";

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

export type ApplyProposalItemsToItineraryOptions = Readonly<{
  now?: Date;
  createActivityId?: (item: AddProposalItem, index: number) => string;
}>;

export type AppliedProposalItemsToItinerary = Readonly<{
  itinerary: Itinerary;
  result: ApplyProposalItemsResult;
}>;

export type ApplyProposalItemsDomainErrorCode =
  | "trip-mismatch"
  | "itinerary-mismatch"
  | "itinerary-version-mismatch"
  | "duplicate-proposed-activity-id"
  | "duplicate-source-activity-id"
  | "target-trip-day-not-found"
  | "source-activity-not-found"
  | "fixed-activity-protected"
  | "target-order-out-of-range"
  | "generated-activity-id-invalid"
  | "generated-activity-id-duplicate"
  | "application-time-invalid";

export class ApplyProposalItemsCommandValidationError extends Error {
  constructor(readonly fieldErrors: Readonly<Record<string, string>>) {
    super("O comando ApplyProposalItems possui dados inválidos.");
    this.name = "ApplyProposalItemsCommandValidationError";
  }
}

export class ApplyProposalItemsDomainError extends Error {
  constructor(
    readonly code: ApplyProposalItemsDomainErrorCode,
    message: string,
    readonly itemIndex?: number,
  ) {
    super(message);
    this.name = "ApplyProposalItemsDomainError";
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

function copyDate(value: Date): Date {
  return new Date(value.getTime());
}

function cloneActivity(activity: Activity): Activity {
  return {
    id: activity.id,
    title: activity.title,
    type: activity.type,
    status: activity.status,
    flexibility: activity.flexibility,
    order: activity.order,
    createdAt: copyDate(activity.createdAt),
    updatedAt: copyDate(activity.updatedAt),
    ...(activity.startTime !== undefined ? { startTime: activity.startTime } : {}),
    ...(activity.durationMinutes !== undefined
      ? { durationMinutes: activity.durationMinutes }
      : {}),
    ...(activity.placeId !== undefined ? { placeId: activity.placeId } : {}),
  };
}

function cloneFreePeriod(freePeriod: FreePeriod): FreePeriod {
  return {
    id: freePeriod.id,
    mode: freePeriod.mode,
    order: freePeriod.order,
    createdAt: copyDate(freePeriod.createdAt),
    updatedAt: copyDate(freePeriod.updatedAt),
    ...(freePeriod.startTime !== undefined ? { startTime: freePeriod.startTime } : {}),
    ...(freePeriod.durationMinutes !== undefined
      ? { durationMinutes: freePeriod.durationMinutes }
      : {}),
  };
}

function cloneItinerary(itinerary: Itinerary): Itinerary {
  return {
    id: itinerary.id,
    tripId: itinerary.tripId,
    period: { ...itinerary.period },
    days: itinerary.days.map((day) => ({
      id: day.id,
      date: day.date,
      position: day.position,
      activities: day.activities.map(cloneActivity),
      freePeriods: day.freePeriods.map(cloneFreePeriod),
    })),
    version: itinerary.version,
    createdAt: copyDate(itinerary.createdAt),
    updatedAt: copyDate(itinerary.updatedAt),
  };
}

function validApplicationTime(value: Date): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new ApplyProposalItemsDomainError(
      "application-time-invalid",
      "Informe um instante válido para aplicar a Itinerary Proposal.",
    );
  }
  return copyDate(value);
}

function validateIdentityAndVersion(
  itinerary: Itinerary,
  command: ApplyProposalItemsCommand,
): void {
  if (itinerary.tripId !== command.tripId) {
    throw new ApplyProposalItemsDomainError(
      "trip-mismatch",
      "O Itinerary não pertence à Trip informada no comando.",
    );
  }
  if (itinerary.id !== command.itineraryId) {
    throw new ApplyProposalItemsDomainError(
      "itinerary-mismatch",
      "O Itinerary informado no comando não corresponde ao agregado carregado.",
    );
  }
  if (itinerary.version !== command.expectedItineraryVersion) {
    throw new ApplyProposalItemsDomainError(
      "itinerary-version-mismatch",
      "A ItineraryVersion atual não corresponde à versão esperada pela Proposal.",
    );
  }
}

function validateUniqueOperationReferences(items: readonly ApplyProposalItem[]): void {
  const proposedActivityIndexes = new Map<string, number>();
  const sourceActivityIndexes = new Map<string, number>();

  items.forEach((item, index) => {
    const proposedIndex = proposedActivityIndexes.get(item.proposedActivityId);
    if (proposedIndex !== undefined) {
      throw new ApplyProposalItemsDomainError(
        "duplicate-proposed-activity-id",
        `O Proposed Activity ID do item ${index} já foi usado no item ${proposedIndex}.`,
        index,
      );
    }
    proposedActivityIndexes.set(item.proposedActivityId, index);

    if (item.operationType === "add") return;

    const sourceIndex = sourceActivityIndexes.get(item.sourceActivityId);
    if (sourceIndex !== undefined) {
      throw new ApplyProposalItemsDomainError(
        "duplicate-source-activity-id",
        `A Activity canônica do item ${index} já possui operação no item ${sourceIndex}.`,
        index,
      );
    }
    sourceActivityIndexes.set(item.sourceActivityId, index);
  });
}

function findDay(itinerary: Itinerary, dayId: string): ItineraryDay | undefined {
  return itinerary.days.find((day) => day.id === dayId);
}

function requireTargetDay(itinerary: Itinerary, dayId: string, itemIndex: number): ItineraryDay {
  const day = findDay(itinerary, dayId);
  if (!day) {
    throw new ApplyProposalItemsDomainError(
      "target-trip-day-not-found",
      `O Dia alvo do item ${itemIndex} não pertence ao Itinerary.`,
      itemIndex,
    );
  }
  return day;
}

function findActivity(
  itinerary: Itinerary,
  activityId: string,
): Readonly<{ day: ItineraryDay; activity: Activity; index: number }> | undefined {
  for (const day of itinerary.days) {
    const index = day.activities.findIndex((activity) => activity.id === activityId);
    if (index >= 0) {
      const activity = day.activities[index];
      if (activity !== undefined) return { day, activity, index };
    }
  }
  return undefined;
}

function requireSourceActivity(
  itinerary: Itinerary,
  activityId: string,
  itemIndex: number,
): Readonly<{ day: ItineraryDay; activity: Activity; index: number }> {
  const source = findActivity(itinerary, activityId);
  if (!source) {
    throw new ApplyProposalItemsDomainError(
      "source-activity-not-found",
      `A Activity de origem do item ${itemIndex} não pertence ao Itinerary.`,
      itemIndex,
    );
  }
  return source;
}

function assertActivityCanChange(activity: Activity, itemIndex: number): void {
  if (activity.flexibility === "fixed") {
    throw new ApplyProposalItemsDomainError(
      "fixed-activity-protected",
      `A Activity de origem do item ${itemIndex} é fixed e não pode ser alterada pela Proposal.`,
      itemIndex,
    );
  }
}

function renumberActivities(day: ItineraryDay, now: Date): void {
  day.activities = day.activities.map((activity, index) => {
    const order = index + 1;
    return activity.order === order ? activity : { ...activity, order, updatedAt: copyDate(now) };
  });
}

function targetOrderOrAppend(
  day: ItineraryDay,
  targetOrder: number | undefined,
  itemIndex: number,
): number {
  const order = targetOrder ?? day.activities.length + 1;
  if (order < 1 || order > day.activities.length + 1) {
    throw new ApplyProposalItemsDomainError(
      "target-order-out-of-range",
      `A ordem alvo do item ${itemIndex} deve estar entre 1 e ${day.activities.length + 1}.`,
      itemIndex,
    );
  }
  return order;
}

function insertActivity(
  day: ItineraryDay,
  activity: Activity,
  targetOrder: number | undefined,
  now: Date,
  itemIndex: number,
): void {
  const order = targetOrderOrAppend(day, targetOrder, itemIndex);
  day.activities.splice(order - 1, 0, activity);
  renumberActivities(day, now);
}

function createCanonicalActivity(item: AddProposalItem, id: string, now: Date): Activity {
  return {
    id,
    title: item.title,
    type: item.activityType ?? "custom",
    status: "planned",
    flexibility: item.flexibility ?? "flexible",
    order: 0,
    createdAt: copyDate(now),
    updatedAt: copyDate(now),
    ...(item.startTime !== undefined ? { startTime: item.startTime } : {}),
    ...(item.durationMinutes !== undefined ? { durationMinutes: item.durationMinutes } : {}),
    ...(item.placeId !== undefined ? { placeId: item.placeId } : {}),
  };
}

function normalizeGeneratedActivityId(value: string, itemIndex: number): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    throw new ApplyProposalItemsDomainError(
      "generated-activity-id-invalid",
      `A identidade canônica gerada para o item ${itemIndex} é inválida.`,
      itemIndex,
    );
  }
  return normalized;
}

function applyAddItem(
  itinerary: Itinerary,
  item: AddProposalItem,
  itemIndex: number,
  now: Date,
  createActivityId: (item: AddProposalItem, index: number) => string,
  reservedActivityIds: Set<string>,
): void {
  const targetDay = requireTargetDay(itinerary, item.targetTripDayId, itemIndex);
  const activityId = normalizeGeneratedActivityId(createActivityId(item, itemIndex), itemIndex);
  if (reservedActivityIds.has(activityId)) {
    throw new ApplyProposalItemsDomainError(
      "generated-activity-id-duplicate",
      `A identidade canônica gerada para o item ${itemIndex} já existe no Itinerary ou nesta aplicação.`,
      itemIndex,
    );
  }
  reservedActivityIds.add(activityId);

  insertActivity(
    targetDay,
    createCanonicalActivity(item, activityId, now),
    item.targetOrder,
    now,
    itemIndex,
  );
}

function applyMoveItem(
  itinerary: Itinerary,
  item: MoveProposalItem,
  itemIndex: number,
  now: Date,
): void {
  const source = requireSourceActivity(itinerary, item.sourceActivityId, itemIndex);
  assertActivityCanChange(source.activity, itemIndex);
  requireTargetDay(itinerary, item.targetTripDayId, itemIndex);

  source.day.activities.splice(source.index, 1);
  renumberActivities(source.day, now);

  const targetDay = requireTargetDay(itinerary, item.targetTripDayId, itemIndex);
  insertActivity(
    targetDay,
    { ...source.activity, order: 0, updatedAt: copyDate(now) },
    item.targetOrder,
    now,
    itemIndex,
  );
}

function applyUpdateItem(
  itinerary: Itinerary,
  item: UpdateProposalItem,
  itemIndex: number,
  now: Date,
): void {
  const source = requireSourceActivity(itinerary, item.sourceActivityId, itemIndex);
  assertActivityCanChange(source.activity, itemIndex);

  source.day.activities[source.index] = {
    id: source.activity.id,
    title: item.title,
    type: item.activityType ?? source.activity.type,
    status: source.activity.status,
    flexibility: item.flexibility ?? source.activity.flexibility,
    order: source.activity.order,
    createdAt: copyDate(source.activity.createdAt),
    updatedAt: copyDate(now),
    ...(item.startTime !== undefined ? { startTime: item.startTime } : {}),
    ...(item.durationMinutes !== undefined ? { durationMinutes: item.durationMinutes } : {}),
    ...(item.placeId !== undefined
      ? { placeId: item.placeId }
      : source.activity.placeId !== undefined
        ? { placeId: source.activity.placeId }
        : {}),
  };
}

function applyRemoveItem(
  itinerary: Itinerary,
  item: RemoveProposalItem,
  itemIndex: number,
  now: Date,
): void {
  const source = requireSourceActivity(itinerary, item.sourceActivityId, itemIndex);
  assertActivityCanChange(source.activity, itemIndex);

  source.day.activities.splice(source.index, 1);
  renumberActivities(source.day, now);
}

export function applyProposalItemsToItinerary(
  itinerary: Itinerary,
  input: ApplyProposalItemsCommandInput,
  options: ApplyProposalItemsToItineraryOptions = {},
): AppliedProposalItemsToItinerary {
  const command = createApplyProposalItemsCommand(input);
  validateIdentityAndVersion(itinerary, command);
  validateUniqueOperationReferences(command.items);

  const now = validApplicationTime(options.now ?? new Date());
  const createActivityId =
    options.createActivityId ?? ((_item: AddProposalItem, _index: number) => randomUUID());
  const workingItinerary = cloneItinerary(itinerary);
  const reservedActivityIds = new Set(
    workingItinerary.days.flatMap((day) => day.activities.map((activity) => activity.id)),
  );

  command.items.forEach((item, index) => {
    switch (item.operationType) {
      case "add":
        applyAddItem(workingItinerary, item, index, now, createActivityId, reservedActivityIds);
        return;
      case "move":
        applyMoveItem(workingItinerary, item, index, now);
        return;
      case "update":
        applyUpdateItem(workingItinerary, item, index, now);
        return;
      case "remove":
        applyRemoveItem(workingItinerary, item, index, now);
        return;
    }
  });

  workingItinerary.version = itinerary.version + 1;
  workingItinerary.updatedAt = copyDate(now);

  const appliedProposedActivityIds = Object.freeze(
    command.items.map((item) => item.proposedActivityId),
  );
  const result = Object.freeze({
    itineraryId: workingItinerary.id,
    resultingItineraryVersion: workingItinerary.version,
    appliedProposedActivityIds,
  });

  return Object.freeze({ itinerary: workingItinerary, result });
}
