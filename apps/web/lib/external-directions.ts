import { createGeoCoordinate, type GeoCoordinate } from "@routebook/geo-distance";

const PUBLIC_DIRECTIONS_URL = "https://www.google.com/maps/dir/";

export class ExternalDirectionsUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExternalDirectionsUrlError";
  }
}

function formatCoordinate(coordinate: GeoCoordinate): string {
  return `${coordinate.latitude},${coordinate.longitude}`;
}

export function buildExternalDirectionsUrl(input: {
  origin: GeoCoordinate;
  destination: GeoCoordinate;
}): string {
  let origin: GeoCoordinate;
  let destination: GeoCoordinate;

  try {
    origin = createGeoCoordinate(input.origin);
    destination = createGeoCoordinate(input.destination);
  } catch {
    throw new ExternalDirectionsUrlError(
      "Não foi possível construir a rota externa com coordenadas inválidas.",
    );
  }

  const url = new URL(PUBLIC_DIRECTIONS_URL);
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", formatCoordinate(origin));
  url.searchParams.set("destination", formatCoordinate(destination));

  return url.toString();
}
