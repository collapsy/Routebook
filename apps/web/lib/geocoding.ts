export type GeocodingResult = {
  normalizedAddress: string;
  latitude: number;
  longitude: number;
};

export interface Geocoder {
  geocode(query: string): Promise<GeocodingResult | undefined>;
}

type NominatimResult = {
  display_name?: unknown;
  lat?: unknown;
  lon?: unknown;
};

export class GeocodingProviderError extends Error {
  constructor(message = "O serviço de localização não está disponível no momento.") {
    super(message);
    this.name = "GeocodingProviderError";
  }
}

export class NominatimGeocoder implements Geocoder {
  constructor(
    private readonly endpoint = process.env.NOMINATIM_BASE_URL ??
      "https://nominatim.openstreetmap.org",
  ) {}

  async geocode(query: string): Promise<GeocodingResult | undefined> {
    const url = new URL("/search", this.endpoint);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "1");

    let response: Response;

    try {
      response = await fetch(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Accept-Language": "pt-BR,pt;q=0.9",
          "User-Agent": "RouteBook/0.1 (personal travel planner)",
        },
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      throw new GeocodingProviderError();
    }

    if (!response.ok) {
      throw new GeocodingProviderError();
    }

    const payload: unknown = await response.json();

    if (!Array.isArray(payload) || payload.length === 0) {
      return undefined;
    }

    const candidate = payload[0] as NominatimResult;
    const normalizedAddress =
      typeof candidate.display_name === "string" ? candidate.display_name.trim() : "";
    const latitude = Number(candidate.lat);
    const longitude = Number(candidate.lon);

    if (
      !normalizedAddress ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new GeocodingProviderError("O serviço retornou uma localização inválida.");
    }

    return { normalizedAddress, latitude, longitude };
  }
}
