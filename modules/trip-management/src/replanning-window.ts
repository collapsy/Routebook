import type { Activity, ActivityStatus, Itinerary } from "./itinerary";

export const replanningWindowProtectionReasons = [
  "PAST_DAY",
  "FIXED_ACTIVITY",
  "TERMINAL_ACTIVITY",
  "CURRENT_DAY_UNSCHEDULED",
  "CURRENT_DAY_ELAPSED",
  "CURRENT_DAY_IN_PROGRESS",
  "CURRENT_DAY_STARTED_WITHOUT_DURATION",
] as const;

export type ReplanningWindowProtectionReason = (typeof replanningWindowProtectionReasons)[number];

export type ReplanningWindow = Readonly<{
  capturedAt: Date;
  timeZone: string;
  localDate: string;
  localTime: string;
  eligibleDayIds: readonly string[];
  eligibleActivityIds: readonly string[];
  protectedActivityIds: readonly string[];
  reasonByActivityId: Readonly<Record<string, ReplanningWindowProtectionReason>>;
}>;

export type ReplanningWindowValidationErrorCode =
  | "invalid-captured-at"
  | "invalid-time-zone"
  | "invalid-day"
  | "duplicate-day"
  | "invalid-activity"
  | "duplicate-activity";

export class ReplanningWindowValidationError extends Error {
  constructor(
    message: string,
    readonly code: ReplanningWindowValidationErrorCode,
  ) {
    super(message);
    this.name = "ReplanningWindowValidationError";
  }
}

const TERMINAL_ACTIVITY_STATUSES = new Set<ActivityStatus>([
  "completed",
  "skipped",
  "cancelled",
  "removed",
]);

const ACTIVITY_STATUSES = new Set<ActivityStatus>([
  "planned",
  "tentative",
  "completed",
  "skipped",
  "cancelled",
  "unavailable",
  "needs-review",
  "removed",
]);

const ACTIVITY_FLEXIBILITIES = new Set(["fixed", "flexible", "suggested"]);

function requiredText(
  value: string,
  code: ReplanningWindowValidationErrorCode,
  message: string,
): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) throw new ReplanningWindowValidationError(message, code);
  return normalized;
}

function validCapturedAt(value: Date): Date {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new ReplanningWindowValidationError(
      "Informe um instante válido para capturar a ReplanningWindow.",
      "invalid-captured-at",
    );
  }
  return new Date(value.getTime());
}

function validTimeZone(value: string): string {
  const timeZone = requiredText(value, "invalid-time-zone", "Informe o timezone IANA da Trip.");
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
  } catch {
    throw new ReplanningWindowValidationError(
      "Informe um timezone IANA válido para a Trip.",
      "invalid-time-zone",
    );
  }
  return timeZone;
}

function isIsoLocalDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isLocalTime(value: string): boolean {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return false;
  return true;
}

function localDateTime(
  capturedAt: Date,
  timeZone: string,
): Readonly<{ localDate: string; localTime: string; localMinute: number }> {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(capturedAt);

  const values = new Map(parts.map((part) => [part.type, part.value]));
  const year = values.get("year");
  const month = values.get("month");
  const day = values.get("day");
  const hour = values.get("hour");
  const minute = values.get("minute");

  if (!year || !month || !day || !hour || !minute) {
    throw new ReplanningWindowValidationError(
      "Não foi possível derivar a data e hora locais da Trip.",
      "invalid-time-zone",
    );
  }

  return Object.freeze({
    localDate: `${year}-${month}-${day}`,
    localTime: `${hour}:${minute}`,
    localMinute: Number(hour) * 60 + Number(minute),
  });
}

function activityMinute(activity: Activity): number | undefined {
  if (activity.startTime === undefined) return undefined;
  if (!isLocalTime(activity.startTime)) {
    throw new ReplanningWindowValidationError(
      "Activity possui horário local inválido.",
      "invalid-activity",
    );
  }
  const [hour, minute] = activity.startTime.split(":").map(Number);
  return hour! * 60 + minute!;
}

