import { describe, expect, it } from "vitest";

import { presentAccommodationDistance } from "./distance";

describe("place distance presentation", () => {
  it("names the stage destination when the visit has no located accommodation", () => {
    const result = presentAccommodationDistance(
      { latitude: -27.0905, longitude: -48.6112 },
      { latitude: -27.091, longitude: -48.612 },
      "do destino da etapa",
    );
    expect(result?.description).toBe(
      "Distância estimada em linha reta a partir do destino da etapa.",
    );
  });
});
