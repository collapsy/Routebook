import type { Place, PlaceCategory } from "./place";
import type { PlaceRepository } from "./repository";

export async function listPublishedPlaces(
  repository: PlaceRepository,
  destinationId: string,
  category?: PlaceCategory,
): Promise<Place[]> {
  return repository.listPublished({ destinationId, ...(category ? { category } : {}) });
}

export async function findPublishedPlace(
  repository: PlaceRepository,
  destinationId: string,
  slug: string,
): Promise<Place | null> {
  return repository.findPublishedBySlug(destinationId, slug);
}
