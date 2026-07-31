import { createHash, randomUUID } from "node:crypto";

const planningConflictIdBrand: unique symbol = Symbol("PlanningConflictId");
const planningConflictFingerprintBrand: unique symbol = Symbol("PlanningConflictFingerprint");
const planningConflictLineageKeyBrand: unique symbol = Symbol("PlanningConflictLineageKey");

export type PlanningConflictId = string & { readonly [planningConflictIdBrand]: true };
export type PlanningConflictFingerprint = string & {
  readonly [planningConflictFingerprintBrand]: true;
};
export type PlanningConflictLineageKey = string & {
  readonly [planningConflictLineageKeyBrand]: true;
};

export const planningConflictTypes = [
  "activity-time-overlap",
  "activity-outside-trip-period",
  "activity-day-mismatch",
  "invalid-activity-interval",
  "day-overloaded",
] as const;

export type PlanningConflictType = (typeof planningConflictTypes)[number];
export type PlanningConflictSeverity = "warning" | "critical";
export type PlanningConflictState = "detected" | "invalidated" | "superseded";
export type PlanningConflictEvidenceValue =
  string | number | boolean | null | readonly string[] | readonly number[];

export type PlanningConflictEvidence = Readonly<{
  code: string;
  facts: Readonly<Record<string, PlanningConflictEvidenceValue>>;
}>;

export type PlanningActivitySnapshot = Readonly<{
  id: string;
  tripId: string;
  dayId: string;
  scheduledDate?: string;
  startTime?: string;
  durationMinutes?: number;
}>;

export type PlanningDaySnapshot = Readonly<{
  id: string;
  tripId: string;
  date: string;
  activities: readonly PlanningActivitySnapshot[];
}>;

export type PlanningConflictContextSnapshot = Readonly<{
  schemaVersion: 1;
  tripId: string;
  tripStartDate: string;
  tripEndDate: string;
  itineraryId: string;
  itineraryVersion: number;
  capturedAt: Date;
  days: readonly PlanningDaySnapshot[];
}>;

export type PlanningConflict = Readonly<{
  id: PlanningConflictId;
  tripId: string;
  type: PlanningConflictType;
  severity: PlanningConflictSeverity;
  state: PlanningConflictState;
  contextSnapshot: PlanningConflictContextSnapshot;
  evidence: readonly PlanningConflictEvidence[];
  relatedDayIds: readonly string[];
  relatedActivityIds: readonly string[];
  detectedAt: Date;
  policyVersion: string;
  contextFingerprint: PlanningConflictFingerprint;
  lineageKey: PlanningConflictLineageKey;
  invalidatedAt?: Date;
  supersededAt?: Date;
  supersededByPlanningConflictId?: PlanningConflictId;
}>;

export type CreatePlanningConflictInput = Readonly<{
  id?: string;
  tripId: string;
  type: PlanningConflictType;
  severity: PlanningConflictSeverity;
  state?: PlanningConflictState;
  contextSnapshot: PlanningConflictContextSnapshot;
  evidence: readonly PlanningConflictEvidence[];
  relatedDayIds?: readonly string[];
  relatedActivityIds?: readonly string[];
  detectedAt: Date;
  policyVersion: string;
  contextFingerprint: string;
  lineageKey: string;
  invalidatedAt?: Date;
  supersededAt?: Date;
  supersededByPlanningConflictId?: string;
}>;

export class PlanningConflictValidationError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Readonly<Record<string, string>>,
  ) {
    super(message);
    this.name = "PlanningConflictValidationError";
  }
}

export class PlanningConflictTransitionError extends Error {
  constructor(
    message: string,
    readonly code: "not-detected" | "invalid-supersession",
  ) {
    super(message);
    this.name = "PlanningConflictTransitionError";
  }
}

function requiredText(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new PlanningConflictValidationError("PlanningConflict inválido.", {
      [field]: "Informe um valor não vazio.",
    });
  }
  return normalized;
}

