export type GoogleMapsCoordinate = Readonly<{
  latitude: number;
  longitude: number;
}>;

export type GoogleMapsTravelMode = "driving" | "walking";

function formatCoordinate(coordinate: GoogleMapsCoordinate): string {
  if (
    !Number.isFinite(coordinate.latitude) ||
    coordinate.latitude < -90 ||
    coordinate.latitude > 90 ||
    !Number.isFinite(coordinate.longitude) ||
    coordinate.longitude < -180 ||
    coordinate.longitude > 180
  ) {
    throw new RangeError("A coordenada do link para o Google Maps é inválida.");
  }

  return `${coordinate.latitude},${coordinate.longitude}`;
}

export function buildGoogleMapsSearchUrl(input: {
  name: string;
  addressLabel?: string | undefined;
  coordinate: GoogleMapsCoordinate;
}): string {
  const label = [input.name.trim(), input.addressLabel?.trim()].filter(Boolean).join(", ");
  const query = label || formatCoordinate(input.coordinate);
  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");
  url.searchParams.set("query", query);
  return url.toString();
}

export function buildGoogleMapsDirectionsUrl(input: {
  origin: GoogleMapsCoordinate;
  destination: GoogleMapsCoordinate;
  travelMode: GoogleMapsTravelMode;
}): string {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", formatCoordinate(input.origin));
  url.searchParams.set("destination", formatCoordinate(input.destination));
  url.searchParams.set("travelmode", input.travelMode);
  return url.toString();
}
