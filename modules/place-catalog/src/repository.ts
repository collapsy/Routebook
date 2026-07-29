import type { Place, PlaceCategory } from "./place";

export type ListPublishedPlacesQuery = {
  destinationId: string;
  category?: PlaceCategory;
};

export interface PlaceRepository {
  listPublished(query: ListPublishedPlacesQuery): Promise<Place[]>;
  findPublishedBySlug(destinationId: string, slug: string): Promise<Place | null>;
}
