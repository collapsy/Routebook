import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const fixtures = [
  {
    id: "antigua-cafe-sky-place",
    name: "Cafe Sky",
    latitude: 14.555487,
    longitude: -90.729565,
  },
  {
    id: "antigua-lava-terrace-place",
    name: "Lava Terrace Bar and Burgers",
    latitude: 14.55781,
    longitude: -90.73345,
  },
  {
    id: "sao-paulo-casa-do-porco-place",
    name: "A Casa do Porco Bar",
    latitude: -23.544874,
    longitude: -46.64465,
  },
  {
    id: "sao-paulo-dona-onca-place",
    name: "Bar da Dona Onça",
    latitude: -23.5465084,
    longitude: -46.6445317,
  },
] as const;

function nearestFixture(latitude: number, longitude: number) {
  const fixture = [...fixtures].sort((left, right) => {
    const leftDistance = Math.hypot(left.latitude - latitude, left.longitude - longitude);
    const rightDistance = Math.hypot(right.latitude - latitude, right.longitude - longitude);
    return leftDistance - rightDistance;
  })[0];
  if (!fixture) throw new Error("Fixture de probe ausente.");
  return fixture;
}

function googleFetcher() {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);

    if (url.pathname.endsWith("/places:searchText")) {
      const body = JSON.parse(String(init?.body)) as {
        locationBias: { circle: { center: { latitude: number; longitude: number } } };
      };
      const center = body.locationBias.circle.center;
      const fixture = nearestFixture(center.latitude, center.longitude);
      return new Response(
        JSON.stringify({
          places: [
            {
              id: fixture.id,
              displayName: { text: fixture.name },
              location: { latitude: fixture.latitude, longitude: fixture.longitude },
              rating: 4.6,
              userRatingCount: 420,
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    if (url.pathname.endsWith("/media")) {
      return new Response(new Uint8Array([1, 2, 3, 4]), {
        status: 200,
        headers: { "content-type": "image/jpeg", "content-length": "4" },
      });
    }

    const placeId = decodeURIComponent(url.pathname.split("/").at(-1) ?? "");
    const fixture = fixtures.find((candidate) => candidate.id === placeId);
    if (!fixture) return new Response("not found", { status: 404 });

    return new Response(
      JSON.stringify({
        id: fixture.id,
        displayName: { text: fixture.name },
        location: { latitude: fixture.latitude, longitude: fixture.longitude },
        photos: [
          {
            name: `places/${fixture.id}/photos/photo-0`,
            authorAttributions: [
              {
                displayName: "Fotógrafo de teste",
                uri: "https://www.google.com/maps/contrib/123",
              },
            ],
            googleMapsUri: "https://www.google.com/maps/place/test",
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GET /api/internal/place-media-probe", () => {
  it("permanece indisponível fora do Preview e da branch autorizada", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_GIT_COMMIT_REF", "main");

    const response = await GET();

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("mede Quality e bytes Google sem expor IDs, tokens, resource names ou secret", async () => {
    const fetcher = googleFetcher();
    vi.stubGlobal("fetch", fetcher);
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_GIT_COMMIT_REF", "codex/rb-inc-190-google-place-photos-current-stack");
    vi.stubEnv("ROUTEBOOK_PLACE_QUALITY_PROVIDER", "google");
    vi.stubEnv("ROUTEBOOK_PLACE_PHOTO_PROVIDER", "google");
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "test-google-key");

    const response = await GET();
    const payload = (await response.json()) as {
      status: string;
      targetCount: number;
      qualityMatchCount: number;
      photoReadyCount: number;
      mediaReadyCount: number;
      scenarios: readonly {
        id: string;
        qualityMatchCount: number;
        photoReadyCount: number;
        mediaReadyCount: number;
      }[];
    };
    const serialized = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
    expect(payload).toMatchObject({
      status: "ok",
      targetCount: 4,
      qualityMatchCount: 4,
      photoReadyCount: 4,
      mediaReadyCount: 4,
    });
    expect(payload.scenarios).toEqual([
      expect.objectContaining({
        id: "antigua-guatemala",
        qualityMatchCount: 2,
        photoReadyCount: 2,
        mediaReadyCount: 2,
      }),
      expect.objectContaining({
        id: "sao-paulo",
        qualityMatchCount: 2,
        photoReadyCount: 2,
        mediaReadyCount: 2,
      }),
    ]);
    expect(serialized).not.toContain("test-google-key");
    expect(serialized).not.toContain("mediaToken");
    expect(serialized).not.toContain("placeId");
    expect(serialized).not.toContain("/photos/");
    for (const fixture of fixtures) expect(serialized).not.toContain(fixture.id);
  });
});
