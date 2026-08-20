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

export function buildGoogleMapsPlaceLabel(input: {
  name: string;
  addressLabel?: string | undefined;
}): string | undefined {
  const name = input.name.trim();
  const address = input.addressLabel?.trim();
  const label = [name, address].filter(Boolean).join(", ");
  return label || undefined;
}

export function buildGoogleMapsSearchUrl(input: {
  name: string;
  addressLabel?: string | undefined;
  coordinate: GoogleMapsCoordinate;
}): string {
  const query = buildGoogleMapsPlaceLabel(input) ?? formatCoordinate(input.coordinate);
  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");
  url.searchParams.set("query", query);
  return url.toString();
}

export function buildGoogleMapsDirectionsUrl(input: {
  origin: GoogleMapsCoordinate;
  destination: GoogleMapsCoordinate;
  destinationLabel?: string | undefined;
  travelMode: GoogleMapsTravelMode;
}): string {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", formatCoordinate(input.origin));
  url.searchParams.set(
    "destination",
    input.destinationLabel?.trim() || formatCoordinate(input.destination),
  );
  url.searchParams.set("travelmode", input.travelMode);
  return url.toString();
}

export function buildGoogleMapsItineraryUrl(input: {
  origin: GoogleMapsCoordinate;
  destination: GoogleMapsCoordinate;
  waypoints: readonly GoogleMapsCoordinate[];
  travelMode: GoogleMapsTravelMode;
}): string {
  if (input.waypoints.length > 3) {
    throw new RangeError(
      "A sequência do Google Maps aceita no máximo três paradas intermediárias.",
    );
  }

  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", formatCoordinate(input.origin));
  url.searchParams.set("destination", formatCoordinate(input.destination));
  url.searchParams.set("travelmode", input.travelMode);

  if (input.waypoints.length > 0) {
    url.searchParams.set("waypoints", input.waypoints.map(formatCoordinate).join("|"));
  }

  return url.toString();
}
