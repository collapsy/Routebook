import {
  createPlanningConflict,
  derivePlanningConflictId,
  normalizePlanningConflictContextSnapshot,
  type PlanningActivitySnapshot,
  type PlanningConflict,
  type PlanningConflictContextSnapshot,
  type PlanningConflictEvidence,
  type PlanningConflictSeverity,
  type PlanningConflictType,
  type PlanningDaySnapshot,
} from "./planning-conflict";
import {
  createPlanningConflictLineage,
  fingerprintPlanningConflict,
} from "./planning-conflict-fingerprint";

export const PLANNING_CONFLICT_POLICY_VERSION = "planning-conflict-v1";
export const MAX_DAY_ACTIVITY_COUNT = 8;
export const MAX_DAY_SCHEDULED_MINUTES = 720;

const typeOrder: Readonly<Record<PlanningConflictType, number>> = {
  "invalid-activity-interval": 0,
  "activity-outside-trip-period": 1,
  "activity-day-mismatch": 2,
  "activity-time-overlap": 3,
  "day-overloaded": 4,
};

type ActivityInterval = Readonly<{
  activity: PlanningActivitySnapshot;
  startMinutes: number;
  endMinutes: number;
}>;

type DetectedConflictInput = Readonly<{
  snapshot: PlanningConflictContextSnapshot;
  type: PlanningConflictType;
  severity: PlanningConflictSeverity;
  evidence: readonly PlanningConflictEvidence[];
  relatedDayIds: readonly string[];
  relatedActivityIds: readonly string[];
}>;

function toMinutes(value: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (hours === undefined || minutes === undefined) return null;
  return hours * 60 + minutes;
}

function validPositiveDuration(value: number | undefined): value is number {
  return value !== undefined && Number.isInteger(value) && value > 0;
}

function createDetectedConflict(input: DetectedConflictInput): PlanningConflict {
  const fingerprint = fingerprintPlanningConflict({
    tripId: input.snapshot.tripId,
    type: input.type,
    policyVersion: PLANNING_CONFLICT_POLICY_VERSION,
    relatedDayIds: input.relatedDayIds,
    relatedActivityIds: input.relatedActivityIds,
    evidence: input.evidence,
  });
  const lineageKey = createPlanningConflictLineage({
    tripId: input.snapshot.tripId,
    type: input.type,
    relatedDayIds: input.relatedDayIds,
    relatedActivityIds: input.relatedActivityIds,
  });

  return createPlanningConflict({
    id: derivePlanningConflictId(fingerprint),
    tripId: input.snapshot.tripId,
    type: input.type,
    severity: input.severity,
    contextSnapshot: input.snapshot,
    evidence: input.evidence,
    relatedDayIds: input.relatedDayIds,
    relatedActivityIds: input.relatedActivityIds,
    detectedAt: input.snapshot.capturedAt,
    policyVersion: PLANNING_CONFLICT_POLICY_VERSION,
    contextFingerprint: fingerprint,
    lineageKey,
  });
}

function invalidIntervalConflict(
  snapshot: PlanningConflictContextSnapshot,
  day: PlanningDaySnapshot,
  activity: PlanningActivitySnapshot,
): PlanningConflict | null {
  const startMinutes = activity.startTime === undefined ? null : toMinutes(activity.startTime);
  const duration = activity.durationMinutes;
  let reason: string | null = null;

  if (activity.startTime !== undefined && startMinutes === null) {
    reason = "invalid-start-time";
  } else if (duration !== undefined && !validPositiveDuration(duration)) {
    reason = "invalid-duration";
  } else if (startMinutes !== null && duration !== undefined && startMinutes + duration > 24 * 60) {
    reason = "interval-exceeds-day-boundary";
  }

  if (!reason) return null;

  return createDetectedConflict({
    snapshot,
    type: "invalid-activity-interval",
    severity: "critical",
    relatedDayIds: [day.id],
    relatedActivityIds: [activity.id],
    evidence: [
      {
        code: "invalid-activity-interval",
        facts: {
          activityId: activity.id,
          dayId: day.id,
          dayDate: day.date,
          startTime: activity.startTime ?? null,
          durationMinutes: duration ?? null,
          reason,
        },
      },
    ],
  });
}

function outsideTripConflict(
  snapshot: PlanningConflictContextSnapshot,
  day: PlanningDaySnapshot,
  activity: PlanningActivitySnapshot,
): PlanningConflict | null {
  if (day.date >= snapshot.tripStartDate && day.date <= snapshot.tripEndDate) {
    return null;
  }

  return createDetectedConflict({
    snapshot,
    type: "activity-outside-trip-period",
    severity: "critical",
    relatedDayIds: [day.id],
    relatedActivityIds: [activity.id],
    evidence: [
      {
        code: "activity-outside-trip-period",
        facts: {
          activityId: activity.id,
          dayId: day.id,
          dayDate: day.date,
          tripStartDate: snapshot.tripStartDate,
          tripEndDate: snapshot.tripEndDate,
        },
      },
    ],
  });
}

