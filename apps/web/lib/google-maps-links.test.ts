import { describe, expect, it } from "vitest";

import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsItineraryUrl,
  buildGoogleMapsPlaceLabel,
  buildGoogleMapsSearchUrl,
} from "./google-maps-links";

describe("Google Maps links", () => {
  it("cria label semântico de Place com nome e endereço", () => {
    expect(
      buildGoogleMapsPlaceLabel({
        name: "Camarão na Fazenda Pipa",
        addressLabel: "Rua dos Bem-Te-Vis, 66, Praia da Pipa — RN",
      }),
    ).toBe("Camarão na Fazenda Pipa, Rua dos Bem-Te-Vis, 66, Praia da Pipa — RN");
  });

  it("cria busca textual codificada sem ativar SDK ou chave", () => {
    const url = new URL(
      buildGoogleMapsSearchUrl({
        name: "Praia do Amor",
        addressLabel: "Pipa, Tibau do Sul — RN",
        coordinate: { latitude: -6.2366, longitude: -35.0465 },
      }),
    );

    expect(url.origin).toBe("https://www.google.com");
    expect(url.pathname).toBe("/maps/search/");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("query")).toBe("Praia do Amor, Pipa, Tibau do Sul — RN");
  });

  it.each(["walking", "driving"] as const)(
    "prefere nome e endereço como destino da rota pública no modo %s",
    (travelMode) => {
      const url = new URL(
        buildGoogleMapsDirectionsUrl({
          origin: { latitude: -6.2302, longitude: -35.0503 },
          destination: { latitude: -6.2366, longitude: -35.0465 },
          destinationLabel: "Praia do Amor, Pipa, Tibau do Sul — RN",
          travelMode,
        }),
      );

      expect(url.pathname).toBe("/maps/dir/");
      expect(url.searchParams.get("origin")).toBe("-6.2302,-35.0503");
      expect(url.searchParams.get("destination")).toBe("Praia do Amor, Pipa, Tibau do Sul — RN");
      expect(url.searchParams.get("travelmode")).toBe(travelMode);
    },
  );

  it("usa coordenada validada quando o destino semântico não existe", () => {
    const url = new URL(
      buildGoogleMapsDirectionsUrl({
        origin: { latitude: -6.2302, longitude: -35.0503 },
        destination: { latitude: -6.2366, longitude: -35.0465 },
        travelMode: "walking",
      }),
    );

    expect(url.searchParams.get("destination")).toBe("-6.2366,-35.0465");
  });

  it("recusa coordenada inválida antes de montar um link", () => {
    expect(() =>
      buildGoogleMapsDirectionsUrl({
        origin: { latitude: 91, longitude: -35.0503 },
        destination: { latitude: -6.2366, longitude: -35.0465 },
        travelMode: "walking",
      }),
    ).toThrow("coordenada");
  });

  it("preserva a ordem das paradas intermediárias", () => {
    const url = new URL(
      buildGoogleMapsItineraryUrl({
        origin: { latitude: -6.2302, longitude: -35.0503 },
        waypoints: [
          { latitude: -6.2373, longitude: -35.0437 },
          { latitude: -6.245, longitude: -35.039 },
        ],
        destination: { latitude: -6.229395, longitude: -35.04994 },
        travelMode: "driving",
      }),
    );

    expect(url.searchParams.get("origin")).toBe("-6.2302,-35.0503");
    expect(url.searchParams.get("waypoints")).toBe("-6.2373,-35.0437|-6.245,-35.039");
    expect(url.searchParams.get("destination")).toBe("-6.229395,-35.04994");
    expect(url.searchParams.get("travelmode")).toBe("driving");
  });

  it("limita a sequência aos três waypoints suportados em navegador móvel", () => {
    expect(() =>
      buildGoogleMapsItineraryUrl({
        origin: { latitude: 0, longitude: 0 },
        waypoints: [
          { latitude: 1, longitude: 1 },
          { latitude: 2, longitude: 2 },
          { latitude: 3, longitude: 3 },
          { latitude: 4, longitude: 4 },
        ],
        destination: { latitude: 5, longitude: 5 },
        travelMode: "walking",
      }),
    ).toThrow(/no máximo três/);
  });
});
