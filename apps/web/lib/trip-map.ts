export type TripMapPointKind =
  | "accommodation"
  | "published-place"
  | "saved-place"
  | "itinerary-activity";

export type TripMapPoint = {
  id: string;
  label: string;
  kind: TripMapPointKind;
  latitude: number;
  longitude: number;
  href?: string;
  sequence?: number;
};

export type TripMapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

const DEFAULT_PADDING_DEGREES = 0.01;

export function deriveTripMapBounds(points: readonly TripMapPoint[]): TripMapBounds | undefined {
  if (points.length === 0) return undefined;

  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const north = Math.max(...latitudes);
  const south = Math.min(...latitudes);
  const east = Math.max(...longitudes);
  const west = Math.min(...longitudes);

  return {
    north: north === south ? north + DEFAULT_PADDING_DEGREES : north,
    south: north === south ? south - DEFAULT_PADDING_DEGREES : south,
    east: east === west ? east + DEFAULT_PADDING_DEGREES : east,
    west: east === west ? west - DEFAULT_PADDING_DEGREES : west,
  };
}

export function isValidTripMapPoint(point: TripMapPoint): boolean {
  return (
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    point.latitude >= -90 &&
    point.latitude <= 90 &&
    point.longitude >= -180 &&
    point.longitude <= 180
  );
}
