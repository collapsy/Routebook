import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";

import {
  parsePlacePrimaryImage,
  placeDistanceMeters,
  type ListPublishedPlacesQuery,
  type Place,
  type PlaceRepository,
} from "@routebook/place-catalog";

import { getDatabase } from "./client";
import { places } from "./schema";

type PlaceRow = typeof places.$inferSelect;

export type ListPublishedPlacesWithinRadiusQuery = Readonly<{
  center: Readonly<{ latitude: number; longitude: number }>;
  radiusMeters: number;
}>;

function validateRegionQuery(query: ListPublishedPlacesWithinRadiusQuery): void {
  if (
    !Number.isFinite(query.center.latitude) ||
    query.center.latitude < -90 ||
    query.center.latitude > 90 ||
    !Number.isFinite(query.center.longitude) ||
    query.center.longitude < -180 ||
    query.center.longitude > 180
  ) {
    throw new Error("A referência geográfica do catálogo é inválida.");
  }
  if (
    !Number.isFinite(query.radiusMeters) ||
    query.radiusMeters <= 0 ||
    query.radiusMeters > 50_000
  ) {
    throw new Error("O raio do catálogo deve estar entre 1 e 50000 metros.");
  }
}

function regionBounds(query: ListPublishedPlacesWithinRadiusQuery) {
  const latitudeDelta = query.radiusMeters / 111_320;
  const longitudeScale = Math.max(0.1, Math.cos((query.center.latitude * Math.PI) / 180));
  const longitudeDelta = query.radiusMeters / (111_320 * longitudeScale);
  return {
    south: Math.max(-90, query.center.latitude - latitudeDelta),
    north: Math.min(90, query.center.latitude + latitudeDelta),
    west: Math.max(-180, query.center.longitude - longitudeDelta),
    east: Math.min(180, query.center.longitude + longitudeDelta),
  };
}

function mapPlace(row: PlaceRow): Place {
  const primaryImage = parsePlacePrimaryImage(row.primaryImage);

  return {
    id: row.id,
    ...(row.destinationId ? { destinationId: row.destinationId } : {}),
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
  async listByIds(placeIds: readonly string[]): Promise<Place[]> {
    const ids = [...new Set(placeIds.map((id) => id.trim()).filter(Boolean))];
    if (ids.length === 0) return [];
    const rows = await getDatabase().select().from(places).where(inArray(places.id, ids));
    const byId = new Map(rows.map((row) => [row.id, mapPlace(row)]));
    return ids.flatMap((id) => {
      const place = byId.get(id);
      return place ? [place] : [];
    });
  }

  async findBySlugWithinRadius(
    slug: string,
    query: ListPublishedPlacesWithinRadiusQuery,
  ): Promise<Place | null> {
    validateRegionQuery(query);
    const bounds = regionBounds(query);
    const [row] = await getDatabase()
      .select()
      .from(places)
      .where(
        and(
          eq(places.slug, slug.trim()),
          gte(places.latitude, bounds.south),
          lte(places.latitude, bounds.north),
          gte(places.longitude, bounds.west),
          lte(places.longitude, bounds.east),
        ),
      )
      .limit(1);
    if (!row) return null;
    const place = mapPlace(row);
    return placeDistanceMeters(place, query.center) <= query.radiusMeters ? place : null;
  }

  async listPublishedWithinRadius(query: ListPublishedPlacesWithinRadiusQuery): Promise<Place[]> {
    validateRegionQuery(query);
    const bounds = regionBounds(query);
    const rows = await getDatabase()
      .select()
      .from(places)
      .where(
        and(
          eq(places.publicationStatus, "published"),
          gte(places.latitude, bounds.south),
          lte(places.latitude, bounds.north),
          gte(places.longitude, bounds.west),
          lte(places.longitude, bounds.east),
        ),
      )
      .orderBy(asc(places.name));

    return rows
      .map(mapPlace)
      .filter((place) => placeDistanceMeters(place, query.center) <= query.radiusMeters)
      .sort(
        (left, right) =>
          placeDistanceMeters(left, query.center) - placeDistanceMeters(right, query.center) ||
          left.slug.localeCompare(right.slug),
      );
  }

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
