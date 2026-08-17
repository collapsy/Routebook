import {
  placeDistanceMeters,
  type ExternalPlaceCandidate,
  type Place,
} from "@routebook/place-catalog";

export type PlaceDiscoveryReference = Readonly<{
  latitude: number;
  longitude: number;
}>;

export type PublishedPlaceDiscoveryItem = Readonly<{
  id: string;
  kind: "published";
  place: Place;
  distanceMeters: number;
}>;

export type ExternalPlaceDiscoveryItem = Readonly<{
  id: string;
  kind: "external";
  candidate: ExternalPlaceCandidate;
  distanceMeters: number;
}>;

export type PlaceDiscoveryItem = PublishedPlaceDiscoveryItem | ExternalPlaceDiscoveryItem;

function compareDiscoveryItems(left: PlaceDiscoveryItem, right: PlaceDiscoveryItem): number {
  const byDistance = left.distanceMeters - right.distanceMeters;
  if (byDistance) return byDistance;

  const byKind = left.kind.localeCompare(right.kind);
  if (byKind) return byKind;

  const leftName = left.kind === "published" ? left.place.name : left.candidate.name;
  const rightName = right.kind === "published" ? right.place.name : right.candidate.name;
  return leftName.localeCompare(rightName, "pt-BR") || left.id.localeCompare(right.id);
}

export function buildPlaceDiscoveryFeed(
  input: Readonly<{
    publishedPlaces: readonly Place[];
    externalCandidates: readonly ExternalPlaceCandidate[];
    reference: PlaceDiscoveryReference;
  }>,
): PlaceDiscoveryItem[] {
  const publishedItems: PublishedPlaceDiscoveryItem[] = input.publishedPlaces.map((place) => ({
    id: `published:${place.id}`,
    kind: "published",
    place,
    distanceMeters: placeDistanceMeters(place, input.reference),
  }));
  const externalItems: ExternalPlaceDiscoveryItem[] = input.externalCandidates.map((candidate) => ({
    id: `external:${candidate.provider}:${candidate.externalId}`,
    kind: "external",
    candidate,
    distanceMeters: placeDistanceMeters(candidate, input.reference),
  }));

  return [...publishedItems, ...externalItems].sort(compareDiscoveryItems);
}
