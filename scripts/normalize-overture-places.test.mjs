import assert from "node:assert/strict";
import test from "node:test";

import {
  isPlausibleOvertureBeachName,
  mapOvertureCategory,
  normalizeOvertureFeature,
  normalizeOvertureFeatureCollection,
  resolveOvertureSourceLicense,
} from "./normalize-overture-places.mjs";

const collectedAt = new Date("2026-08-15T16:00:00.000Z");

function feature(overrides = {}) {
  return {
    type: "Feature",
    id: "gers-restaurant-1",
    geometry: { type: "Point", coordinates: [-35.05, -6.23] },
    properties: {
      names: { primary: "Restaurante Exemplo" },
      basic_category: "restaurant",
      taxonomy: { hierarchy: ["dining_and_drinking", "restaurant"] },
      confidence: 0.93,
      operating_status: "open",
      addresses: [{ freeform: "Avenida Baía dos Golfinhos, Pipa" }],
      sources: [{ property: "", dataset: "fsq", license: "Apache-2.0" }],
    },
    ...overrides,
  };
}

function beachFeature(name, overrides = {}) {
  return feature({
    id: `beach-${name}`,
    properties: {
      ...feature().properties,
      names: { primary: name },
      basic_category: "beach",
      taxonomy: { hierarchy: ["geographic_entities", "land_feature", "beach"] },
    },
    ...overrides,
  });
}

test("mapeia categoria diretamente ou por hierarquia sem herdar beach ambíguo", () => {
  assert.equal(mapOvertureCategory("restaurant"), "gastronomy");
  assert.equal(
    mapOvertureCategory("sushi_restaurant", ["dining_and_drinking", "restaurant"]),
    "gastronomy",
  );
  assert.equal(mapOvertureCategory("beach", ["geographic_entities", "beach"]), "beach");
  assert.equal(mapOvertureCategory("beach_club", ["leisure", "beach"]), undefined);
  assert.equal(mapOvertureCategory("pet_store"), undefined);
});

test("aceita nomes plausíveis de praia e rejeita POIs ou negócios mislabeled", () => {
  for (const name of ["Praia do Madeiro", "Pipa Beach", "Baía dos Golfinhos"]) {
    assert.equal(isPlausibleOvertureBeachName(name), true, name);
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
    assert.equal(isPlausibleOvertureBeachName(name), false, name);
  }
});

test("resolve licença explícita e fallback conhecido por dataset", () => {
  assert.equal(
    resolveOvertureSourceLicense({ dataset: "fsq", license: "Apache-2.0" }),
    "Apache-2.0",
  );
  assert.equal(resolveOvertureSourceLicense({ dataset: "meta" }), "CDLA-Permissive-2.0");
  assert.equal(resolveOvertureSourceLicense({ dataset: "unknown-provider" }), undefined);
});

test("normaliza feature licenciada como candidato RouteBook", () => {
  const result = normalizeOvertureFeature(feature(), { collectedAt, minimumConfidence: 0.7 });

  assert.equal(result.reason, undefined);
  assert.deepEqual(result.candidate, {
    provider: "overture",
    externalId: "gers-restaurant-1",
    name: "Restaurante Exemplo",
    latitude: -6.23,
    longitude: -35.05,
    providerCategory: "restaurant",
    providerCategoryHierarchy: ["dining_and_drinking", "restaurant"],
    category: "gastronomy",
    addressLabel: "Avenida Baía dos Golfinhos, Pipa",
    sourceUrl: "https://docs.overturemaps.org/guides/places/",
    sourceLicense: "Apache-2.0",
    collectedAt: collectedAt.toISOString(),
    confidence: 0.93,
  });
});

test("normaliza praia plausível e rejeita falso positivo mesmo quando Overture marca beach", () => {
  const valid = normalizeOvertureFeature(beachFeature("Praia do Amor"), { collectedAt });
  const mirante = normalizeOvertureFeature(beachFeature("Mirante Tibau do Sul"), { collectedAt });
  const flats = normalizeOvertureFeature(beachFeature("Solar Pipa Praia Flats"), { collectedAt });

  assert.equal(valid.candidate?.category, "beach");
  assert.equal(mirante.reason, "implausible-beach-name");
  assert.equal(flats.reason, "implausible-beach-name");
});

test("filtra fechamento permanente, baixa confiança, categoria desconhecida e licença ausente", () => {
  const permanentlyClosed = feature({
    properties: { ...feature().properties, operating_status: "permanently_closed" },
  });
  const lowConfidence = feature({
    id: "low-confidence",
    properties: { ...feature().properties, confidence: 0.2 },
  });
  const unknownCategory = feature({
    id: "unknown-category",
    properties: { ...feature().properties, basic_category: "pet_store", taxonomy: undefined },
  });
  const unknownLicense = feature({
    id: "unknown-license",
    properties: {
      ...feature().properties,
      sources: [{ property: "", dataset: "unknown-provider" }],
    },
  });

  assert.equal(
    normalizeOvertureFeature(permanentlyClosed, { collectedAt }).reason,
    "permanently-closed",
  );
  assert.equal(normalizeOvertureFeature(lowConfidence, { collectedAt }).reason, "low-confidence");
  assert.equal(
    normalizeOvertureFeature(unknownCategory, { collectedAt }).reason,
    "unsupported-category",
  );
  assert.equal(
    normalizeOvertureFeature(unknownLicense, { collectedAt }).reason,
    "missing-source-license",
  );
});

test("deduplica por externalId, ordena por confiança e respeita limite", () => {
  const collection = {
    type: "FeatureCollection",
    features: [
      feature({ id: "same", properties: { ...feature().properties, confidence: 0.8 } }),
      feature({ id: "same", properties: { ...feature().properties, confidence: 0.95 } }),
      feature({
        id: "other",
        properties: {
          ...feature().properties,
          names: { primary: "Outro Restaurante" },
          confidence: 0.9,
        },
      }),
    ],
  };

  const normalized = normalizeOvertureFeatureCollection(collection, {
    collectedAt,
    minimumConfidence: 0.7,
    limit: 1,
  });

  assert.equal(normalized.inputFeatureCount, 3);
  assert.equal(normalized.candidateCount, 1);
  assert.equal(normalized.candidates[0].externalId, "same");
  assert.equal(normalized.candidates[0].confidence, 0.95);
});
