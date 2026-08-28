import {
  PLACE_CATEGORIES,
  calculatePlaceQualityScore,
  type PlaceCategory,
  type PlaceQualityScore,
  type PlaceQualitySignalMatch,
  type PlaceQualityTarget,
} from "@routebook/place-catalog";

import type { PlaceDiscoveryItem } from "./place-discovery-feed";

export const PLACE_DISCOVERY_ORDERS = ["recommended", "rating", "popularity", "distance"] as const;

export type PlaceDiscoveryOrder = (typeof PLACE_DISCOVERY_ORDERS)[number];

export type RankedPlaceDiscoveryItem = Readonly<{
  item: PlaceDiscoveryItem;
  position: number;
  quality?: PlaceQualityScore;
  signals?: PlaceQualitySignalMatch["signals"];
}>;

export type PlaceDiscoveryRanking = Readonly<{
  items: readonly RankedPlaceDiscoveryItem[];
  order: PlaceDiscoveryOrder;
  hasQualityCoverage: boolean;
  availableOrders: readonly PlaceDiscoveryOrder[];
}>;

export type PlaceDiscoveryTopList = Readonly<{
  category: PlaceCategory;
  items: readonly RankedPlaceDiscoveryItem[];
}>;

function itemName(item: PlaceDiscoveryItem): string {
  return item.kind === "external" ? item.candidate.name : item.place.name;
}

function itemCategory(item: PlaceDiscoveryItem) {
  return item.kind === "external" ? item.candidate.category : item.place.category;
}

function itemCoordinate(item: PlaceDiscoveryItem) {
  if (item.kind === "external") {
    return { latitude: item.candidate.latitude, longitude: item.candidate.longitude };
  }
  if (item.kind === "enriched") {
    return { latitude: item.candidate.latitude, longitude: item.candidate.longitude };
  }
  return { latitude: item.place.latitude, longitude: item.place.longitude };
}

export function buildPlaceDiscoveryQualityTargets(
  items: readonly PlaceDiscoveryItem[],
): PlaceQualityTarget[] {
  return items.flatMap((item) => {
    const category = itemCategory(item);
    if (!category) return [];
    const coordinate = itemCoordinate(item);
    return [
      {
        id: item.id,
        name: itemName(item),
        category,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        ...(item.kind === "external"
          ? item.candidate.addressLabel
            ? { addressLabel: item.candidate.addressLabel }
            : {}
          : item.place.addressLabel
            ? { addressLabel: item.place.addressLabel }
            : {}),
      },
    ];
  });
}

function compareFallback(left: RankedPlaceDiscoveryItem, right: RankedPlaceDiscoveryItem): number {
  const byDistance = left.item.distanceMeters - right.item.distanceMeters;
  if (byDistance) return byDistance;
  return (
    itemName(left.item).localeCompare(itemName(right.item), "pt-BR") ||
    left.item.id.localeCompare(right.item.id)
  );
}

function compareOptionalDescending(left: number | undefined, right: number | undefined): number {
  if (left === undefined && right === undefined) return 0;
  if (left === undefined) return 1;
  if (right === undefined) return -1;
  return right - left;
}

function compareByOrder(
  order: PlaceDiscoveryOrder,
  left: RankedPlaceDiscoveryItem,
  right: RankedPlaceDiscoveryItem,
): number {
  switch (order) {
    case "recommended":
      return compareOptionalDescending(left.quality?.score, right.quality?.score);
    case "rating":
      return compareOptionalDescending(
        left.quality?.reputationScore,
        right.quality?.reputationScore,
      );
    case "popularity":
      return compareOptionalDescending(
        left.quality?.popularityScore,
        right.quality?.popularityScore,
      );
    case "distance":
      return 0;
  }
}

export function parsePlaceDiscoveryOrder(value?: string): PlaceDiscoveryOrder {
  return PLACE_DISCOVERY_ORDERS.find((order) => order === value) ?? "distance";
}

export function rankPlaceDiscoveryItems(
  input: Readonly<{
    items: readonly PlaceDiscoveryItem[];
    qualityMatches?: readonly PlaceQualitySignalMatch[];
    order?: PlaceDiscoveryOrder;
    contextualNow?: boolean;
  }>,
): PlaceDiscoveryRanking {
  const requestedOrder = input.order ?? "distance";
  const signalsByTargetId = new Map(
    (input.qualityMatches ?? []).map((match) => [match.targetId, match.signals]),
  );

  const ranked = input.items.map<RankedPlaceDiscoveryItem>((item) => {
    const signals = signalsByTargetId.get(item.id);
    const category = itemCategory(item);
    const quality =
      signals && category
        ? calculatePlaceQualityScore({
            category,
            distanceMeters: item.distanceMeters,
            signals,
            ...(input.contextualNow === undefined ? {} : { contextualNow: input.contextualNow }),
          })
        : undefined;

    return {
      item,
      position: 0,
      ...(quality ? { quality } : {}),
      ...(signals ? { signals } : {}),
    };
  });

  const hasRating = ranked.some((entry) => entry.quality?.reputationScore !== undefined);
  const hasPopularity = ranked.some((entry) => entry.quality?.popularityScore !== undefined);
  const hasQualityCoverage = ranked.some((entry) => entry.quality !== undefined);
  const availableOrders: PlaceDiscoveryOrder[] = [
    ...(hasQualityCoverage ? (["recommended"] as const) : []),
    ...(hasRating ? (["rating"] as const) : []),
    ...(hasPopularity ? (["popularity"] as const) : []),
    "distance",
  ];
  const effectiveOrder = availableOrders.includes(requestedOrder) ? requestedOrder : "distance";

  const sorted = [...ranked].sort((left, right) => {
    const byOrder = compareByOrder(effectiveOrder, left, right);
    return byOrder || compareFallback(left, right);
  });

  return {
    items: sorted.map((entry, index) => ({ ...entry, position: index + 1 })),
    order: effectiveOrder,
    hasQualityCoverage,
    availableOrders,
  };
}

export function buildPlaceDiscoveryTopLists(
  items: readonly RankedPlaceDiscoveryItem[],
  limit = 5,
): PlaceDiscoveryTopList[] {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new RangeError("O limite do Top de Places deve ser um inteiro positivo.");
  }

  return PLACE_CATEGORIES.flatMap((category) => {
    const categoryItems = items
      .filter((entry) => itemCategory(entry.item) === category && entry.quality !== undefined)
      .sort((left, right) => {
        const byScore = compareOptionalDescending(left.quality?.score, right.quality?.score);
        return byScore || compareFallback(left, right);
      })
      .slice(0, limit);

    return categoryItems.length > 0 ? [{ category, items: categoryItems }] : [];
  });
}
