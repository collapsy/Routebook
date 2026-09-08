import { describe, expect, it, vi } from "vitest";

import {
  WikimediaCommonsPlaceImageAdapter,
  classifyWikimediaImageMatch,
  normalizeWikimediaImageRecord,
} from "./wikimedia-place-image";

function commonsPage(overrides: Record<string, unknown> = {}) {
  return {
    pageid: 123,
    title: "File:Praia do Amor, Pipa, Brazil.jpg",
    coordinates: [{ lat: -6.2366, lon: -35.0465, primary: "" }],
    imageinfo: [
      {
        descriptionurl: "https://commons.wikimedia.org/wiki/File:Praia_do_Amor,_Pipa,_Brazil.jpg",
        url: "https://upload.wikimedia.org/example/praia-do-amor.jpg",
        thumburl: "https://upload.wikimedia.org/example/1280px-praia-do-amor.jpg",
        mime: "image/jpeg",
        sha1: "source-sha1",
        extmetadata: {
          Artist: { value: '<a href="/wiki/User:Flaviohmg">Flaviohmg</a>' },
          LicenseShortName: { value: "CC BY-SA 4.0" },
          LicenseUrl: { value: "https://creativecommons.org/licenses/by-sa/4.0/" },
          ImageDescription: {
            value: "<span>View of Praia do Amor, Pipa Beach, Brazil</span>",
          },
        },
      },
    ],
    ...overrides,
  };
}

describe("normalizeWikimediaImageRecord", () => {
  it("normaliza metadata licenciada, coordenada e remove HTML da atribuição", () => {
    expect(normalizeWikimediaImageRecord(commonsPage())).toEqual({
      fileTitle: "File:Praia do Amor, Pipa, Brazil.jpg",
      descriptionUrl: "https://commons.wikimedia.org/wiki/File:Praia_do_Amor,_Pipa,_Brazil.jpg",
      mediaUrl: "https://upload.wikimedia.org/example/praia-do-amor.jpg",
      thumbnailUrl: "https://upload.wikimedia.org/example/1280px-praia-do-amor.jpg",
      mime: "image/jpeg",
      sourceSha1: "source-sha1",
      artist: "Flaviohmg",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      description: "View of Praia do Amor, Pipa Beach, Brazil",
      coordinate: { latitude: -6.2366, longitude: -35.0465 },
    });
  });

  it("rejeita mídia fora dos hosts oficiais", () => {
    const page = commonsPage();
    const info = page.imageinfo[0]!;
    expect(
      normalizeWikimediaImageRecord({
        ...page,
        imageinfo: [{ ...info, url: "https://example.com/praia.jpg" }],
      }),
    ).toBeUndefined();
  });

  it("rejeita licença não incluída na política de reutilização do incremento", () => {
    const page = commonsPage();
    const info = page.imageinfo[0]!;
    expect(
      normalizeWikimediaImageRecord({
        ...page,
        imageinfo: [
          {
            ...info,
            extmetadata: {
              ...info.extmetadata,
              LicenseShortName: { value: "All Rights Reserved" },
            },
          },
        ],
      }),
    ).toBeUndefined();
  });

  it("rejeita mídia sem autoria auditável", () => {
    const page = commonsPage();
    const info = page.imageinfo[0]!;
    expect(
      normalizeWikimediaImageRecord({
        ...page,
        imageinfo: [
          {
            ...info,
            extmetadata: {
              ...info.extmetadata,
              Artist: { value: "" },
            },
          },
        ],
      }),
    ).toBeUndefined();
  });
});

describe("classifyWikimediaImageMatch", () => {
  it("marca como secure quando identidade distintiva e contexto dinâmico aparecem", () => {
    expect(
      classifyWikimediaImageMatch(
        { name: "Lagoa de Guaraíras", contextLabel: "pipa-rn-br" },
        {
          fileTitle: "File:Lagoa Guaraíras.jpg",
          description:
            "Pôr do sol na Lagoa Guaraíras, vista a partir do município de Tibau do Sul, Pipa.",
        },
      ).status,
    ).toBe("secure");
  });

  it("reconhece equivalência bilíngue de centro com contexto dinâmico", () => {
    expect(
      classifyWikimediaImageMatch(
        { name: "Praia do Centro", contextLabel: "pipa-rn-br" },
        {
          fileTitle: "File:PipaBeachView.JPG",
          description:
            "A view of the centre of Pipa Beach/Praia da Pipa, as seen from the hill above Praia do Amor.",
        },
      ).status,
    ).toBe("secure");
  });

  it("usa coordenada da fotografia como contexto seguro em Destination sem id curado", () => {
    expect(
      classifyWikimediaImageMatch(
        {
          name: "Ponte Hercílio Luz",
          latitude: -27.5935,
          longitude: -48.5652,
        },
        {
          fileTitle: "File:Ponte Hercilio Luz Florianopolis.jpg",
          description: "Ponte Hercílio Luz vista do centro de Florianópolis.",
          coordinate: { latitude: -27.594, longitude: -48.566 },
        },
      ).status,
    ).toBe("secure");
  });

  it("mantém ambiguous quando só a identidade aparece", () => {
    expect(
      classifyWikimediaImageMatch(
        { name: "Praia do Madeiro" },
        {
          fileTitle: "File:Praia Ponta do Madeiro.jpg",
          description: "Madeiro Beach in Brazil.",
        },
      ).status,
    ).toBe("ambiguous");
  });

  it("mantém homônimo ambíguo quando o contexto informado não aparece", () => {
    expect(
      classifyWikimediaImageMatch(
        { name: "Baía dos Golfinhos", contextLabel: "pipa-rn-br" },
        {
          fileTitle: "File:Baía dos Golfinhos.jpg",
          description: "Baía dos Golfinhos - Fernando de Noronha - PE",
        },
      ).status,
    ).toBe("ambiguous");
  });

  it("não transforma nome genérico em identidade segura apenas pela proximidade", () => {
    expect(
      classifyWikimediaImageMatch(
        { name: "Sobremesa", latitude: 13.693, longitude: -89.2182 },
        {
          fileTitle: "File:Sobremesa.jpg",
          description: "Sobremesa servida no centro.",
          coordinate: { latitude: 13.6931, longitude: -89.2181 },
        },
      ).status,
    ).toBe("ambiguous");
  });

  it("rejeita mídia sem sinais do Place ou do destino", () => {
    expect(
      classifyWikimediaImageMatch(
        { name: "Praia do Amor", contextLabel: "pipa-rn-br" },
        {
          fileTitle: "File:Praia qualquer.jpg",
          description: "Praia no litoral brasileiro.",
        },
      ).status,
    ).toBe("rejected");
  });
});

