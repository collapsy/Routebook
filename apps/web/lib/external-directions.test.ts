import { describe, expect, it } from "vitest";

import { buildExternalDirectionsUrl, ExternalDirectionsUrlError } from "./external-directions";

describe("buildExternalDirectionsUrl", () => {
  it("builds a public HTTPS directions URL with encoded origin and destination", () => {
    const result = new URL(
      buildExternalDirectionsUrl({
        origin: { latitude: -6.2302, longitude: -35.0503 },
        destination: { latitude: -6.244, longitude: -35.041 },
      }),
    );

    expect(result.protocol).toBe("https:");
    expect(result.hostname).toBe("www.google.com");
    expect(result.pathname).toBe("/maps/dir/");
    expect(result.searchParams.get("api")).toBe("1");
    expect(result.searchParams.get("origin")).toBe("-6.2302,-35.0503");
    expect(result.searchParams.get("destination")).toBe("-6.244,-35.041");
  });

  it("preserves zero and negative coordinate values", () => {
    const result = new URL(
      buildExternalDirectionsUrl({
        origin: { latitude: 0, longitude: 0 },
        destination: { latitude: -10, longitude: -20 },
      }),
    );

    expect(result.searchParams.get("origin")).toBe("0,0");
    expect(result.searchParams.get("destination")).toBe("-10,-20");
  });

  it("rejects invalid origin or destination coordinates", () => {
    expect(() =>
      buildExternalDirectionsUrl({
        origin: { latitude: 91, longitude: 0 },
        destination: { latitude: 0, longitude: 0 },
      }),
    ).toThrowError(ExternalDirectionsUrlError);

    expect(() =>
      buildExternalDirectionsUrl({
        origin: { latitude: 0, longitude: 0 },
        destination: { latitude: Number.NaN, longitude: 0 },
      }),
    ).toThrowError(ExternalDirectionsUrlError);
  });
});
