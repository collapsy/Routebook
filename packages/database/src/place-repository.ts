import { and, asc, eq } from "drizzle-orm";

import {
  parsePlacePrimaryImage,
  type ListPublishedPlacesQuery,
  type Place,
  type PlaceRepository,
} from "@routebook/place-catalog";

import { getDatabase } from "./client";
import { places } from "./schema";

type PlaceRow = typeof places.$inferSelect;

function mapPlace(row: PlaceRow): Place {
  const primaryImage = parsePlacePrimaryImage(row.primaryImage);

  return {
    id: row.id,
    destinationId: row.destinationId,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    category: row.category as Place["category"],
    latitude: row.latitude,
    longitude: row.longitude,
    ...(row.addressLabel ? { addressLabel: row.addressLabel } : {}),
    ...(row.priceRange ? { priceRange: row.priceRange as NonNullable<Place["priceRange"]> } : {}),
    ...(primaryImage ? { primaryImage } : {}),
    publicationStatus: row.publicationStatus as Place["publicationStatus"],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzlePlaceRepository implements PlaceRepository {
  async listPublished(query: ListPublishedPlacesQuery): Promise<Place[]> {
    const filters = [
      eq(places.destinationId, query.destinationId),
      eq(places.publicationStatus, "published"),
    ];

    if (query.category) {
      filters.push(eq(places.category, query.category));
    }

    const rows = await getDatabase()
      .select()
      .from(places)
      .where(and(...filters))
      .orderBy(asc(places.name));

    return rows.map(mapPlace);
  }

  async findPublishedBySlug(destinationId: string, slug: string): Promise<Place | null> {
    const [row] = await getDatabase()
      .select()
      .from(places)
      .where(
        and(
          eq(places.destinationId, destinationId),
          eq(places.slug, slug),
          eq(places.publicationStatus, "published"),
        ),
      )
      .limit(1);

    return row ? mapPlace(row) : null;
  }
}
