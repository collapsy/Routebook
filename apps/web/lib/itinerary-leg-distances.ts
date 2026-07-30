import { calculateGeodesicDistance, type GeoCoordinate } from "@routebook/geo-distance";

import type {
  ItineraryDaySpatialContext,
  ItinerarySpatialPoint,
  SpatialActivityStep,
} from "./itinerary-spatial-context";

export type ItineraryLegKind = "outbound" | "between-activities" | "return";

export type ItineraryLegEndpoint = {
  id: string;
  label: string;
  kind: "accommodation" | "activity";
  coordinate: GeoCoordinate;
};

export type ItineraryLegUnavailableReason =
  "origin-unavailable" | "destination-unavailable" | "both-unavailable";

export type ItinerarySpatialLeg =
  | {
      id: string;
      kind: ItineraryLegKind;
      status: "available";
      origin: ItineraryLegEndpoint;
      destination: ItineraryLegEndpoint;
      distanceMeters: number;
    }
  | {
      id: string;
      kind: ItineraryLegKind;
      status: "unavailable";
      originLabel: string;
      destinationLabel: string;
      reason: ItineraryLegUnavailableReason;
    };

export type ItineraryDayLegSummary = {
  legs: ItinerarySpatialLeg[];
  totalMeters?: number;
};

type LegNode = {
  id: string;
  label: string;
  endpoint?: ItineraryLegEndpoint;
};

function pointToEndpoint(point: ItinerarySpatialPoint): ItineraryLegEndpoint {
  return {
    id: point.id,
    label: point.label,
    kind: point.kind,
    coordinate: point.coordinate,
  };
}

function activityToNode(step: SpatialActivityStep): LegNode {
  return {
    id: step.activityId,
    label: step.title,
    ...(step.status === "available" ? { endpoint: pointToEndpoint(step.point) } : {}),
  };
}

function deriveLeg(
  kind: ItineraryLegKind,
  origin: LegNode,
  destination: LegNode,
): ItinerarySpatialLeg {
  const id = `${kind}:${origin.id}:${destination.id}`;

  if (origin.endpoint && destination.endpoint) {
    return {
      id,
      kind,
      status: "available",
      origin: origin.endpoint,
      destination: destination.endpoint,
      distanceMeters: calculateGeodesicDistance(
        origin.endpoint.coordinate,
        destination.endpoint.coordinate,
      ),
    };
  }

  return {
    id,
    kind,
    status: "unavailable",
    originLabel: origin.label,
    destinationLabel: destination.label,
    reason:
      !origin.endpoint && !destination.endpoint
        ? "both-unavailable"
        : origin.endpoint
          ? "destination-unavailable"
          : "origin-unavailable",
  };
}

export function deriveItineraryDayLegSummary(
  context: ItineraryDaySpatialContext,
): ItineraryDayLegSummary {
  const activities = context.activitySteps.map(activityToNode);
  const legs: ItinerarySpatialLeg[] = [];
  const accommodation =
    context.accommodation.status === "available"
      ? {
          id: context.accommodation.point.id,
          label: context.accommodation.point.label,
          endpoint: pointToEndpoint(context.accommodation.point),
        }
      : undefined;

  if (accommodation && activities[0]) {
    legs.push(deriveLeg("outbound", accommodation, activities[0]));
  }

  for (let index = 0; index < activities.length - 1; index += 1) {
    const origin = activities[index];
    const destination = activities[index + 1];
    if (origin && destination) {
      legs.push(deriveLeg("between-activities", origin, destination));
    }
  }

  const lastActivity = activities.at(-1);
  if (accommodation && lastActivity) {
    legs.push(deriveLeg("return", lastActivity, accommodation));
  }

  const totalMeters =
    legs.length > 0 && legs.every((leg) => leg.status === "available")
      ? legs.reduce(
          (total, leg) => total + (leg.status === "available" ? leg.distanceMeters : 0),
          0,
        )
      : undefined;

  return {
    legs,
    ...(totalMeters !== undefined ? { totalMeters } : {}),
  };
}

export function formatGeodesicDistance(distanceMeters: number): string {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    throw new RangeError("A distância deve ser um número finito maior ou igual a zero.");
  }

  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(distanceMeters / 1000)} km`;
}
