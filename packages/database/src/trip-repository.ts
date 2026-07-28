import { desc } from "drizzle-orm";

import type { Trip, TripParticipant, TripRepository } from "@routebook/trip-management";

import { getDatabase } from "./client";
import { trips } from "./schema";

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
        status: trip.status,
        participants: trip.participants,
        contextVersion: trip.contextVersion,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
      });
  }

  async list(): Promise<Trip[]> {
    const rows = await getDatabase().select().from(trips).orderBy(desc(trips.createdAt));

    return rows.map((row) => ({
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
            },
          }
        : {}),
      status: row.status as Trip["status"],
      participants: row.participants as TripParticipant[],
      contextVersion: row.contextVersion,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }
}
