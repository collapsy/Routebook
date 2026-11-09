import "@testing-library/jest-dom/vitest";

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    expect(screen.queryByText("Sem foto")).not.toBeInTheDocument();
    expect(screen.getByText("Foto ainda não carregada")).toBeInTheDocument();
    expect(screen.queryByText("Imagem ilustrativa")).not.toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: "Carregando foto para Praia do Amor" }),
    ).toHaveAttribute("data-presentation", "compact");
  });

  it("não deixa o budget server-side desabilitar permanentemente um card que chega ao viewport", async () => {
    const fetcher = vi.fn(async () => Response.json({ error: "miss" }, { status: 404 }));
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
    enterViewport();

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByRole("img", {
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

describe("recuperação de mídia", () => {
  it("distingue indisponibilidade de ausência e permite duas novas tentativas", async () => {
    const fetcher = vi.fn(async () => Response.json({}, { status: 503 }));
    vi.stubGlobal("fetch", fetcher);
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);
    renderPreview();
    enterViewport();
    for (let retry = 0; retry < 2; retry++) {
      fireEvent.click(
        await screen.findByRole("button", { name: "Tentar carregar foto novamente" }),
      );
    }
    await screen.findByText("Tente novamente quando voltar a esta página.");
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(screen.queryByText("Sem foto")).not.toBeInTheDocument();
  });

  it("tenta Wikimedia uma única vez após erro dos bytes Google", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json(googlePreview))
      .mockResolvedValueOnce(Response.json(preview));
    vi.stubGlobal("fetch", fetcher);
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);
    const { container } = renderPreview();
    enterViewport();
    const google = await screen.findByRole("img", { name: googlePreview.altText });
    expect(container.querySelector('[data-external-place-image-state="ready"]')).toBeNull();
    fireEvent.error(google);
    const commons = await screen.findByRole("img", { name: preview.altText });
    expect(String(fetcher.mock.calls[1]?.[0])).toContain("source=wikimedia");
    fireEvent.load(commons);
    expect(container.querySelector('[data-external-place-image-state="ready"]')).not.toBeNull();
    expect(screen.queryByText("Carregando foto…")).not.toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("não transforma falha Google seguida de miss Wikimedia em ausência confirmada", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(Response.json(googlePreview))
        .mockResolvedValueOnce(Response.json({}, { status: 404 })),
    );
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);
    renderPreview();
    enterViewport();
    fireEvent.error(await screen.findByRole("img", { name: googlePreview.altText }));
    await screen.findByRole("button", { name: "Tentar carregar foto novamente" });
    expect(screen.queryByText("Sem foto")).not.toBeInTheDocument();
  });

  it("cancela a requisição antiga ao mudar Lugar e ignora sua resposta tardia", async () => {
    let resolveOld!: (response: Response) => void;
    const fetcher = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveOld = resolve;
          }),
      )
      .mockResolvedValueOnce(Response.json({}, { status: 404 }));
    vi.stubGlobal("fetch", fetcher);
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);
    const { rerender } = renderPreview();
    enterViewport();
    const signal = fetcher.mock.calls[0]?.[1].signal as AbortSignal;
    rerender(
      <ExternalPlaceImagePreview
        placeName="Outro lugar"
        latitude={1}
        longitude={2}
        category="nature"
      />,
    );
    expect(signal.aborted).toBe(true);
    expect(screen.getByText("Foto ainda não carregada")).toBeInTheDocument();
    enterViewport();
    await screen.findByText("Sem foto");
    await act(async () => resolveOld(Response.json(googlePreview)));
    expect(screen.queryByRole("img", { name: googlePreview.altText })).not.toBeInTheDocument();
  });
});
