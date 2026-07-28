import type { TripPeriod } from "./trip";

export type TripDay = {
  index: number;
  date: string;
};

export function deriveTripDays(period: TripPeriod): TripDay[] {
  const start = new Date(`${period.startDate}T00:00:00Z`);
  const end = new Date(`${period.endDate}T00:00:00Z`);
  const days: TripDay[] = [];

  for (let cursor = start; cursor <= end; cursor = new Date(cursor.getTime() + 86_400_000)) {
    days.push({
      index: days.length + 1,
      date: cursor.toISOString().slice(0, 10),
    });
  }

  return days;
}
