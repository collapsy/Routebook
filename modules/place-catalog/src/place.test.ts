import { describe, expect, it } from "vitest";

import { createPlace, PlaceValidationError } from "./place";

const validPrimaryImage = {
  assetPath: "/place-images/pipa/praia-do-amor.webp",
  altText: "Vista da Praia do Amor entre falésias em Pipa.",
  sourceName: "Acervo RouteBook",
  sourceUrl: "https://example.com/acervo/praia-do-amor",
  license: "uso autorizado para o RouteBook",
  attribution: "Foto: Acervo RouteBook",
} as const;

const validInput = {
  destinationId: "pipa-rn-br",
  slug: "praia-do-amor",
  name: "Praia do Amor",
  summary: "Praia de falésias conhecida pelo visual marcante e pelo acesso a partir de Pipa.",
  category: "beach" as const,
  latitude: -6.2366,
  longitude: -35.0465,
  addressLabel: "Pipa, Tibau do Sul — RN",
  priceRange: "free" as const,
  publicationStatus: "published" as const,
};

describe("createPlace", () => {
  it("cria um lugar publicado com identidade e coordenadas válidas", () => {
    const place = createPlace(validInput, new Date("2026-07-29T00:00:00Z"));

    expect(place.destinationId).toBe("pipa-rn-br");
    expect(place.slug).toBe("praia-do-amor");
    expect(place.category).toBe("beach");
    expect(place.publicationStatus).toBe("published");
    expect(place.priceRange).toBe("free");
  });

  it("mantém endereço ausente como propriedade omitida", () => {
    const { addressLabel, ...withoutAddress } = validInput;
    expect(addressLabel).toBeTruthy();
    expect(createPlace(withoutAddress)).not.toHaveProperty("addressLabel");
  });

  it("cria Place global sem agrupamento editorial de Destination", () => {
    const { destinationId, ...globalInput } = validInput;
    expect(destinationId).toBe("pipa-rn-br");
    expect(createPlace(globalInput)).not.toHaveProperty("destinationId");
  });

  it("rejeita slug não canônico", () => {
    expect(() => createPlace({ ...validInput, slug: "Praia do Amor" })).toThrow(
      PlaceValidationError,
    );
  });

  it("rejeita coordenadas fora dos limites geográficos", () => {
    expect(() => createPlace({ ...validInput, latitude: -91 })).toThrow(PlaceValidationError);
  });

  it("mantém Price Range ausente como propriedade omitida", () => {
    const { priceRange, ...withoutPriceRange } = validInput;
    expect(priceRange).toBe("free");
    expect(createPlace(withoutPriceRange)).not.toHaveProperty("priceRange");
  });

  it("rejeita Price Range fora da linguagem do domínio", () => {
    expect(() => createPlace({ ...validInput, priceRange: "unknown" as never })).toThrow(
      PlaceValidationError,
    );
  });

  it("normaliza uma imagem principal com asset interno e Provenance declarada", () => {
    const place = createPlace({ ...validInput, primaryImage: validPrimaryImage });

    expect(place.primaryImage).toEqual(validPrimaryImage);
  });

  it("mantém imagem ausente como propriedade omitida", () => {
    expect(createPlace(validInput)).not.toHaveProperty("primaryImage");
  });

  it("rejeita URL externa como asset carregável", () => {
    expect(() =>
      createPlace({
        ...validInput,
        primaryImage: {
          ...validPrimaryImage,
          assetPath: "https://images.example.com/praia-do-amor.webp",
        },
      }),
    ).toThrow(PlaceValidationError);
  });

  it("rejeita imagem sem alt, origem ou licença declarada", () => {
    for (const primaryImage of [
      { ...validPrimaryImage, altText: "" },
      { ...validPrimaryImage, sourceName: "" },
      { ...validPrimaryImage, license: "" },
    ]) {
      expect(() => createPlace({ ...validInput, primaryImage })).toThrow(PlaceValidationError);
    }
  });

  it("aceita sourceUrl ausente, mas rejeita origem não HTTPS quando informada", () => {
    const withoutSourceUrl = {
      assetPath: validPrimaryImage.assetPath,
      altText: validPrimaryImage.altText,
      sourceName: validPrimaryImage.sourceName,
      license: validPrimaryImage.license,
      attribution: validPrimaryImage.attribution,
    };

    expect(
      createPlace({ ...validInput, primaryImage: withoutSourceUrl }).primaryImage,
    ).not.toHaveProperty("sourceUrl");

    expect(() =>
      createPlace({
        ...validInput,
        primaryImage: { ...validPrimaryImage, sourceUrl: "http://example.com/origem" },
      }),
    ).toThrow(PlaceValidationError);
  });
});
