import assert from "node:assert/strict";
import test from "node:test";

import {
  comparePlaceQualityProviders,
  fetchFoursquarePlacesForCategory,
  fetchGooglePlacesForCategory,
  summarizeProviderPlaces,
} from "./compare-place-quality-providers.mjs";

const category = { id: "beach", query: "praias em Pipa RN" };

test("resume cobertura Google sem perder volume de avaliações", () => {
  const summary = summarizeProviderPlaces("google", "beach", [
    {
      id: "google-1",
      displayName: { text: "Praia do Madeiro" },
      rating: 4.8,
      userRatingCount: 2_340,
      photos: [{ name: "photo-1" }],
      priceLevel: "PRICE_LEVEL_FREE",
    },
    {
      id: "google-2",
      displayName: { text: "Praia sem rating" },
      photos: [],
    },
  ]);

  assert.equal(summary.count, 2);
  assert.equal(summary.withRating, 1);
  assert.equal(summary.withReviewCount, 1);
  assert.equal(summary.withPhotos, 1);
  assert.equal(summary.top[0].reviewCount, 2_340);
});

test("resume rating e popularidade Foursquare em escalas independentes", () => {
  const summary = summarizeProviderPlaces("foursquare", "nightlife", [
    {
      fsq_place_id: "fsq-1",
      name: "Bar Exemplo",
      rating: 8.9,
      popularity: 0.84,
      stats: { total_ratings: 321 },
      photos: [{ id: "photo-1" }],
      price: 2,
    },
  ]);

  assert.equal(summary.withRating, 1);
  assert.equal(summary.withPopularity, 1);
  assert.equal(summary.withReviewCount, 1);
  assert.equal(summary.withPhotos, 1);
});

test("falha antes de qualquer chamada quando a credencial exigida está ausente", async () => {
  let calls = 0;
  const fetcher = async () => {
    calls += 1;
    return new Response(JSON.stringify({}));
  };

  await assert.rejects(
    () =>
      comparePlaceQualityProviders({
        providers: ["google", "foursquare"],
        googleKey: "google-key",
        foursquareKey: "",
        fetcher,
      }),
    /FOURSQUARE_PLACES_API_KEY/,
  );
  assert.equal(calls, 0);
});

test("Google usa FieldMask explícito e não inclui a chave no relatório", async () => {
  let request;
  const fetcher = async (input, init) => {
    request = { input: String(input), init };
    return new Response(
      JSON.stringify({
        places: [
          {
            id: "google-1",
            displayName: { text: "Praia do Madeiro" },
            rating: 4.8,
            userRatingCount: 2_340,
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  const result = await fetchGooglePlacesForCategory("secret-google", category, fetcher);

  assert.equal(result.count, 1);
  assert.equal(request.input, "https://places.googleapis.com/v1/places:searchText");
  assert.equal(request.init.headers["X-Goog-Api-Key"], "secret-google");
  assert.match(request.init.headers["X-Goog-FieldMask"], /places\.rating/);
  assert.doesNotMatch(JSON.stringify(result), /secret-google/);
});

test("Foursquare usa bearer, versão explícita e ordenação por rating", async () => {
  let request;
  const fetcher = async (input, init) => {
    request = { input: String(input), init };
    return new Response(
      JSON.stringify({
        results: [
          {
            fsq_place_id: "fsq-1",
            name: "Praia do Madeiro",
            rating: 9,
            popularity: 0.9,
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  const result = await fetchFoursquarePlacesForCategory("secret-fsq", category, fetcher);
  const url = new URL(request.input);

  assert.equal(result.count, 1);
  assert.equal(url.searchParams.get("sort"), "RATING");
  assert.match(url.searchParams.get("fields") ?? "", /rating/);
  assert.match(url.searchParams.get("fields") ?? "", /popularity/);
  assert.match(url.searchParams.get("fields") ?? "", /stats/);
  assert.equal(request.init.headers.Authorization, "Bearer secret-fsq");
  assert.equal(request.init.headers["X-Places-Api-Version"], "2025-06-17");
  assert.doesNotMatch(JSON.stringify(result), /secret-fsq/);
});
