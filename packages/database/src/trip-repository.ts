import { desc, eq } from "drizzle-orm";

import { createGeoCoordinate } from "@routebook/geo-distance";
import type { Trip, TripParticipant, TripRepository } from "@routebook/trip-management";

import { getDatabase } from "./client";
import { trips } from "./schema";

export type TripRow = typeof trips.$inferSelect;

export function mapTripRow(row: TripRow): Trip {
  const accommodationCoordinate =
    row.accommodationLatitude !== null && row.accommodationLongitude !== null
      ? createGeoCoordinate({
          latitude: row.accommodationLatitude,
          longitude: row.accommodationLongitude,
        })
      : undefined;

  return {
    id: row.id,
    name: row.name,
    destination: {
      name: row.destinationName,
      type: "district",
      countryCode: "BR",
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      timeZone: "America/Fortaleza",
    },
    period: {
      startDate: row.startDate,
      endDate: row.endDate,
      timeZone: "America/Fortaleza",
    },
    ...(row.accommodationName
      ? {
          accommodation: {
            name: row.accommodationName,
            ...(row.accommodationAddress ? { address: row.accommodationAddress } : {}),
            ...(accommodationCoordinate ? { coordinate: accommodationCoordinate } : {}),
          },
        }
      : {}),
    status: row.status as Trip["status"],
    participants: row.participants as TripParticipant[],
    contextVersion: row.contextVersion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleTripRepository implements TripRepository {
  async create(trip: Trip): Promise<void> {
    await getDatabase()
      .insert(trips)
      .values({
        id: trip.id,
        name: trip.name,
        destinationName: trip.destination.name,
        destinationType: trip.destination.type,
        countryCode: trip.destination.countryCode,
        latitude: String(trip.destination.latitude),
        longitude: String(trip.destination.longitude),
        timeZone: trip.destination.timeZone,
        startDate: trip.period.startDate,
        endDate: trip.period.endDate,
        accommodationName: trip.accommodation?.name,
        accommodationAddress: trip.accommodation?.address,
        accommodationLatitude: trip.accommodation?.coordinate?.latitude,
        accommodationLongitude: trip.accommodation?.coordinate?.longitude,
        status: trip.status,
        participants: trip.participants,
        contextVersion: trip.contextVersion,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
      });
  }

  async update(trip: Trip): Promise<void> {
    await getDatabase()
      .update(trips)
      .set({
        accommodationName: trip.accommodation?.name ?? null,
        accommodationAddress: trip.accommodation?.address ?? null,
        accommodationLatitude: trip.accommodation?.coordinate?.latitude ?? null,
        accommodationLongitude: trip.accommodation?.coordinate?.longitude ?? null,
        contextVersion: trip.contextVersion,
        updatedAt: trip.updatedAt,
      })
      .where(eq(trips.id, trip.id));
  }

  async deleteById(tripId: string): Promise<boolean> {
    const deletedRows = await getDatabase()
      .delete(trips)
      .where(eq(trips.id, tripId))
      .returning({ id: trips.id });

    return deletedRows.length === 1;
  }

  async list(): Promise<Trip[]> {
    const rows = await getDatabase().select().from(trips).orderBy(desc(trips.createdAt));
    return rows.map(mapTripRow);
  }

  async findById(tripId: string): Promise<Trip | null> {
    const [row] = await getDatabase().select().from(trips).where(eq(trips.id, tripId)).limit(1);
    return row ? mapTripRow(row) : null;
  }
}
