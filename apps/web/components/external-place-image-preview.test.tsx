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

const wikimediaPreview = {
  provider: "wikimedia-commons",
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
  mediaUrl: "/api/place-image-preview/google?token=payload.signature",
  sourceUrl: "https://www.google.com/maps/place/?q=place_id:abc",
  sourceName: "Google Maps",
  authorAttributions: [
    {
      displayName: "Pessoa fotógrafa",
      uri: "https://maps.google.com/maps/contrib/123",
    },
  ],
  altText: "Fotografia de Avenida Paulista fornecida pelo Google Maps.",
  matchEvidence: "Google Place ID revalidado por identidade e proximidade antes da mídia.",
} as const;

function renderWikimediaPreview() {
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
  it("não consulta mídia antes de aproximar o card do viewport", () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);

    renderWikimediaPreview();

    expect(fetcher).not.toHaveBeenCalled();
    expect(screen.getByText("Fotografia sob demanda")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Fotografia sob demanda para Praia do Amor" }))
      .toHaveAttribute("data-category-illustration", "beach")
      .toHaveAttribute("data-place-image-fallback", "true");
  });

  it("usa fallback sem request quando Media está desabilitada", () => {
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
        name: "Ilustração de Praia para Praia do Amor — não é foto do local",
      }),
    ).toHaveAttribute("data-category-illustration", "beach");
  });

  it("usa fallback sem request quando não existe fonte de mídia governada", () => {
    const fetcher = vi.fn();
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

    expect(fetcher).not.toHaveBeenCalled();
    expect(
      screen.getByRole("img", {
        name: "Ilustração de Natureza para Lugar em Florianópolis — não é foto do local",
      }),
    ).toBeInTheDocument();
  });

  it("renderiza Wikimedia licenciada após match seguro", async () => {
    const fetcher = vi.fn<(input: string | URL | Request) => Promise<Response>>().mockResolvedValue(
      Response.json(wikimediaPreview, {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);

    renderWikimediaPreview();
    enterViewport();

    const image = await screen.findByRole("img", { name: wikimediaPreview.altText });
    expect(image.getAttribute("src")).toContain("/api/place-image-preview/file?url=");
    expect(screen.getByText(/Fotógrafo RouteBook/)).toBeInTheDocument();
    expect(screen.getByText(/CC BY-SA 4.0/)).toBeInTheDocument();
    expect(screen.getByText(/Wikimedia Commons/)).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("renderiza Google Maps com atribuição e link da autora sem Destination Pipa", async () => {
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
        category="nature"
        googlePlaceId="ChIJAvenidaPaulista01"
        latitude={-23.5615}
        longitude={-46.6559}
        placeName="Avenida Paulista"
      />,
    );
    enterViewport();

    const image = await screen.findByRole("img", { name: googlePreview.altText });
    expect(image).toHaveAttribute("src", googlePreview.mediaUrl);
    expect(screen.getByText("Google Maps")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pessoa fotógrafa" })).toHaveAttribute(
      "href",
      "https://maps.google.com/maps/contrib/123",
    );
    expect(screen.getByRole("link", { name: "Ver no Google Maps" })).toHaveAttribute(
      "href",
      googlePreview.sourceUrl,
    );
    expect(String(fetcher.mock.calls[0]?.[0])).toContain("googlePlaceId=ChIJAvenidaPaulista01");
  });

  it("mantém fallback acessível quando nenhuma mídia segura é encontrada", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ error: "miss" }, { status: 404 })),
    );
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);

    renderWikimediaPreview();
    enterViewport();

    await waitFor(() => {
      expect(
        screen.getByRole("img", {
          name: "Ilustração de Praia para Praia do Amor — não é foto do local",
        }),
      ).toHaveAttribute("data-category-illustration", "beach");
    });
  });
});