function validDate(value: Date, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new PlanningConflictValidationError("PlanningConflict inválido.", {
      [field]: "Informe uma data válida.",
    });
  }
  return new Date(value.getTime());
}

function localDate(value: string, field: string): string {
  const normalized = requiredText(value, field);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(normalized) ||
    Number.isNaN(Date.parse(`${normalized}T00:00:00Z`))
  ) {
    throw new PlanningConflictValidationError("PlanningConflict inválido.", {
      [field]: "Use uma data local válida no formato YYYY-MM-DD.",
    });
  }
  return normalized;
}

function positiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new PlanningConflictValidationError("PlanningConflict inválido.", {
      [field]: "Use um inteiro positivo.",
    });
  }
  return value;
}

function uniqueSorted(values: readonly string[], field: string): readonly string[] {
  const normalized = values.map((value, index) => requiredText(value, `${field}.${index}`)).sort();
  return Object.freeze([...new Set(normalized)]);
}

function normalizeEvidenceValue(
  value: PlanningConflictEvidenceValue,
): PlanningConflictEvidenceValue {
  if (Array.isArray(value)) {
    return Object.freeze([...value]);
  }
  return value;
}

function normalizeEvidence(
  evidence: readonly PlanningConflictEvidence[],
): readonly PlanningConflictEvidence[] {
  if (evidence.length < 1) {
    throw new PlanningConflictValidationError("PlanningConflict inválido.", {
      evidence: "Informe ao menos uma evidência estruturada.",
    });
  }

  return Object.freeze(
    evidence.map((item, index) => {
      const code = requiredText(item.code, `evidence.${index}.code`);
      const facts = Object.fromEntries(
        Object.entries(item.facts)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([key, value]) => [
            requiredText(key, `evidence.${index}.facts`),
            normalizeEvidenceValue(value),
          ]),
      );
      return Object.freeze({ code, facts: Object.freeze(facts) });
    }),
  );
}

