import "@testing-library/jest-dom/vitest";

import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ExternalPlaceImagePreview } from "./external-place-image-preview";

let intersectionCallback: IntersectionObserverCallback | undefined;

class ControlledIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "320px 0px";
  readonly scrollMargin = "0px";
  readonly thresholds = [0];

  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }

  disconnect() {}
  observe() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve() {}
}

function enterViewport() {
  if (!intersectionCallback) throw new Error("IntersectionObserver não foi registrado.");
  act(() => {
    intersectionCallback!(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });
}

const preview = {
  previewUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Pipa.jpg/640px-Pipa.jpg",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Pipa.jpg",
  sourceName: "Wikimedia Commons",
  license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  attribution: "Fotógrafo RouteBook",
  altText: "Fotografia licenciada de um lugar em Pipa.",
  matchEvidence: "Identidade e contexto local confirmados.",
} as const;

const googlePreview = {
  provider: "google-places",
  mediaUrl: "/api/place-image-preview/google?token=token-assinado",
  sourceUrl: "https://www.google.com/maps/place/?q=place_id:lava",
  sourceName: "Google Maps",
  authorAttributions: [
    {
      displayName: "Fotógrafo Google",
      uri: "https://maps.google.com/maps/contrib/123",
    },
  ],
  altText: "Fotografia de Lava Terrace fornecida pelo Google Maps.",
  matchEvidence: "Google Place ID revalidado por identidade e proximidade antes da mídia.",
} as const;

function renderPreview() {
  return render(
    <ExternalPlaceImagePreview
      category="beach"
      destinationId="pipa-rn-br"
      latitude={-6.2366}
      longitude={-35.0465}
      placeName="Praia do Amor"
    />,
  );
}

afterEach(() => {
  cleanup();
  intersectionCallback = undefined;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ExternalPlaceImagePreview", () => {
  it("não consulta mídia antes de aproximar o card do viewport e usa estado compacto", () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);

    renderPreview();

    expect(fetcher).not.toHaveBeenCalled();
    expect(screen.getByText("Sem foto")).toBeInTheDocument();
    expect(screen.queryByText("Imagem ilustrativa")).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Foto não disponível para Praia do Amor" }),
    ).toHaveAttribute("data-presentation", "compact");
  });

  it("usa fallback compacto sem request quando Media está desabilitada", () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);

    render(
      <ExternalPlaceImagePreview
        category="beach"
        destinationId="pipa-rn-br"
        enabled={false}
        latitude={-6.2366}
        longitude={-35.0465}
        placeName="Praia do Amor"
      />,
    );

    expect(fetcher).not.toHaveBeenCalled();
    expect(
      screen.getByRole("img", {
        name: "Foto não disponível para Praia do Amor",
      }),
    ).toHaveAttribute("data-presentation", "compact");
  });

  it("consulta Media também quando o Destination não possui id curado", async () => {
    const fetcher = vi.fn<(input: string | URL | Request) => Promise<Response>>(async () =>
      Response.json({ error: "miss" }, { status: 404 }),
    );
    vi.stubGlobal("fetch", fetcher);
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);

    render(
      <ExternalPlaceImagePreview
        category="nature"
        latitude={-27.5949}
        longitude={-48.5482}
        placeName="Lugar em Florianópolis"
      />,
    );
    enterViewport();

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    expect(String(fetcher.mock.calls[0]?.[0])).not.toContain("destinationId=");
    expect(
      await screen.findByRole("img", {
        name: "Foto não disponível para Lugar em Florianópolis",
      }),
    ).toHaveAttribute("data-presentation", "compact");
  });

  it("renderiza Google Photo governada e attribution quando existe Google Place ID", async () => {
    const fetcher = vi.fn<(input: string | URL | Request) => Promise<Response>>().mockResolvedValue(
      Response.json(googlePreview, {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);

    render(
      <ExternalPlaceImagePreview
        category="nightlife"
        destinationId="Antigua Guatemala"
        googlePlaceId="ChIJLavaTerrace01"
        latitude={14.5578}
        longitude={-90.7337}
        placeName="Lava Terrace"
      />,
    );
    enterViewport();

    const image = await screen.findByRole("img", { name: googlePreview.altText });
    expect(image).toHaveAttribute("src", googlePreview.mediaUrl);
    expect(screen.getByText("Google Maps")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Fotógrafo Google" })).toHaveAttribute(
      "href",
      "https://maps.google.com/maps/contrib/123",
    );
    expect(screen.getByRole("link", { name: "Ver no Google Maps" })).toHaveAttribute(
      "href",
      googlePreview.sourceUrl,
    );
    expect(String(fetcher.mock.calls[0]?.[0])).toContain("googlePlaceId=ChIJLavaTerrace01");
    expect(String(fetcher.mock.calls[0]?.[0])).toContain("category=nightlife");
  });

  it("renderiza foto licenciada e Provenance após match seguro", async () => {
    const fetcher = vi.fn<(input: string | URL | Request) => Promise<Response>>().mockResolvedValue(
      Response.json(preview, {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);

    renderPreview();
    enterViewport();

    const image = await screen.findByRole("img", { name: preview.altText });
    expect(image.getAttribute("src")).toContain("/api/place-image-preview/file?url=");
    expect(image.getAttribute("src")).not.toContain("commons.wikimedia.org/wiki");
    expect(screen.getByText(/Fotógrafo RouteBook/)).toBeInTheDocument();
    expect(screen.getByText(/CC BY-SA 4.0/)).toBeInTheDocument();
    expect(screen.getByText(/Wikimedia Commons/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver fonte" })).toHaveAttribute(
      "href",
      preview.sourceUrl,
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(String(fetcher.mock.calls[0]?.[0])).toContain("/api/place-image-preview?");
  });

  it("mantém fallback acessível quando nenhuma mídia segura é encontrada", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ error: "miss" }, { status: 404 })),
    );
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);

    renderPreview();
    enterViewport();

    await waitFor(() => {
      expect(
        screen.getByRole("img", {
          name: "Foto não disponível para Praia do Amor",
        }),
      ).toHaveAttribute("data-presentation", "compact");
    });
  });
});
