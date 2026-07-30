"use server";

import {
  GeocodingProviderError,
  NominatimGeocoder,
  type GeocodingResult,
} from "@/lib/geocoding";

export type GeocodingActionState = {
  query: string;
  result?: GeocodingResult;
  error?: string;
};

export const initialGeocodingState: GeocodingActionState = {
  query: "",
};

export async function geocodeAccommodationAction(
  _state: GeocodingActionState,
  formData: FormData,
): Promise<GeocodingActionState> {
  const query = String(formData.get("geocodingQuery") ?? "").trim();

  if (query.length < 5) {
    return {
      query,
      error: "Informe um endereço mais completo para buscar a localização.",
    };
  }

  try {
    const result = await new NominatimGeocoder().geocode(query);

    if (!result) {
      return {
        query,
        error: "Nenhuma localização foi encontrada. Revise o endereço ou informe as coordenadas manualmente.",
      };
    }

    return { query, result };
  } catch (error) {
    if (error instanceof GeocodingProviderError) {
      return { query, error: error.message };
    }

    console.error("Falha inesperada ao geocodificar hospedagem", error);
    return {
      query,
      error: "Não foi possível buscar a localização agora. Tente novamente ou use as coordenadas manuais.",
    };
  }
}
