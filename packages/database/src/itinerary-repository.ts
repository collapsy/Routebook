import { asc, eq, inArray } from "drizzle-orm";

import type {
  Activity,
  Itinerary,
  ItineraryDay,
  ItineraryRepository,
} from "@routebook/trip-management";

import { getDatabase } from "./client";
import { itineraries, itineraryActivities, itineraryDays } from "./schema";

type ItineraryRow = typeof itineraries.$inferSelect;
type ItineraryDayRow = typeof itineraryDays.$inferSelect;
type ItineraryActivityRow = typeof itineraryActivities.$inferSelect;

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

function mapItinerary(
  row: ItineraryRow,
  dayRows: ItineraryDayRow[],
  activityRows: ItineraryActivityRow[],
): Itinerary {
  const activitiesByDay = new Map<string, Activity[]>();

  for (const activityRow of activityRows) {
    const activities = activitiesByDay.get(activityRow.itineraryDayId) ?? [];
    activities.push(mapActivity(activityRow));
    activitiesByDay.set(activityRow.itineraryDayId, activities);
  }

  const days: ItineraryDay[] = dayRows.map((dayRow) => ({
    id: dayRow.id,
    date: dayRow.date,
    position: dayRow.position,
    activities: activitiesByDay.get(dayRow.id) ?? [],
  }));

  return {
    id: row.id,
    tripId: row.tripId,
    period: {
      startDate: row.startDate,
      endDate: row.endDate,
      timeZone: "America/Fortaleza",
    },
    days,
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleItineraryRepository implements ItineraryRepository {
  async findByTripId(tripId: string): Promise<Itinerary | null> {
    const database = getDatabase();
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

    return mapItinerary(itineraryRow, dayRows, activityRows);
  }

  async save(itinerary: Itinerary): Promise<Itinerary> {
    await getDatabase().transaction(async (transaction) => {
      await transaction.delete(itineraries).where(eq(itineraries.tripId, itinerary.tripId));
      await transaction.insert(itineraries).values({
        id: itinerary.id,
        tripId: itinerary.tripId,
        startDate: itinerary.period.startDate,
        endDate: itinerary.period.endDate,
        timeZone: itinerary.period.timeZone,
        version: itinerary.version,
        createdAt: itinerary.createdAt,
        updatedAt: itinerary.updatedAt,
      });

      if (itinerary.days.length > 0) {
        await transaction.insert(itineraryDays).values(
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

      if (activities.length > 0) {
        await transaction.insert(itineraryActivities).values(activities);
      }
    });

    return itinerary;
  }
}
