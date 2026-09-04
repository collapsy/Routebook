import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GET /api/place-image-preview/google", () => {
  it("rejeita token ausente sem chamar Provider", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(new Request("http://localhost/api/place-image-preview/google"));

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("degrada quando Provider não está configurado", async () => {
    vi.stubEnv("ROUTEBOOK_PLACE_PHOTO_PROVIDER", "");
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "");

    const response = await GET(
      new Request("http://localhost/api/place-image-preview/google?token=abc"),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("bloqueia Production mesmo quando existe key", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    vi.stubEnv("ROUTEBOOK_PLACE_PHOTO_PROVIDER", "google");
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "secret-google");
    vi.stubEnv("VERCEL_ENV", "production");

    const response = await GET(
      new Request("http://localhost/api/place-image-preview/google?token=abc"),
    );

    expect(response.status).toBe(404);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
