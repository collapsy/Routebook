const USER_AGENT = "RouteBookPlaceImageBot/0.1 (https://github.com/collapsy/Routebook)";
const MAXIMUM_IMAGE_BYTES = 3 * 1024 * 1024;
const CACHE_CONTROL = "public, s-maxage=86400, stale-while-revalidate=604800";
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function parseAllowedThumbnailUrl(value: string | null): URL | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "upload.wikimedia.org" ||
      !url.pathname.startsWith("/wikipedia/commons/thumb/")
    ) {
      return undefined;
    }
    return url;
  } catch {
    return undefined;
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const thumbnailUrl = parseAllowedThumbnailUrl(requestUrl.searchParams.get("url"));

  if (!thumbnailUrl) {
    return Response.json(
      { error: "URL de thumbnail externa inválida." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(thumbnailUrl, {
      signal: controller.signal,
      redirect: "error",
      headers: { "User-Agent": USER_AGENT },
    });
    if (!response.ok) {
      return Response.json(
        { error: "A mídia externa não respondeu corretamente." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
    const contentLength = Number(response.headers.get("content-length"));
    if (
      !ALLOWED_MIME_TYPES.has(contentType) ||
      (Number.isFinite(contentLength) && contentLength > MAXIMUM_IMAGE_BYTES)
    ) {
      return Response.json(
        { error: "A mídia externa não atende aos limites de segurança." },
        { status: 415, headers: { "Cache-Control": "no-store" } },
      );
    }

    const bytes = await response.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > MAXIMUM_IMAGE_BYTES) {
      return Response.json(
        { error: "A mídia externa excede o limite permitido." },
        { status: 413, headers: { "Cache-Control": "no-store" } },
      );
    }

    return new Response(bytes, {
      status: 200,
      headers: {
        "Cache-Control": CACHE_CONTROL,
        "Content-Length": String(bytes.byteLength),
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.warn("[place-image-preview] falha ao obter thumbnail licenciada", {
      host: thumbnailUrl.hostname,
      message: error instanceof Error ? error.message : "erro desconhecido",
    });
    return Response.json(
      { error: "A mídia externa está indisponível no momento." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  } finally {
    clearTimeout(timeout);
  }
}
