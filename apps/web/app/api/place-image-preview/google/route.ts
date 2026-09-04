import { resolveConfiguredGooglePlacePhotoProvider } from "../../../../lib/google-place-photo";

export const dynamic = "force-dynamic";

const NO_STORE = "private, no-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() ?? "";
  if (!token || token.length > 2_048) {
    return Response.json(
      { error: "Token de mídia inválido." },
      { status: 400, headers: { "Cache-Control": NO_STORE } },
    );
  }

  const configured = resolveConfiguredGooglePlacePhotoProvider();
  if (configured.status !== "configured") {
    return Response.json(
      { error: "Google Places Photos não está disponível neste ambiente." },
      { status: 404, headers: { "Cache-Control": NO_STORE } },
    );
  }

  try {
    const media = await configured.adapter.fetchMedia(token);
    if (!media) {
      return Response.json(
        { error: "A referência de mídia expirou ou não é válida." },
        { status: 404, headers: { "Cache-Control": NO_STORE } },
      );
    }

    return new Response(media.bytes, {
      status: 200,
      headers: {
        "Cache-Control": NO_STORE,
        "Content-Length": String(media.bytes.byteLength),
        "Content-Type": media.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.warn("[place-image-preview] Google Place Photo indisponível", {
      message: error instanceof Error ? error.message : "erro desconhecido",
    });
    return Response.json(
      { error: "A fotografia do Google Places está indisponível no momento." },
      { status: 503, headers: { "Cache-Control": NO_STORE } },
    );
  }
}
