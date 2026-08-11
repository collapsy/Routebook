import { calculateGeodesicDistance, createGeoCoordinate } from "@routebook/geo-distance";
import {
  PLACE_CATEGORIES,
  PLACE_PRICE_RANGES,
  type Place,
  type PlaceCategory,
  type PlacePriceRange,
} from "@routebook/place-catalog";

export const categoryLabels: Record<PlaceCategory, string> = {
  beach: "Praias",
  gastronomy: "Gastronomia",
  nature: "Natureza",
  nightlife: "Vida noturna",
};

export const priceRangeLabels: Record<PlacePriceRange, string> = {
  free: "Gratuito",
  budget: "Econômico",
  moderate: "Moderado",
  premium: "Premium",
};

export type PlaceDiscoveryFilters = Readonly<{
  search?: string;
  category?: PlaceCategory;
  maximumDistanceMeters?: number;
  priceRange?: PlacePriceRange;
}>;

export type FilteredPlace = Readonly<{
  place: Place;
  distanceMeters?: number;
}>;

function normalizeSearchTerm(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function parsePlaceCategory(value?: string): PlaceCategory | undefined {
  return PLACE_CATEGORIES.find((category) => category === value);
}

export function parsePlacePriceRange(value?: string): PlacePriceRange | undefined {
  return PLACE_PRICE_RANGES.find((priceRange) => priceRange === value);
}

export function parseMaximumDistance(value?: string): number | undefined {
  const kilometers = Number(value);
  return [1, 3, 5, 10].includes(kilometers) ? kilometers * 1_000 : undefined;
}

export function filterPlaces(
  places: readonly Place[],
  filters: PlaceDiscoveryFilters,
  accommodationCoordinate?: { latitude: number; longitude: number },
): FilteredPlace[] {
  const normalizedSearch = filters.search ? normalizeSearchTerm(filters.search) : undefined;

  return places.flatMap((place) => {
    const distanceMeters = accommodationCoordinate
      ? calculateGeodesicDistance(
          createGeoCoordinate(accommodationCoordinate),
          createGeoCoordinate({ latitude: place.latitude, longitude: place.longitude }),
        ).meters
      : undefined;
    const searchableText = normalizeSearchTerm(
      [place.name, place.summary, categoryLabels[place.category], place.addressLabel]
        .filter(Boolean)
        .join(" "),
    );

    if (normalizedSearch && !searchableText.includes(normalizedSearch)) return [];
    if (filters.category && place.category !== filters.category) return [];
    if (filters.priceRange && place.priceRange !== filters.priceRange) return [];
    if (
      filters.maximumDistanceMeters !== undefined &&
      (distanceMeters === undefined || distanceMeters > filters.maximumDistanceMeters)
    ) {
      return [];
    }

    return [{ place, ...(distanceMeters === undefined ? {} : { distanceMeters }) }];
  });
}