describe("WikimediaCommonsPlaceImageAdapter", () => {
  it("consulta somente a API oficial e devolve candidato com Provenance", async () => {
    const fetcher = vi.fn<(input: string | URL | Request, init?: RequestInit) => Promise<Response>>(
      async () =>
        new Response(
          JSON.stringify({
            query: {
              pages: [commonsPage()],
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
    );
    const adapter = new WikimediaCommonsPlaceImageAdapter({
      fetcher,
      now: () => new Date("2026-08-15T18:00:00.000Z"),
    });

    const candidates = await adapter.findCandidates({
      name: "Praia do Amor",
      latitude: -6.2366,
      longitude: -35.0465,
    });

    expect(candidates).toEqual([
      {
        provider: "wikimedia-commons",
        externalPlaceId: "File:Praia do Amor, Pipa, Brazil.jpg",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Praia_do_Amor,_Pipa,_Brazil.jpg",
        sourceName: "Wikimedia Commons",
        license: "CC BY-SA 4.0",
        attribution: "Flaviohmg",
        collectedAt: new Date("2026-08-15T18:00:00.000Z"),
        cachePolicy: "download_allowed",
      },
    ]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    const call = fetcher.mock.calls[0];
    expect(call).toBeDefined();
    const [calledInput, init] = call!;
    const calledUrl = new URL(String(calledInput));
    expect(calledUrl.hostname).toBe("commons.wikimedia.org");
    expect(calledUrl.searchParams.get("gsrnamespace")).toBe("6");
    expect(calledUrl.searchParams.get("iiurlwidth")).toBe("1280");
    expect(calledUrl.searchParams.get("prop")).toBe("imageinfo|coordinates");
    expect(calledUrl.searchParams.get("maxlag")).toBe("1");
    expect(init?.headers).toMatchObject({
      "User-Agent": expect.stringContaining("https://github.com/collapsy/Routebook"),
      "Api-User-Agent": expect.stringContaining("https://github.com/collapsy/Routebook"),
    });
  });

  it("usa contexto de Destination sem acoplar a busca a Pipa", async () => {
    const fetcher = vi.fn<(input: string | URL | Request, init?: RequestInit) => Promise<Response>>(
      async () =>
        Response.json({
          query: {
            pages: [
              commonsPage({
                title: "File:Ponte Hercilio Luz Florianopolis.jpg",
                coordinates: [{ lat: -27.594, lon: -48.566, primary: "" }],
                imageinfo: [
                  {
                    descriptionurl:
                      "https://commons.wikimedia.org/wiki/File:Ponte_Hercilio_Luz_Florianopolis.jpg",
                    url: "https://upload.wikimedia.org/example/ponte.jpg",
                    thumburl: "https://upload.wikimedia.org/example/1280px-ponte.jpg",
                    mime: "image/jpeg",
                    extmetadata: {
                      Artist: { value: "Autor" },
                      LicenseShortName: { value: "CC BY 4.0" },
                      LicenseUrl: { value: "https://creativecommons.org/licenses/by/4.0/" },
                      ImageDescription: { value: "Ponte Hercílio Luz em Florianópolis" },
                    },
                  },
                ],
              }),
            ],
          },
        }),
    );
    const adapter = new WikimediaCommonsPlaceImageAdapter({ fetcher });

    const result = await adapter.findSecurePreview({
      name: "Ponte Hercílio Luz",
      latitude: -27.5935,
      longitude: -48.5652,
      contextLabel: "florianopolis-sc-br",
    });

    expect(result?.sourceName).toBe("Wikimedia Commons");
    const calledUrl = new URL(String(fetcher.mock.calls[0]?.[0]));
    expect(calledUrl.searchParams.get("gsrsearch")).toContain("florianopolis");
    expect(calledUrl.searchParams.get("gsrsearch")).not.toContain("Pipa Tibau do Sul");
  });

  it("propaga indisponibilidade da fonte sem produzir fallback falso", async () => {
    const adapter = new WikimediaCommonsPlaceImageAdapter({
      fetcher: async () => new Response("rate limited", { status: 429 }),
    });

    await expect(
      adapter.findCandidates({
        name: "Praia do Amor",
        latitude: -6.2366,
        longitude: -35.0503,
      }),
    ).rejects.toThrow("Wikimedia Commons respondeu 429");
  });
});
