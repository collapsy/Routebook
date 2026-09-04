import { asc, eq, inArray } from "drizzle-orm";

import type {
  Activity,
  FreePeriod,
  Itinerary,
  ItineraryDay,
  ItineraryRepository,
} from "@routebook/trip-management";

import { getDatabase } from "./client";
import { itineraries, itineraryActivities, itineraryDays, itineraryFreePeriods } from "./schema";

type ItineraryRow = typeof itineraries.$inferSelect;
type ItineraryDayRow = typeof itineraryDays.$inferSelect;
type ItineraryActivityRow = typeof itineraryActivities.$inferSelect;
type ItineraryFreePeriodRow = typeof itineraryFreePeriods.$inferSelect;

export type ItineraryDatabaseExecutor = Pick<
  ReturnType<typeof getDatabase>,
  "select" | "insert" | "delete"
>;

function mapActivity(row: ItineraryActivityRow): Activity {
  return {
    id: row.id,
    title: row.title,
    type: row.type as Activity["type"],
    status: row.status as Activity["status"],
    flexibility: row.flexibility as Activity["flexibility"],
    order: row.order,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...(row.startTime ? { startTime: row.startTime } : {}),
    ...(row.durationMinutes !== null ? { durationMinutes: row.durationMinutes } : {}),
    ...(row.placeId ? { placeId: row.placeId } : {}),
  };
}

function mapFreePeriod(row: ItineraryFreePeriodRow): FreePeriod {
  return {
    id: row.id,
    mode: row.mode as FreePeriod["mode"],
    order: row.order,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...(row.startTime ? { startTime: row.startTime } : {}),
    ...(row.durationMinutes !== null ? { durationMinutes: row.durationMinutes } : {}),
  };
}

