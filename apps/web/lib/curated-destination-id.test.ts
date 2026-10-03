import { describe, expect, it } from "vitest";

import { resolveCuratedDestinationId } from "./curated-destination-id";

describe("resolveCuratedDestinationId", () => {
  it("uses the single curated destination id when the catalog is unambiguous", () => {
    expect(
      resolveCuratedDestinationId({
        destinationName: "Natal - RN",
        placeDestinationIds: ["natal-rn", "natal-rn", null],
      }),
    ).toBe("natal-rn");
  });

  it("keeps Pipa supported when nearby catalog entries have other destination ids", () => {
    expect(
      resolveCuratedDestinationId({
        destinationName: "Pipa, Tibau do Sul - RN",
        placeDestinationIds: ["pipa-rn-br", "nearby-region", null],
      }),
    ).toBe("pipa-rn-br");
  });

  it("does not infer support without matching curated places", () => {
    expect(
      resolveCuratedDestinationId({
        destinationName: "Pipa, Tibau do Sul - RN",
        placeDestinationIds: ["nearby-region"],
      }),
    ).toBe("nearby-region");
    expect(
      resolveCuratedDestinationId({
        destinationName: "Praia do Amor",
        placeDestinationIds: ["pipa-rn-br", "nearby-region"],
      }),
    ).toBeUndefined();
  });
});
