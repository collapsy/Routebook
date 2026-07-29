import { describe, expect, it } from "vitest";

import { createPlace, PlaceValidationError } from "./place";

const validInput = {
  destinationId: "pipa-rn-br",
  slug: "praia-do-amor",
  name: "Praia do Amor",
  summary: "Praia de falésias conhecida pelo visual marcante e pelo acesso a partir de Pipa.",
  category: "beach" as const,
  latitude: -6.2366,
  longitude: -35.0465,
  addressLabel: "Pipa, Tibau do Sul — RN",
  publicationStatus: "published" as const,
};

describe("createPlace", () => {
  it("cria um lugar publicado com identidade e coordenadas válidas", () => {
    const place = createPlace(validInput, new Date("2026-07-29T00:00:00Z"));

    expect(place.destinationId).toBe("pipa-rn-br");
    expect(place.slug).toBe("praia-do-amor");
    expect(place.category).toBe("beach");
    expect(place.publicationStatus).toBe("published");
  });

  it("mantém endereço ausente como propriedade omitida", () => {
    const { addressLabel, ...withoutAddress } = validInput;
    expect(addressLabel).toBeTruthy();
    expect(createPlace(withoutAddress)).not.toHaveProperty("addressLabel");
  });

  it("rejeita slug não canônico", () => {
    expect(() => createPlace({ ...validInput, slug: "Praia do Amor" })).toThrow(
      PlaceValidationError,
    );
  });

  it("rejeita coordenadas fora dos limites geográficos", () => {
    expect(() => createPlace({ ...validInput, latitude: -91 })).toThrow(PlaceValidationError);
  });
});