export function normalizePlanningConflictContextSnapshot(
  snapshot: PlanningConflictContextSnapshot,
): PlanningConflictContextSnapshot {
  const tripId = requiredText(snapshot.tripId, "contextSnapshot.tripId");
  const tripStartDate = localDate(snapshot.tripStartDate, "contextSnapshot.tripStartDate");
  const tripEndDate = localDate(snapshot.tripEndDate, "contextSnapshot.tripEndDate");
  if (tripEndDate < tripStartDate) {
    throw new PlanningConflictValidationError("PlanningConflict inválido.", {
      "contextSnapshot.tripEndDate": "A data final não pode ser anterior à data inicial.",
    });
  }

  const seenDayIds = new Set<string>();
  const seenActivityIds = new Set<string>();
  const days = snapshot.days
    .map((day, dayIndex) => {
      const id = requiredText(day.id, `contextSnapshot.days.${dayIndex}.id`);
      if (seenDayIds.has(id)) {
        throw new PlanningConflictValidationError("PlanningConflict inválido.", {
          "contextSnapshot.days": "Os Dias devem possuir identificadores únicos.",
        });
      }
      seenDayIds.add(id);

      const dayTripId = requiredText(day.tripId, `contextSnapshot.days.${dayIndex}.tripId`);
      if (dayTripId !== tripId) {
        throw new PlanningConflictValidationError("Snapshot cross-trip rejeitado.", {
          [`contextSnapshot.days.${dayIndex}.tripId`]: "O Dia deve pertencer à mesma Trip.",
        });
      }

      const date = localDate(day.date, `contextSnapshot.days.${dayIndex}.date`);
      const activities = day.activities
        .map((activity, activityIndex) => {
          const activityId = requiredText(
            activity.id,
            `contextSnapshot.days.${dayIndex}.activities.${activityIndex}.id`,
          );
          if (seenActivityIds.has(activityId)) {
            throw new PlanningConflictValidationError("PlanningConflict inválido.", {
              "contextSnapshot.days.activities":
                "As Activities devem possuir identificadores únicos.",
            });
          }
          seenActivityIds.add(activityId);

          const activityTripId = requiredText(
            activity.tripId,
            `contextSnapshot.days.${dayIndex}.activities.${activityIndex}.tripId`,
          );
          if (activityTripId !== tripId) {
            throw new PlanningConflictValidationError("Snapshot cross-trip rejeitado.", {
              [`contextSnapshot.days.${dayIndex}.activities.${activityIndex}.tripId`]:
                "A Activity deve pertencer à mesma Trip.",
            });
          }

          return Object.freeze({
            id: activityId,
            tripId: activityTripId,
            dayId: requiredText(
              activity.dayId,
              `contextSnapshot.days.${dayIndex}.activities.${activityIndex}.dayId`,
            ),
            ...(activity.scheduledDate !== undefined
              ? {
                  scheduledDate: localDate(
                    activity.scheduledDate,
                    `contextSnapshot.days.${dayIndex}.activities.${activityIndex}.scheduledDate`,
                  ),
                }
              : {}),
            ...(activity.startTime !== undefined ? { startTime: activity.startTime.trim() } : {}),
            ...(activity.durationMinutes !== undefined
              ? { durationMinutes: activity.durationMinutes }
              : {}),
          });
        })
        .sort((left, right) => left.id.localeCompare(right.id));

      return Object.freeze({
        id,
        tripId: dayTripId,
        date,
        activities: Object.freeze(activities),
      });
    })
    .sort((left, right) => left.date.localeCompare(right.date) || left.id.localeCompare(right.id));

  return Object.freeze({
    schemaVersion: 1,
    tripId,
    tripStartDate,
    tripEndDate,
    itineraryId: requiredText(snapshot.itineraryId, "contextSnapshot.itineraryId"),
    itineraryVersion: positiveInteger(
      snapshot.itineraryVersion,
      "contextSnapshot.itineraryVersion",
    ),
    capturedAt: validDate(snapshot.capturedAt, "contextSnapshot.capturedAt"),
    days: Object.freeze(days),
  });
}

export function createPlanningConflictId(value: string = randomUUID()): PlanningConflictId {
  return requiredText(value, "planningConflictId") as PlanningConflictId;
}

export function createPlanningConflictFingerprint(value: string): PlanningConflictFingerprint {
  const normalized = requiredText(value, "contextFingerprint").toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(normalized)) {
    throw new PlanningConflictValidationError("PlanningConflict inválido.", {
      contextFingerprint: "Use um SHA-256 hexadecimal com 64 caracteres.",
    });
  }
  return normalized as PlanningConflictFingerprint;
}

export function createPlanningConflictLineageKey(value: string): PlanningConflictLineageKey {
  const normalized = requiredText(value, "lineageKey").toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(normalized)) {
    throw new PlanningConflictValidationError("PlanningConflict inválido.", {
      lineageKey: "Use um SHA-256 hexadecimal com 64 caracteres.",
    });
  }
  return normalized as PlanningConflictLineageKey;
}

export function derivePlanningConflictId(fingerprint: string): PlanningConflictId {
  const hash = createHash("sha256").update(fingerprint).digest("hex");
  const uuid = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
  return createPlanningConflictId(uuid);
}

