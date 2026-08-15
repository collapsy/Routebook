import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  assertImageBytes,
  materializePlaceImages,
  parseCommonsImageInfo,
  validatePlaceImageManifest,
  verifyPlaceImageAssets,
} from "./materialize-place-images.mjs";

const jpegBytes = Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
  Buffer.from("routebook-place-image-fixture"),
  Buffer.from([0xff, 0xd9]),
]);

function entry(overrides = {}) {
  return {
    placeSlug: "praia-do-amor",
    fileTitle: "File:Praia do Amor, Pipa, Brazil.jpg",
    sourcePageUrl: "https://commons.wikimedia.org/wiki/File:Praia_do_Amor,_Pipa,_Brazil.jpg",
    expectedAuthor: "Flaviohmg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    assetPath: "/place-images/pipa/praia-do-amor.jpg",
    altText: "Vista da Praia do Amor em Pipa usada como fixture de teste.",
    matchStatus: "secure",
    matchEvidence: "Título e descrição identificam explicitamente Praia do Amor em Pipa.",
    sourceSha1: "",
    assetSha256: "",
    assetBytes: 0,
    ...overrides,
  };
}

function manifest(entries = [entry()]) {
  return {
    version: 1,
    provider: "wikimedia-commons",
    requestedWidth: 1280,
    entries,
  };
}

function commonsPayload(overrides = {}) {
  return {
    query: {
      pages: [
        {
          title: "File:Praia do Amor, Pipa, Brazil.jpg",
          imageinfo: [
            {
              descriptionurl:
                "https://commons.wikimedia.org/wiki/File:Praia_do_Amor,_Pipa,_Brazil.jpg",
              url: "https://upload.wikimedia.org/example/praia-do-amor-original.jpg",
              thumburl: "https://upload.wikimedia.org/example/1280px-praia-do-amor.jpg",
              width: 2048,
              mime: "image/jpeg",
              sha1: "3110c3c6dbe053ffed9adc3f2f7c74d92841ee23",
              extmetadata: {
                Artist: { value: '<a href="/wiki/User:Flaviohmg">Flaviohmg</a>' },
                LicenseShortName: { value: "CC BY-SA 4.0" },
                LicenseUrl: { value: "https://creativecommons.org/licenses/by-sa/4.0/" },
                ImageDescription: { value: "Praia do Amor, Pipa" },
              },
              ...overrides,
            },
          ],
        },
      ],
    },
  };
}

describe("manifesto de imagens", () => {
  it("aceita somente curadoria secure, hosts oficiais e paths internos", () => {
    assert.doesNotThrow(() => validatePlaceImageManifest(manifest()));
    assert.throws(
      () => validatePlaceImageManifest(manifest([entry({ matchStatus: "ambiguous" })])),
      /Somente correspondência secure/,
    );
    assert.throws(
      () =>
        validatePlaceImageManifest(
          manifest([entry({ sourcePageUrl: "https://example.com/wiki/File:Praia.jpg" })]),
        ),
      /commons.wikimedia.org/,
    );
    assert.throws(
      () => validatePlaceImageManifest(manifest([entry({ assetPath: "/remote/praia.jpg" })])),
      /assetPath fora do contrato/,
    );
  });
});

describe("metadata do Commons", () => {
  it("seleciona thumbnail limitada e preserva Provenance/licença", () => {
    const result = parseCommonsImageInfo(commonsPayload(), entry());
    assert.equal(result.downloadUrl, "https://upload.wikimedia.org/example/1280px-praia-do-amor.jpg");
    assert.equal(result.mime, "image/jpeg");
    assert.equal(result.artist, "Flaviohmg");
    assert.equal(result.license, "CC BY-SA 4.0");
  });

  it("falha fechado se autor, licença ou host do download divergirem", () => {
    assert.throws(
      () =>
        parseCommonsImageInfo(
          commonsPayload({ extmetadata: { Artist: { value: "Outra Pessoa" }, LicenseShortName: { value: "CC BY-SA 4.0" } } }),
          entry(),
        ),
      /Autor retornado/,
    );
    assert.throws(
      () => parseCommonsImageInfo(commonsPayload({ url: "https://example.com/image.jpg" }), entry()),
      /upload.wikimedia.org/,
    );
  });
});

describe("materialização", () => {
  it("consulta metadata, baixa somente upload.wikimedia.org e produz integridade", async () => {
    const requests = [];
    const writes = [];
    const fetcher = async (input) => {
      const url = String(input);
      requests.push(url);
      if (url.startsWith("https://commons.wikimedia.org/w/api.php")) {
        return new Response(JSON.stringify(commonsPayload()), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      assert.equal(url, "https://upload.wikimedia.org/example/1280px-praia-do-amor.jpg");
      return new Response(jpegBytes, { status: 200, headers: { "content-type": "image/jpeg" } });
    };

    const result = await materializePlaceImages(manifest(), {
      fetcher,
      ensureDirectory: async () => {},
      writeAsset: async (filePath, buffer) => writes.push({ filePath, buffer }),
    });

    assert.equal(requests.length, 2);
    assert.equal(writes.length, 1);
    assert.equal(result.entries[0].assetBytes, jpegBytes.length);
    assert.equal(
      result.entries[0].assetSha256,
      createHash("sha256").update(jpegBytes).digest("hex"),
    );
    assert.equal(result.entries[0].sourceSha1, "3110c3c6dbe053ffed9adc3f2f7c74d92841ee23");
  });

  it("verifica os assets offline pelo hash, tamanho e assinatura", async () => {
    const assetSha256 = createHash("sha256").update(jpegBytes).digest("hex");
    const completeManifest = manifest([
      entry({
        sourceSha1: "3110c3c6dbe053ffed9adc3f2f7c74d92841ee23",
        assetSha256,
        assetBytes: jpegBytes.length,
      }),
    ]);

    await assert.doesNotReject(() =>
      verifyPlaceImageAssets(completeManifest, { readAsset: async () => jpegBytes }),
    );
    await assert.rejects(
      () => verifyPlaceImageAssets(completeManifest, { readAsset: async () => Buffer.from(jpegBytes).fill(0, 5, 8) }),
      /SHA-256 diverge/,
    );
  });

  it("rejeita bytes que não correspondem ao MIME", () => {
    assert.throws(() => assertImageBytes(Buffer.alloc(64), "image/jpeg"), /não corresponde/);
  });
});