function validateActivity(activity: Activity): string {
  if (!activity || typeof activity !== "object") {
    throw new ReplanningWindowValidationError("Informe uma Activity válida.", "invalid-activity");
  }
  const id = requiredText(activity.id, "invalid-activity", "Informe um ActivityId válido.");
  if (!ACTIVITY_STATUSES.has(activity.status)) {
    throw new ReplanningWindowValidationError(
      "Activity possui status inválido.",
      "invalid-activity",
    );
  }
  if (!ACTIVITY_FLEXIBILITIES.has(activity.flexibility)) {
    throw new ReplanningWindowValidationError(
      "Activity possui flexibilidade inválida.",
      "invalid-activity",
    );
  }
  if (
    activity.durationMinutes !== undefined &&
    (!Number.isInteger(activity.durationMinutes) || activity.durationMinutes < 1)
  ) {
    throw new ReplanningWindowValidationError(
      "Activity possui duração inválida.",
      "invalid-activity",
    );
  }
  activityMinute(activity);
  return id;
}

function protectionReasonFor(
  dayDate: string,
  activity: Activity,
  localDate: string,
  localMinute: number,
): ReplanningWindowProtectionReason | undefined {
  if (dayDate < localDate) return "PAST_DAY";
  if (TERMINAL_ACTIVITY_STATUSES.has(activity.status)) return "TERMINAL_ACTIVITY";
  if (activity.flexibility === "fixed") return "FIXED_ACTIVITY";
  if (dayDate > localDate) return undefined;

  const startMinute = activityMinute(activity);
  if (startMinute === undefined) return "CURRENT_DAY_UNSCHEDULED";
  if (startMinute > localMinute) return undefined;

  if (activity.durationMinutes === undefined) {
    return "CURRENT_DAY_STARTED_WITHOUT_DURATION";
  }

  const endMinute = startMinute + activity.durationMinutes;
  return endMinute <= localMinute ? "CURRENT_DAY_ELAPSED" : "CURRENT_DAY_IN_PROGRESS";
}

export function createReplanningWindow(
  itinerary: Itinerary,
  capturedAtInput: Date,
): ReplanningWindow {
  if (!itinerary || typeof itinerary !== "object" || !Array.isArray(itinerary.days)) {
    throw new ReplanningWindowValidationError("Informe um Itinerary válido.", "invalid-day");
  }

  const capturedAt = validCapturedAt(capturedAtInput);
  const timeZone = validTimeZone(itinerary.period?.timeZone ?? "");
  const { localDate, localTime, localMinute } = localDateTime(capturedAt, timeZone);

  const dayIds = new Set<string>();
  const activityIds = new Set<string>();
  const eligibleDayIds: string[] = [];
  const eligibleActivityIds: string[] = [];
  const protectedActivityIds: string[] = [];
  const reasonByActivityId: Record<string, ReplanningWindowProtectionReason> = {};

  const days = [...itinerary.days].sort(
    (left, right) => left.date.localeCompare(right.date) || left.id.localeCompare(right.id),
  );

  for (const day of days) {
    if (!day || typeof day !== "object") {
      throw new ReplanningWindowValidationError("Informe um Dia válido.", "invalid-day");
    }

    const dayId = requiredText(day.id, "invalid-day", "Informe um TripDayId válido.");
    if (!isIsoLocalDate(day.date) || !Array.isArray(day.activities)) {
      throw new ReplanningWindowValidationError(
        "Dia possui data ou coleção de Activities inválida.",
        "invalid-day",
      );
    }
    if (dayIds.has(dayId)) {
      throw new ReplanningWindowValidationError(
        "Cada Dia deve possuir identidade única.",
        "duplicate-day",
      );
    }
    dayIds.add(dayId);

    if (day.date >= localDate) eligibleDayIds.push(dayId);

    const activities = [...day.activities].sort(
      (left, right) => left.order - right.order || left.id.localeCompare(right.id),
    );

    for (const activity of activities) {
      const activityId = validateActivity(activity);
      if (activityIds.has(activityId)) {
        throw new ReplanningWindowValidationError(
          "Cada Activity deve possuir identidade única no Itinerary.",
          "duplicate-activity",
        );
      }
      activityIds.add(activityId);

      const reason = protectionReasonFor(day.date, activity, localDate, localMinute);
      if (reason === undefined) {
        eligibleActivityIds.push(activityId);
      } else {
        protectedActivityIds.push(activityId);
        reasonByActivityId[activityId] = reason;
      }
    }
  }

  return Object.freeze({
    capturedAt,
    timeZone,
    localDate,
    localTime,
    eligibleDayIds: Object.freeze(eligibleDayIds),
    eligibleActivityIds: Object.freeze(eligibleActivityIds),
    protectedActivityIds: Object.freeze(protectedActivityIds),
    reasonByActivityId: Object.freeze(reasonByActivityId),
  });
}
