import { describe, expect, it } from "vitest";

import { isPipaDestination } from "./pipa-destination";

describe("isPipaDestination", () => {
  it.each(["Pipa, Tibau do Sul - RN", "Praia da Pipa"])("recognizes %s", (name) => {
    expect(isPipaDestination({ name })).toBe(true);
  });

  it("does not infer Pipa from a different destination", () => {
    expect(isPipaDestination({ name: "Natal - RN" })).toBe(false);
  });
});