export function createPlanningConflict(input: CreatePlanningConflictInput): PlanningConflict {
  const tripId = requiredText(input.tripId, "tripId");
  const contextSnapshot = normalizePlanningConflictContextSnapshot(input.contextSnapshot);
  if (contextSnapshot.tripId !== tripId) {
    throw new PlanningConflictValidationError(
      "PlanningConflict incompatível com o Context Snapshot.",
      {
        "contextSnapshot.tripId": "O snapshot deve pertencer à mesma Trip.",
      },
    );
  }

  if (!planningConflictTypes.includes(input.type)) {
    throw new PlanningConflictValidationError("PlanningConflict inválido.", {
      type: "Use um tipo canônico de PlanningConflict.",
    });
  }
  if (input.severity !== "warning" && input.severity !== "critical") {
    throw new PlanningConflictValidationError("PlanningConflict inválido.", {
      severity: "Use warning ou critical.",
    });
  }

  const state = input.state ?? "detected";
  const invalidatedAt = input.invalidatedAt
    ? validDate(input.invalidatedAt, "invalidatedAt")
    : undefined;
  const supersededAt = input.supersededAt
    ? validDate(input.supersededAt, "supersededAt")
    : undefined;
  const supersededByPlanningConflictId = input.supersededByPlanningConflictId
    ? createPlanningConflictId(input.supersededByPlanningConflictId)
    : undefined;

  if (state === "detected" && (invalidatedAt || supersededAt || supersededByPlanningConflictId)) {
    throw new PlanningConflictValidationError("PlanningConflict inválido.", {
      state: "Um conflito detectado não pode possuir dados de encerramento.",
    });
  }
  if (
    state === "invalidated" &&
    (!invalidatedAt || supersededAt || supersededByPlanningConflictId)
  ) {
    throw new PlanningConflictValidationError("PlanningConflict inválido.", {
      state: "Um conflito invalidado deve possuir apenas invalidatedAt.",
    });
  }
  if (
    state === "superseded" &&
    (!supersededAt || !supersededByPlanningConflictId || invalidatedAt)
  ) {
    throw new PlanningConflictValidationError("PlanningConflict inválido.", {
      state: "Um conflito superseded deve informar instante e substituto.",
    });
  }

  return Object.freeze({
    id: createPlanningConflictId(input.id),
    tripId,
    type: input.type,
    severity: input.severity,
    state,
    contextSnapshot,
    evidence: normalizeEvidence(input.evidence),
    relatedDayIds: uniqueSorted(input.relatedDayIds ?? [], "relatedDayIds"),
    relatedActivityIds: uniqueSorted(input.relatedActivityIds ?? [], "relatedActivityIds"),
    detectedAt: validDate(input.detectedAt, "detectedAt"),
    policyVersion: requiredText(input.policyVersion, "policyVersion"),
    contextFingerprint: createPlanningConflictFingerprint(input.contextFingerprint),
    lineageKey: createPlanningConflictLineageKey(input.lineageKey),
    ...(invalidatedAt ? { invalidatedAt } : {}),
    ...(supersededAt ? { supersededAt } : {}),
    ...(supersededByPlanningConflictId ? { supersededByPlanningConflictId } : {}),
  });
}

export function invalidatePlanningConflict(
  conflict: PlanningConflict,
  invalidatedAt: Date,
): PlanningConflict {
  if (conflict.state !== "detected") {
    throw new PlanningConflictTransitionError(
      "Somente PlanningConflicts detectados podem ser invalidados.",
      "not-detected",
    );
  }
  return createPlanningConflict({
    ...conflict,
    state: "invalidated",
    invalidatedAt,
  });
}

export function supersedePlanningConflict(
  conflict: PlanningConflict,
  supersededByPlanningConflictId: PlanningConflictId,
  supersededAt: Date,
): PlanningConflict {
  if (conflict.state !== "detected") {
    throw new PlanningConflictTransitionError(
      "Somente PlanningConflicts detectados podem ser superseded.",
      "not-detected",
    );
  }
  if (conflict.id === supersededByPlanningConflictId) {
    throw new PlanningConflictTransitionError(
      "Um PlanningConflict não pode superseder a si mesmo.",
      "invalid-supersession",
    );
  }
  return createPlanningConflict({
    ...conflict,
    state: "superseded",
    supersededAt,
    supersededByPlanningConflictId,
  });
}
