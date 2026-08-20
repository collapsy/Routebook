export type TripDayReference = Readonly<{
  date: string;
}>;

function datePart(
  parts: Intl.DateTimeFormatPart[],
  type: "year" | "month" | "day",
): string {
  return parts.find((part) => part.type === type)?.value ?? "";
}

export function formatDateInTimeZone(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  return `${datePart(parts, "year")}-${datePart(parts, "month")}-${datePart(parts, "day")}`;
}

export function resolveTripTodayDate(
  days: readonly TripDayReference[],
  now: Date,
  timeZone: string,
): string | null {
  const today = formatDateInTimeZone(now, timeZone);
  return days.some((day) => day.date === today) ? today : null;
}

export function resolvePreferredTripDay<T extends TripDayReference>(
  days: readonly T[],
  requestedDate: string | undefined,
  now: Date,
  timeZone: string,
): T | undefined {
  const explicitDay = requestedDate ? days.find((day) => day.date === requestedDate) : undefined;
  if (explicitDay) return explicitDay;

  const today = resolveTripTodayDate(days, now, timeZone);
  if (today) return days.find((day) => day.date === today);

  return days[0];
}
