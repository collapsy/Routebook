import { describe, expect, it } from "vitest";

import { buildGoogleMapsDirectionsUrl, buildGoogleMapsSearchUrl } from "./google-maps-links";

describe("Google Maps links", () => {
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
    expect(url.searchParams.get("query")).toBe(
      "Praia do Amor, Pipa, Tibau do Sul — RN",
    );
  });

  it.each(["walking", "driving"] as const)(
    "cria rota pública no modo %s a partir de coordenadas validadas",
    (travelMode) => {
      const url = new URL(
        buildGoogleMapsDirectionsUrl({
          origin: { latitude: -6.2302, longitude: -35.0503 },
          destination: { latitude: -6.2366, longitude: -35.0465 },
          travelMode,
        }),
      );

      expect(url.pathname).toBe("/maps/dir/");
      expect(url.searchParams.get("origin")).toBe("-6.2302,-35.0503");
      expect(url.searchParams.get("destination")).toBe("-6.2366,-35.0465");
      expect(url.searchParams.get("travelmode")).toBe(travelMode);
    },
  );

  it("recusa coordenada inválida antes de montar um link", () => {
    expect(() =>
      buildGoogleMapsDirectionsUrl({
        origin: { latitude: 91, longitude: -35.0503 },
        destination: { latitude: -6.2366, longitude: -35.0465 },
        travelMode: "walking",
      }),
    ).toThrow("coordenada");
  });
});