function dayMismatchConflict(
  snapshot: PlanningConflictContextSnapshot,
  day: PlanningDaySnapshot,
  activity: PlanningActivitySnapshot,
): PlanningConflict | null {
  const idMismatch = activity.dayId !== day.id;
  const dateMismatch = activity.scheduledDate !== undefined && activity.scheduledDate !== day.date;
  if (!idMismatch && !dateMismatch) return null;

  return createDetectedConflict({
    snapshot,
    type: "activity-day-mismatch",
    severity: "warning",
    relatedDayIds: [day.id, activity.dayId],
    relatedActivityIds: [activity.id],
    evidence: [
      {
        code: "activity-day-mismatch",
        facts: {
          activityId: activity.id,
          containerDayId: day.id,
          activityDayId: activity.dayId,
          containerDayDate: day.date,
          scheduledDate: activity.scheduledDate ?? null,
        },
      },
    ],
  });
}

function intervalFor(activity: PlanningActivitySnapshot): ActivityInterval | null {
  if (activity.startTime === undefined || !validPositiveDuration(activity.durationMinutes)) {
    return null;
  }
  const startMinutes = toMinutes(activity.startTime);
  if (startMinutes === null) return null;
  const endMinutes = startMinutes + activity.durationMinutes;
  if (endMinutes > 24 * 60) return null;
  return { activity, startMinutes, endMinutes };
}

function overlapConflicts(
  snapshot: PlanningConflictContextSnapshot,
  day: PlanningDaySnapshot,
): PlanningConflict[] {
  const intervals = day.activities
    .map(intervalFor)
    .filter((value): value is ActivityInterval => value !== null)
    .sort(
      (left, right) =>
        left.startMinutes - right.startMinutes ||
        left.activity.id.localeCompare(right.activity.id),
    );
  const conflicts: PlanningConflict[] = [];

  for (let leftIndex = 0; leftIndex < intervals.length; leftIndex += 1) {
    const left = intervals[leftIndex];
    if (!left) continue;
    for (let rightIndex = leftIndex + 1; rightIndex < intervals.length; rightIndex += 1) {
      const right = intervals[rightIndex];
      if (!right) continue;
      if (right.startMinutes >= left.endMinutes) break;
      if (left.startMinutes >= right.endMinutes) continue;

      conflicts.push(
        createDetectedConflict({
          snapshot,
          type: "activity-time-overlap",
          severity: "warning",
          relatedDayIds: [day.id],
          relatedActivityIds: [left.activity.id, right.activity.id],
          evidence: [
            {
              code: "activity-time-overlap",
              facts: {
                dayId: day.id,
                dayDate: day.date,
                firstActivityId: left.activity.id,
                firstStartMinutes: left.startMinutes,
                firstEndMinutes: left.endMinutes,
                secondActivityId: right.activity.id,
                secondStartMinutes: right.startMinutes,
                secondEndMinutes: right.endMinutes,
              },
            },
          ],
        }),
      );
    }
  }

  return conflicts;
}

function overloadedDayConflict(
  snapshot: PlanningConflictContextSnapshot,
  day: PlanningDaySnapshot,
): PlanningConflict | null {
  const activityCount = day.activities.length;
  const totalScheduledMinutes = day.activities.reduce((total, activity) => {
    const interval = intervalFor(activity);
    return total + (interval ? interval.endMinutes - interval.startMinutes : 0);
  }, 0);

  if (
    activityCount <= MAX_DAY_ACTIVITY_COUNT &&
    totalScheduledMinutes <= MAX_DAY_SCHEDULED_MINUTES
  ) {
    return null;
  }

  return createDetectedConflict({
    snapshot,
    type: "day-overloaded",
    severity: "warning",
    relatedDayIds: [day.id],
    relatedActivityIds: day.activities.map((activity) => activity.id),
    evidence: [
      {
        code: "day-overloaded",
        facts: {
          dayId: day.id,
          dayDate: day.date,
          activityCount,
          totalScheduledMinutes,
          maxActivityCount: MAX_DAY_ACTIVITY_COUNT,
          maxScheduledMinutes: MAX_DAY_SCHEDULED_MINUTES,
        },
      },
    ],
  });
}

function comparePlanningConflicts(left: PlanningConflict, right: PlanningConflict): number {
  const leftDate =
    left.contextSnapshot.days.find((day) => left.relatedDayIds.includes(day.id))?.date ?? "";
  const rightDate =
    right.contextSnapshot.days.find((day) => right.relatedDayIds.includes(day.id))?.date ?? "";

  return (
    typeOrder[left.type] - typeOrder[right.type] ||
    leftDate.localeCompare(rightDate) ||
    left.relatedDayIds.join("|").localeCompare(right.relatedDayIds.join("|")) ||
    left.relatedActivityIds
      .join("|")
      .localeCompare(right.relatedActivityIds.join("|")) ||
    left.contextFingerprint.localeCompare(right.contextFingerprint)
  );
}

export function detectPlanningConflicts(
  input: PlanningConflictContextSnapshot,
): readonly PlanningConflict[] {
  const snapshot = normalizePlanningConflictContextSnapshot(input);
  const conflicts: PlanningConflict[] = [];

  for (const day of snapshot.days) {
    for (const activity of day.activities) {
      const invalid = invalidIntervalConflict(snapshot, day, activity);
      if (invalid) conflicts.push(invalid);
      const outside = outsideTripConflict(snapshot, day, activity);
      if (outside) conflicts.push(outside);
      const mismatch = dayMismatchConflict(snapshot, day, activity);
      if (mismatch) conflicts.push(mismatch);
    }
    conflicts.push(...overlapConflicts(snapshot, day));
    const overloaded = overloadedDayConflict(snapshot, day);
    if (overloaded) conflicts.push(overloaded);
  }

  return Object.freeze(conflicts.sort(comparePlanningConflicts));
}
