import { afterEach, describe, expect, it, vi } from "vitest";

import { GeocodingProviderError, NominatimGeocoder } from "./geocoding";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("NominatimGeocoder", () => {
  it("normalizes the first valid result", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            display_name: "Condomínio Solar Água, Pipa, Tibau do Sul, RN, Brasil",
            lat: "-6.2302",
            lon: "-35.0503",
          },
        ]),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await new NominatimGeocoder("https://example.test").geocode(
      "Condomínio Solar Água, Pipa, RN",
    );

    expect(result).toEqual({
      normalizedAddress: "Condomínio Solar Água, Pipa, Tibau do Sul, RN, Brasil",
      latitude: -6.2302,
      longitude: -35.0503,
    });
    expect(fetchMock).toHaveBeenCalledOnce();

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.pathname).toBe("/search");
    expect(requestedUrl.searchParams.get("q")).toBe("Condomínio Solar Água, Pipa, RN");
    expect(requestedUrl.searchParams.get("limit")).toBe("1");
  });

  it("returns undefined when no location is found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 })),
    );

    await expect(
      new NominatimGeocoder("https://example.test").geocode("Endereço inexistente"),
    ).resolves.toBeUndefined();
  });

  it("rejects unavailable providers", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("erro", { status: 503 })));

    await expect(
      new NominatimGeocoder("https://example.test").geocode("Pipa, RN"),
    ).rejects.toBeInstanceOf(GeocodingProviderError);
  });

  it("rejects malformed coordinates", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([{ display_name: "Resultado inválido", lat: "200", lon: "x" }]),
          { status: 200 },
        ),
      ),
    );

    await expect(
      new NominatimGeocoder("https://example.test").geocode("Resultado inválido"),
    ).rejects.toThrow("localização inválida");
  });
});
