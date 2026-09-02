import { describe, expect, it } from "vitest";

import type { Place } from "./place";
import {
  canPromoteExternalImageToControlledAsset,
  isStrongExternalPlaceIdentityMatch,
  mapOverturePlaceCategory,
  reconcileExternalPlaceCandidate,
  validatePlaceSearchQuery,
  type ExternalPlaceCandidate,
  type ExternalPlaceImageCandidate,
} from "./external-place";

function place(overrides: Partial<Place> = {}): Place {
  const now = new Date("2026-08-15T15:00:00.000Z");
  return {
    id: "10000000-0000-4000-8000-000000000001",
    destinationId: "pipa-rn-br",
    slug: "praia-do-amor",
    name: "Praia do Amor",
    summary: "Praia conhecida de Pipa usada no catálogo canônico do RouteBook.",
    category: "beach",
    latitude: -6.2386,
    longitude: -35.0455,
    publicationStatus: "published",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function candidate(overrides: Partial<ExternalPlaceCandidate> = {}): ExternalPlaceCandidate {
  return {
    provider: "overture",
    externalId: "08b2-example",
    name: "Praia do Amor",
    latitude: -6.2387,
    longitude: -35.0456,
    providerCategory: "beach",
    category: "beach",
    sourceUrl: "https://overturemaps.org/",
    sourceLicense: "Apache-2.0",
    collectedAt: new Date("2026-08-15T15:00:00.000Z"),
    confidence: 0.98,
    ...overrides,
  };
}

function imageCandidate(
  overrides: Partial<ExternalPlaceImageCandidate> = {},
): ExternalPlaceImageCandidate {
  return {
    provider: "wikimedia-commons",
    externalPlaceId: "08b2-example",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Praia_do_Amor.jpg",
    sourceName: "Wikimedia Commons",
    license: "CC-BY-SA-4.0",
    attribution: "Autor de exemplo",
    collectedAt: new Date("2026-08-15T15:00:00.000Z"),
    cachePolicy: "download_allowed",
    ...overrides,
  };
}

describe("mapOverturePlaceCategory", () => {
  it.each([
    ["beach", "beach"],
    ["restaurant", "gastronomy"],
    ["coffee_shop", "gastronomy"],
    ["bar", "nightlife"],
    ["night_club", "nightlife"],
    ["scenic_viewpoint", "nature"],
  ] as const)("mapeia %s para %s", (externalCategory, canonicalCategory) => {
    expect(mapOverturePlaceCategory(externalCategory)).toBe(canonicalCategory);
  });

  it("usa a hierarquia quando a categoria primária é mais específica que o ACL", () => {
    expect(
      mapOverturePlaceCategory("sushi_restaurant", ["dining_and_drinking", "restaurant"]),
    ).toBe("gastronomy");
  });

  it("não transforma POI relacionado em praia somente por ancestral da taxonomia", () => {
    expect(mapOverturePlaceCategory("beach_club", ["leisure", "beach"])).toBeUndefined();
    expect(mapOverturePlaceCategory("parking", ["transportation", "beach"])).toBeUndefined();
  });

  it("mantém beach quando a evidência de categoria é direta", () => {
    expect(mapOverturePlaceCategory("beach", ["outdoors", "natural_feature"])).toBe("beach");
  });

  it("não inventa categoria canônica para categoria desconhecida", () => {
    expect(mapOverturePlaceCategory("pet_store")).toBeUndefined();
  });
});

describe("validatePlaceSearchQuery", () => {
  it("aceita uma busca geográfica limitada", () => {
    expect(() =>
      validatePlaceSearchQuery({
        center: { latitude: -6.23, longitude: -35.05 },
        radiusMeters: 15_000,
        categories: ["beach", "gastronomy"],
        limit: 100,
      }),
    ).not.toThrow();
  });

  it("rejeita raio que permitiria varredura não governada", () => {
    expect(() =>
      validatePlaceSearchQuery({
        center: { latitude: -6.23, longitude: -35.05 },
        radiusMeters: 100_000,
      }),
    ).toThrow("entre 1 e 50000 metros");
  });
});

describe("isStrongExternalPlaceIdentityMatch", () => {
  it("reconhece sufixo local sem depender de stopword regional", () => {
    const canonical = place({
      name: "Camarão na Fazenda",
      slug: "camarao-na-fazenda",
      category: "gastronomy",
      latitude: -6.229,
      longitude: -35.048,
    });
    const external = candidate({
      name: "Camarão na Fazenda Pipa",
      providerCategory: "restaurant",
      category: "gastronomy",
      latitude: -6.2292,
      longitude: -35.0481,
    });

    expect(isStrongExternalPlaceIdentityMatch(external, canonical)).toBe(true);
  });

  it("reconhece segundo destino sem remover o nome da cidade da identidade", () => {
    const canonical = place({
      destinationId: "florianopolis-sc-br",
      slug: "projeto-tamar",
      name: "Projeto Tamar",
      category: "nature",
      latitude: -27.5747,
      longitude: -48.4242,
    });
    const external = candidate({
      externalId: "tamar-floripa",
      name: "Projeto Tamar Florianópolis",
      providerCategory: "tourist_attraction",
      category: "nature",
      latitude: -27.5748,
      longitude: -48.4241,
    });

    expect(isStrongExternalPlaceIdentityMatch(external, canonical)).toBe(true);
  });

  it("não funde filial homônima quando os endereços divergem", () => {
    const canonical = place({
      destinationId: "florianopolis-sc-br",
      slug: "cafe-cultura-centro",
      name: "Café Cultura",
      category: "gastronomy",
      latitude: -27.596,
      longitude: -48.549,
      addressLabel: "Rua Felipe Schmidt, 100, Florianópolis — SC",
    });
    const external = candidate({
      externalId: "cafe-cultura-outra-filial",
      name: "Café Cultura",
      providerCategory: "cafe",
      category: "gastronomy",
      latitude: -27.5963,
      longitude: -48.5492,
      addressLabel: "Rua Bocaiúva, 200, Florianópolis — SC",
    });

    expect(isStrongExternalPlaceIdentityMatch(external, canonical)).toBe(false);
  });

  it("rejeita homônimo distante mesmo com nome exatamente igual", () => {
    const canonical = place({
      destinationId: "florianopolis-sc-br",
      slug: "cafe-cultura-centro",
      name: "Café Cultura",
      category: "gastronomy",
      latitude: -27.596,
      longitude: -48.549,
    });
    const external = candidate({
      externalId: "cafe-cultura-distante",
      name: "Café Cultura",
      providerCategory: "cafe",
      category: "gastronomy",
      latitude: -27.61,
      longitude: -48.549,
    });

    expect(isStrongExternalPlaceIdentityMatch(external, canonical)).toBe(false);
  });

  it("aceita identidade distintiva curta acompanhada de descritor genérico", () => {
    const canonical = place({
      name: "Caxangá",
      slug: "caxanga",
      category: "gastronomy",
      latitude: -6.229,
      longitude: -35.048,
    });
    const external = candidate({
      name: "Caxangá Restaurante",
      providerCategory: "restaurant",
      category: "gastronomy",
      latitude: -6.2292,
      longitude: -35.0481,
    });

    expect(isStrongExternalPlaceIdentityMatch(external, canonical)).toBe(true);
  });

  it("reconhece endereço idêntico dentro do recorte local mesmo com nomes diferentes", () => {
    const canonical = place({
      name: "Nome editorial",
      category: "gastronomy",
      addressLabel: "Av. Baía dos Golfinhos, 100, Pipa — RN",
    });
    const external = candidate({
      name: "Nome comercial",
      providerCategory: "restaurant",
      category: "gastronomy",
      addressLabel: "Av. Baía dos Golfinhos, 100, Pipa — RN",
    });

    expect(isStrongExternalPlaceIdentityMatch(external, canonical)).toBe(true);
  });

  it("reconhece alias português/inglês da mesma praia", () => {
    const canonical = place({
      name: "Praia do Madeiro",
      slug: "praia-do-madeiro",
      latitude: -6.2214,
      longitude: -35.0573,
    });
    const external = candidate({
      name: "Madeiro Beach",
      latitude: -6.2216,
      longitude: -35.0572,
    });

    expect(isStrongExternalPlaceIdentityMatch(external, canonical)).toBe(true);
  });

  it("preserva Pipa como âncora quando ela é o próprio nome da praia", () => {
    const canonical = place({
      name: "Praia de Pipa",
      slug: "praia-de-pipa",
      latitude: -6.2293,
      longitude: -35.0488,
    });
    const external = candidate({
      name: "Pipa Beach",
      latitude: -6.2295,
      longitude: -35.0487,
    });

    expect(isStrongExternalPlaceIdentityMatch(external, canonical)).toBe(true);
  });

  it("não funde negócios vizinhos quando apenas categoria e proximidade coincidem", () => {
    const canonical = place({
      name: "Restaurante Horizonte",
      category: "gastronomy",
      latitude: -6.23,
      longitude: -35.05,
    });
    const external = candidate({
      name: "Restaurante Maré Alta",
      providerCategory: "restaurant",
      category: "gastronomy",
      latitude: -6.23005,
      longitude: -35.05005,
    });

    expect(isStrongExternalPlaceIdentityMatch(external, canonical)).toBe(false);
  });

  it("não funde praias genéricas que só compartilham a categoria nominal", () => {
    expect(
      isStrongExternalPlaceIdentityMatch(
        candidate({ name: "Praia de Pipa", latitude: -6.23, longitude: -35.05 }),
        place({ name: "Praia do Centro", latitude: -6.2301, longitude: -35.0501 }),
      ),
    ).toBe(false);
  });

  it("não funde praias vizinhas com âncoras nominais diferentes", () => {
    expect(
      isStrongExternalPlaceIdentityMatch(
        candidate({ name: "Madeiro Beach", latitude: -6.2215, longitude: -35.0573 }),
        place({ name: "Praia de Cacimbinhas", latitude: -6.2208, longitude: -35.0571 }),
      ),
    ).toBe(false);
  });
});

describe("reconcileExternalPlaceCandidate", () => {
  it("reconhece referência externa já vinculada", () => {
    const result = reconcileExternalPlaceCandidate(
      candidate(),
      [place()],
      [
        {
          placeId: "10000000-0000-4000-8000-000000000001",
          provider: "overture",
          externalId: "08b2-example",
        },
      ],
    );

    expect(result).toMatchObject({
      status: "linked",
      matchedPlaceId: "10000000-0000-4000-8000-000000000001",
      evidence: {
        externalReference: {
          provider: "overture",
          externalId: "08b2-example",
        },
      },
    });
  });

  it("não promove automaticamente candidato com provável duplicata", () => {
    const result = reconcileExternalPlaceCandidate(candidate(), [place()]);

    expect(result.status).toBe("possible_match");
    expect(result.matchedPlaceId).toBe("10000000-0000-4000-8000-000000000001");
    expect(result.distanceMeters).toBeLessThan(500);
    expect(result.evidence).toMatchObject({
      categoryMatch: true,
      nameMatch: "exact",
    });
  });

  it("retém variante nominal forte como possível duplicata", () => {
    const canonical = place({
      name: "Camarão na Fazenda",
      category: "gastronomy",
      latitude: -6.229,
      longitude: -35.048,
    });
    const result = reconcileExternalPlaceCandidate(
      candidate({
        name: "Camarão na Fazenda Pipa",
        providerCategory: "restaurant",
        category: "gastronomy",
        latitude: -6.2292,
        longitude: -35.0481,
      }),
      [canonical],
    );

    expect(result).toMatchObject({
      status: "possible_match",
      matchedPlaceId: canonical.id,
      evidence: {
        categoryMatch: true,
        nameMatch: "token-overlap",
      },
    });
  });

  it("retém alias de praia como possível duplicata forte", () => {
    const canonical = place({
      name: "Praia do Madeiro",
      slug: "praia-do-madeiro",
      latitude: -6.2214,
      longitude: -35.0573,
    });
    const result = reconcileExternalPlaceCandidate(
      candidate({
        externalId: "madeiro-beach",
        name: "Madeiro Beach",
        latitude: -6.2216,
        longitude: -35.0572,
      }),
      [canonical],
    );

    expect(result).toMatchObject({
      status: "possible_match",
      matchedPlaceId: canonical.id,
      evidence: {
        categoryMatch: true,
        nameMatch: "category-alias",
      },
    });
  });

  it("rejeita alias distante quando só o texto coincide", () => {
    const canonical = place({
      name: "Praia do Madeiro",
      slug: "praia-do-madeiro",
      latitude: -6.22271,
      longitude: -35.07068,
    });
    const external = candidate({
      externalId: "madeira-overture",
      name: "Praia Da Madeira",
      latitude: -6.236988,
      longitude: -35.048614,
    });

    expect(isStrongExternalPlaceIdentityMatch(external, canonical)).toBe(false);

    const result = reconcileExternalPlaceCandidate(external, [canonical]);
    expect(result.status).toBe("new");
  });

  it("rejeita typo nominal distante sem evidência geográfica suficiente", () => {
    const canonical = place({
      name: "Praia de Cacimbinhas",
      slug: "praia-de-cacimbinhas",
      latitude: -6.2137403,
      longitude: -35.077037,
    });
    const result = reconcileExternalPlaceCandidate(
      candidate({
        externalId: "casinbinha-overture",
        name: "Praia De Casinbinha",
        latitude: -6.228402,
        longitude: -35.049438,
      }),
      [canonical],
    );

    expect(result.status).toBe("new");
  });

  it("mantém filial homônima com endereço divergente como nova", () => {
    const canonical = place({
      destinationId: "florianopolis-sc-br",
      name: "Café Cultura",
      slug: "cafe-cultura-centro",
      category: "gastronomy",
      latitude: -27.596,
      longitude: -48.549,
      addressLabel: "Rua Felipe Schmidt, 100, Florianópolis — SC",
    });
    const result = reconcileExternalPlaceCandidate(
      candidate({
        externalId: "cafe-cultura-filial",
        name: "Café Cultura",
        providerCategory: "cafe",
        category: "gastronomy",
        latitude: -27.5962,
        longitude: -48.5491,
        addressLabel: "Rua Bocaiúva, 200, Florianópolis — SC",
      }),
      [canonical],
    );

    expect(result.status).toBe("new");
  });

  it("reconcilia segundo destino por tokens distintivos + proximidade", () => {
    const canonical = place({
      destinationId: "florianopolis-sc-br",
      name: "Projeto Tamar",
      slug: "projeto-tamar",
      category: "nature",
      latitude: -27.5747,
      longitude: -48.4242,
    });
    const result = reconcileExternalPlaceCandidate(
      candidate({
        externalId: "tamar-floripa",
        name: "Projeto Tamar Florianópolis",
        providerCategory: "tourist_attraction",
        category: "nature",
        latitude: -27.5748,
        longitude: -48.4241,
      }),
      [canonical],
    );

    expect(result).toMatchObject({
      status: "possible_match",
      matchedPlaceId: canonical.id,
      evidence: {
        categoryMatch: true,
        nameMatch: "token-overlap",
      },
    });
  });

  it("classifica candidato distante e sem vínculo como novo", () => {
    const result = reconcileExternalPlaceCandidate(
      candidate({
        externalId: "new-place",
        name: "Mirante Novo",
        providerCategory: "scenic_viewpoint",
        category: "nature",
        latitude: -6.2101,
        longitude: -35.0712,
      }),
      [place()],
    );

    expect(result.status).toBe("new");
  });

  it("falha fechado quando a categoria externa não possui mapeamento", () => {
    const { category: _category, ...unsupportedCandidate } = candidate({
      providerCategory: "pet_store",
    });
    void _category;
    const result = reconcileExternalPlaceCandidate(unsupportedCandidate, [place()]);

    expect(result.status).toBe("rejected");
    expect(result.reason).toContain("não possui mapeamento canônico");
  });

  it("rejeita candidato sem Provenance licenciável", () => {
    const result = reconcileExternalPlaceCandidate(candidate({ sourceLicense: "" }), [place()]);

    expect(result.status).toBe("rejected");
    expect(result.reason).toContain("licença");
  });
});

describe("ExternalPlaceImageCandidate", () => {
  it("permite promoção somente quando download/cache são explicitamente autorizados", () => {
    expect(canPromoteExternalImageToControlledAsset(imageCandidate())).toBe(true);
    expect(
      canPromoteExternalImageToControlledAsset(imageCandidate({ cachePolicy: "temporary_only" })),
    ).toBe(false);
    expect(
      canPromoteExternalImageToControlledAsset(imageCandidate({ cachePolicy: "unknown" })),
    ).toBe(false);
  });

  it("falha fechado para mídia sem licença verificável", () => {
    expect(canPromoteExternalImageToControlledAsset(imageCandidate({ license: "" }))).toBe(false);
  });

  it("falha fechado para URL de mídia não HTTPS", () => {
    expect(
      canPromoteExternalImageToControlledAsset(
        imageCandidate({ sourceUrl: "http://example.com/image.jpg" }),
      ),
    ).toBe(false);
  });
});
