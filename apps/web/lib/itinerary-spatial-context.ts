import { createGeoCoordinate, type GeoCoordinate } from "@routebook/geo-distance";
import type { Place } from "@routebook/place-catalog";
import type { Accommodation, Activity, Itinerary } from "@routebook/trip-management";

export type SpatialPointKind = "accommodation" | "activity";

export type ItinerarySpatialPoint = {
  id: string;
  label: string;
  kind: SpatialPointKind;
  coordinate: GeoCoordinate;
  sequence?: number;
  activityId?: string;
  placeId?: string;
  placeSlug?: string;
};

export type SpatialUnavailableReason =
  "manual-activity" | "place-not-found" | "coordinates-unavailable";

type SpatialActivityStepBase = {
  activityId: string;
  title: string;
  order: number;
  placeId?: string;
};

export type SpatialActivityStep =
  | (SpatialActivityStepBase & {
      status: "available";
      point: ItinerarySpatialPoint;
    })
  | (SpatialActivityStepBase & {
      status: "unavailable";
      reason: SpatialUnavailableReason;
    });

export type SpatialAccommodation =
  | {
      status: "available";
      point: ItinerarySpatialPoint;
    }
  | {
      status: "not-provided" | "coordinates-unavailable";
      label?: string;
    };

export type ItineraryDaySpatialContext = {
  dayId: string;
  dayDate: string;
  accommodation: SpatialAccommodation;
  activitySteps: SpatialActivityStep[];
};

export type PublishedPlaceSpatialSource = Pick<Place, "id" | "name" | "slug"> &
  Partial<Pick<Place, "latitude" | "longitude">>;

export class ItinerarySpatialContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ItinerarySpatialContextError";
  }
}

function resolveCoordinate(latitude: unknown, longitude: unknown): GeoCoordinate | undefined {
  if (typeof latitude !== "number" || typeof longitude !== "number") return undefined;

  try {
    return createGeoCoordinate({ latitude, longitude });
  } catch {
    return undefined;
  }
}

function deriveAccommodation(accommodation?: Accommodation): SpatialAccommodation {
  if (!accommodation) return { status: "not-provided" };

  const coordinate = resolveCoordinate(
    accommodation.coordinate?.latitude,
    accommodation.coordinate?.longitude,
  );

  if (!coordinate) {
    return { status: "coordinates-unavailable", label: accommodation.name };
  }

  return {
    status: "available",
    point: {
      id: "accommodation",
      label: accommodation.name,
      kind: "accommodation",
      coordinate,
    },
  };
}

function deriveActivityStep(
  activity: Activity,
  placesById: ReadonlyMap<string, PublishedPlaceSpatialSource>,
): SpatialActivityStep {
  if (!activity.placeId) {
    return {
      activityId: activity.id,
      title: activity.title,
      order: activity.order,
      status: "unavailable",
      reason: "manual-activity",
    };
  }

  const place = placesById.get(activity.placeId);
  if (!place) {
    return {
      activityId: activity.id,
      title: activity.title,
      order: activity.order,
      placeId: activity.placeId,
      status: "unavailable",
      reason: "place-not-found",
    };
  }

  const coordinate = resolveCoordinate(place.latitude, place.longitude);
  if (!coordinate) {
    return {
      activityId: activity.id,
      title: activity.title,
      order: activity.order,
      placeId: activity.placeId,
      status: "unavailable",
      reason: "coordinates-unavailable",
    };
  }

  return {
    activityId: activity.id,
    title: activity.title,
    order: activity.order,
    placeId: activity.placeId,
    status: "available",
    point: {
      id: activity.id,
      label: activity.title,
      kind: "activity",
      coordinate,
      sequence: activity.order,
      activityId: activity.id,
      placeId: activity.placeId,
      placeSlug: place.slug,
    },
  };
}

export function deriveItineraryDaySpatialContext(input: {
  itinerary: Itinerary;
  dayDate: string;
  publishedPlaces: readonly PublishedPlaceSpatialSource[];
  accommodation?: Accommodation;
}): ItineraryDaySpatialContext {
  const day = input.itinerary.days.find((candidate) => candidate.date === input.dayDate);
  if (!day) {
    throw new ItinerarySpatialContextError("O dia selecionado não pertence a este roteiro.");
  }

  const placesById = new Map(input.publishedPlaces.map((place) => [place.id, place]));
  const orderedActivities = [...day.activities].sort((left, right) => left.order - right.order);

  return {
    dayId: day.id,
    dayDate: day.date,
    accommodation: deriveAccommodation(input.accommodation),
    activitySteps: orderedActivities.map((activity) => deriveActivityStep(activity, placesById)),
  };
}
