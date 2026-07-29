export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

function assertFinite(value: number, field: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number`);
  }
}

export function createGeoCoordinate(input: GeoCoordinate): GeoCoordinate {
  assertFinite(input.latitude, "latitude");
  assertFinite(input.longitude, "longitude");

  if (input.latitude < -90 || input.latitude > 90) {
    throw new Error("latitude must be between -90 and 90");
  }

  if (input.longitude < -180 || input.longitude > 180) {
    throw new Error("longitude must be between -180 and 180");
  }

  return Object.freeze({
    latitude: input.latitude,
    longitude: input.longitude,
  });
}