function mapItinerary(
  row: ItineraryRow,
  dayRows: ItineraryDayRow[],
  activityRows: ItineraryActivityRow[],
  freePeriodRows: ItineraryFreePeriodRow[],
): Itinerary {
  const activitiesByDay = new Map<string, Activity[]>();
  const freePeriodsByDay = new Map<string, FreePeriod[]>();

  for (const activityRow of activityRows) {
    const activities = activitiesByDay.get(activityRow.itineraryDayId) ?? [];
    activities.push(mapActivity(activityRow));
    activitiesByDay.set(activityRow.itineraryDayId, activities);
  }

  for (const freePeriodRow of freePeriodRows) {
    const freePeriods = freePeriodsByDay.get(freePeriodRow.itineraryDayId) ?? [];
    freePeriods.push(mapFreePeriod(freePeriodRow));
    freePeriodsByDay.set(freePeriodRow.itineraryDayId, freePeriods);
  }

  const days: ItineraryDay[] = dayRows.map((dayRow) => ({
    id: dayRow.id,
    date: dayRow.date,
    position: dayRow.position,
    activities: activitiesByDay.get(dayRow.id) ?? [],
    freePeriods: freePeriodsByDay.get(dayRow.id) ?? [],
  }));

  return {
    id: row.id,
    tripId: row.tripId,
    period: {
      startDate: row.startDate,
      endDate: row.endDate,
      timeZone: row.timeZone,
    },
    days,
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleItineraryRepository implements ItineraryRepository {
  constructor(
    private readonly database: ItineraryDatabaseExecutor = getDatabase(),
    private readonly useOwnTransaction = true,
  ) {}

  private async withWriteExecutor<TResult>(
    operation: (database: ItineraryDatabaseExecutor) => Promise<TResult>,
  ): Promise<TResult> {
    if (!this.useOwnTransaction) return operation(this.database);

    const host = this.database as ReturnType<typeof getDatabase>;
    if (typeof host.transaction !== "function") return operation(this.database);

    return host.transaction(async (transaction) => operation(transaction));
  }

  async findByTripId(tripId: string): Promise<Itinerary | null> {
    const database = this.database;
    const [itineraryRow] = await database
      .select()
      .from(itineraries)
      .where(eq(itineraries.tripId, tripId))
      .limit(1);

    if (!itineraryRow) return null;

    const dayRows = await database
      .select()
      .from(itineraryDays)
      .where(eq(itineraryDays.itineraryId, itineraryRow.id))
      .orderBy(asc(itineraryDays.position));
    const dayIds = dayRows.map((day) => day.id);
    const activityRows =
      dayIds.length === 0
        ? []
        : await database
            .select()
            .from(itineraryActivities)
            .where(inArray(itineraryActivities.itineraryDayId, dayIds))
            .orderBy(asc(itineraryActivities.itineraryDayId), asc(itineraryActivities.order));
    const freePeriodRows =
      dayIds.length === 0
        ? []
        : await database
            .select()
            .from(itineraryFreePeriods)
            .where(inArray(itineraryFreePeriods.itineraryDayId, dayIds))
            .orderBy(asc(itineraryFreePeriods.itineraryDayId), asc(itineraryFreePeriods.order));

    return mapItinerary(itineraryRow, dayRows, activityRows, freePeriodRows);
  }

  async save(itinerary: Itinerary): Promise<Itinerary> {
    return this.withWriteExecutor(async (database) => {
      await database
        .insert(itineraries)
        .values({
          id: itinerary.id,
          tripId: itinerary.tripId,
          startDate: itinerary.period.startDate,
          endDate: itinerary.period.endDate,
          timeZone: itinerary.period.timeZone,
          version: itinerary.version,
          createdAt: itinerary.createdAt,
          updatedAt: itinerary.updatedAt,
        })
        .onConflictDoUpdate({
          target: itineraries.id,
          set: {
            tripId: itinerary.tripId,
            startDate: itinerary.period.startDate,
            endDate: itinerary.period.endDate,
            timeZone: itinerary.period.timeZone,
            version: itinerary.version,
            updatedAt: itinerary.updatedAt,
          },
        });

      await database.delete(itineraryDays).where(eq(itineraryDays.itineraryId, itinerary.id));

      if (itinerary.days.length > 0) {
        await database.insert(itineraryDays).values(
          itinerary.days.map((day) => ({
            id: day.id,
            itineraryId: itinerary.id,
            date: day.date,
            position: day.position,
          })),
        );
      }

      const activities = itinerary.days.flatMap((day) =>
        day.activities.map((activity) => ({
          id: activity.id,
          itineraryDayId: day.id,
          title: activity.title,
          type: activity.type,
          status: activity.status,
          flexibility: activity.flexibility,
          startTime: activity.startTime ?? null,
          durationMinutes: activity.durationMinutes ?? null,
          order: activity.order,
          placeId: activity.placeId ?? null,
          createdAt: activity.createdAt,
          updatedAt: activity.updatedAt,
        })),
      );
      const freePeriods = itinerary.days.flatMap((day) =>
        day.freePeriods.map((freePeriod) => ({
          id: freePeriod.id,
          itineraryDayId: day.id,
          mode: freePeriod.mode,
          startTime: freePeriod.startTime ?? null,
          durationMinutes: freePeriod.durationMinutes ?? null,
          order: freePeriod.order,
          createdAt: freePeriod.createdAt,
          updatedAt: freePeriod.updatedAt,
        })),
      );

      if (activities.length > 0) {
        await database.insert(itineraryActivities).values(activities);
      }
      if (freePeriods.length > 0) {
        await database.insert(itineraryFreePeriods).values(freePeriods);
      }

      return itinerary;
    });
  }
}

export function createPostgresItineraryRepository(
  executor: ItineraryDatabaseExecutor,
): DrizzleItineraryRepository {
  if (
    !executor ||
    typeof executor.select !== "function" ||
    typeof executor.insert !== "function" ||
    typeof executor.delete !== "function"
  ) {
    throw new TypeError("Informe um executor Drizzle transacional válido.");
  }

  return new DrizzleItineraryRepository(executor, false);
}
