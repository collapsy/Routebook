import type { TripRepository } from "./repository";
import {
  createTrip,
  type CreateTripInput,
  type Trip,
  type UpdateAccommodationInput,
  updateTripAccommodation,
} from "./trip";

export async function createAndPersistTrip(
  repository: TripRepository,
  input: CreateTripInput,
): Promise<Trip> {
  const trip = createTrip(input);
  await repository.create(trip);
  return trip;
}

export function listTrips(repository: TripRepository): Promise<Trip[]> {
  return repository.list();
}

export function findTripById(repository: TripRepository, tripId: string): Promise<Trip | null> {
  return repository.findById(tripId);
}

export async function updateAndPersistTripAccommodation(
  repository: TripRepository,
  tripId: string,
  input: UpdateAccommodationInput,
  now = new Date(),
): Promise<Trip | null> {
  const trip = await repository.findById(tripId);
  if (!trip) return null;

  const updatedTrip = updateTripAccommodation(trip, input, now);
  await repository.update(updatedTrip);
  return updatedTrip;
}
