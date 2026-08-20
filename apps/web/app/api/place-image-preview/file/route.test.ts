import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const allowedUrl =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Praia.jpg/640px-Praia.jpg";

function requestFor(url: string): Request {
  return new Request(
    `http://localhost/api/place-image-preview/file?url=${encodeURIComponent(url)}`,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GET /api/place-image-preview/file", () => {
  it("rejeita host e caminho não autorizados sem realizar fetch", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(requestFor("https://example.com/image.jpg"));

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("proxyfica thumbnail permitida com MIME e cache controlados", async () => {
    const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    const fetcher = vi.fn(
      async () =>
        new Response(bytes, {
          status: 200,
          headers: {
            "content-type": "image/png",
            "content-length": String(bytes.byteLength),
          },
        }),
    );
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(requestFor(allowedUrl));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Content-Length")).toBe(String(bytes.byteLength));
    expect(response.headers.get("Cache-Control")).toBe(
      "public, s-maxage=86400, stale-while-revalidate=604800",
    );
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
    expect(fetcher).toHaveBeenCalledWith(
      new URL(allowedUrl),
      expect.objectContaining({
        redirect: "error",
        headers: expect.objectContaining({ "User-Agent": expect.stringContaining("RouteBook") }),
      }),
    );
  });

  it("rejeita MIME fora da allowlist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("html", {
            status: 200,
            headers: { "content-type": "text/html", "content-length": "4" },
          }),
      ),
    );

    const response = await GET(requestFor(allowedUrl));

    expect(response.status).toBe(415);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("rejeita payload acima de 3 MiB antes de materializar bytes quando Content-Length informa excesso", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(new Uint8Array([1]), {
            status: 200,
            headers: {
              "content-type": "image/jpeg",
              "content-length": String(3 * 1024 * 1024 + 1),
            },
          }),
      ),
    );

    const response = await GET(requestFor(allowedUrl));

    expect(response.status).toBe(415);
  });

  it("isola falha da mídia remota", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("upstream", { status: 502 })),
    );

    const response = await GET(requestFor(allowedUrl));

    expect(response.status).toBe(502);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
