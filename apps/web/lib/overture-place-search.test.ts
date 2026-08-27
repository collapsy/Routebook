import { describe, expect, it, vi } from "vitest";

import {
  isPlausibleOvertureBeachName,
  OverturePmtilesPlaceSearchAdapter,
  parseLatestOvertureTileRelease,
  resolveOvertureTileSourceLicense,
  tileCoordinatesForRadius,
} from "./overture-place-search";

describe("OverturePmtilesPlaceSearchAdapter", () => {
  it("resolve a release mais recente a partir dos prefixes públicos do bucket", () => {
    const xml = `
      <ListBucketResult>
        <CommonPrefixes><Prefix>tiles/2026-05-20.0/</Prefix></CommonPrefixes>
        <CommonPrefixes><Prefix>tiles/2026-07-22.0/</Prefix></CommonPrefixes>
        <CommonPrefixes><Prefix>tiles/2026-06-17.0/</Prefix></CommonPrefixes>
      </ListBucketResult>
    `;

    expect(parseLatestOvertureTileRelease(xml)).toBe("2026-07-22.0");
  });

  it("preserva licença explícita e conhece datasets abertos aceitos", () => {
    expect(resolveOvertureTileSourceLicense({ license: "CC-BY-4.0" })).toBe("CC-BY-4.0");
    expect(resolveOvertureTileSourceLicense({ dataset: "fsq" })).toBe("Apache-2.0");
    expect(resolveOvertureTileSourceLicense({ dataset: "unknown-dataset" })).toBeUndefined();
  });

  it("aceita nomes plausíveis de praia e rejeita falsos positivos observados em Pipa", () => {
    for (const name of ["Praia do Madeiro", "Pipa Beach", "Baía dos Golfinhos"]) {
      expect(isPlausibleOvertureBeachName(name), name).toBe(true);
    }
    for (const name of [
      "Mirante Tibau do Sul",
      "Lagoa Guaraíras",
      "Rio Cunhaú",
      "Falésias do Chapadão",
      "Solar Pipa Praia Flats",
      "Pipa Beach Club",
      "Amo viajar e conhecer novas culturas",
    ]) {
      expect(isPlausibleOvertureBeachName(name), name).toBe(false);
    }
  });

  it("limita a consulta geográfica a um conjunto finito de tiles de Pipa", () => {
    const tiles = tileCoordinatesForRadius({ latitude: -6.2285, longitude: -35.0503 }, 8_000, 14);

    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles.length).toBeLessThanOrEqual(100);
    expect(new Set(tiles.map((tile) => `${tile.zoom}/${tile.x}/${tile.y}`)).size).toBe(
      tiles.length,
    );
  });

  it("monta o PMTiles da release resolvida e retorna vazio quando nenhum tile possui Place", async () => {
    const getZxy = vi.fn().mockResolvedValue(undefined);
    const createArchive = vi.fn(() => ({ getZxy }));
    const adapter = new OverturePmtilesPlaceSearchAdapter({
      createArchive,
      resolveRelease: async () => "2026-07-22.0",
      now: () => new Date("2026-08-15T16:30:00.000Z"),
    });

    const candidates = await adapter.search({
      destinationId: "pipa-rn-br",
      center: { latitude: -6.2285, longitude: -35.0503 },
      radiusMeters: 1_000,
      categories: ["beach"],
      limit: 10,
    });

    expect(candidates).toEqual([]);
    expect(createArchive).toHaveBeenCalledWith(
      "https://overturemaps-extras-us-west-2.s3.us-west-2.amazonaws.com/tiles/2026-07-22.0/places.pmtiles",
    );
    expect(getZxy).toHaveBeenCalled();
  });

  it("recusa raio amplo antes de realizar chamada ao Provider", async () => {
    const resolveRelease = vi.fn(async () => "2026-07-22.0");
    const adapter = new OverturePmtilesPlaceSearchAdapter({ resolveRelease });

    await expect(
      adapter.search({
        destinationId: "pipa-rn-br",
        center: { latitude: -6.2285, longitude: -35.0503 },
        radiusMeters: 8_001,
        limit: 10,
      }),
    ).rejects.toThrow("raio máximo");
    expect(resolveRelease).not.toHaveBeenCalled();
  });

  it("propaga indisponibilidade da fonte para a camada de experiência degradar com segurança", async () => {
    const adapter = new OverturePmtilesPlaceSearchAdapter({
      resolveRelease: async () => {
        throw new Error("Overture indisponível");
      },
    });

    await expect(
      adapter.search({
        destinationId: "pipa-rn-br",
        center: { latitude: -6.2285, longitude: -35.0503 },
        radiusMeters: 1_000,
        limit: 10,
      }),
    ).rejects.toThrow("Overture indisponível");
  });

  if (process.env.ROUTEBOOK_LIVE_OVERTURE === "1") {
    it("consulta o PMTiles público real pelo mesmo adapter usado na tela de Lugares", async () => {
      const adapter = new OverturePmtilesPlaceSearchAdapter();
      const candidates = await adapter.search({
        destinationId: "pipa-rn-br",
        center: { latitude: -6.2285, longitude: -35.0503 },
        radiusMeters: 3_000,
        limit: 10,
      });

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates.length).toBeLessThanOrEqual(10);
      expect(
        candidates.every(
          (candidate) =>
            candidate.provider === "overture" &&
            candidate.sourceLicense.length > 0 &&
            candidate.category !== undefined,
        ),
      ).toBe(true);

      const beaches = await adapter.search({
        destinationId: "pipa-rn-br",
        center: { latitude: -6.2285, longitude: -35.0503 },
        radiusMeters: 3_000,
        categories: ["beach"],
        limit: 40,
      });
      expect(beaches.length).toBeGreaterThan(0);
      expect(beaches.every((candidate) => isPlausibleOvertureBeachName(candidate.name))).toBe(true);
    });
  }
});
