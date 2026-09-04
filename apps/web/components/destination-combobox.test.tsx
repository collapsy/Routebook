import "@testing-library/jest-dom/vitest";

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DestinationCombobox } from "./destination-combobox";

function jsonResponse(payload: unknown, status = 200) {
  return Promise.resolve(
    Response.json(payload, {
      status,
      headers: { "content-type": "application/json" },
    }),
  );
}

async function debounce() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 330));
  });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("DestinationCombobox", () => {
  it("só busca depois de três caracteres e exibe no máximo cinco sugestões", async () => {
    const suggestions = Array.from({ length: 7 }, (_, index) => ({
      reference: `place-${index}`,
      label: `São Paulo ${index}, Brasil`,
      primaryText: `São Paulo ${index}`,
      secondaryText: "Brasil",
      provider: "google" as const,
      attribution: "Google Maps" as const,
    }));
    const fetcher = vi.fn(() =>
      jsonResponse({ enabled: true, suggestions, attribution: "Google Maps" }),
    );
    vi.stubGlobal("fetch", fetcher);

    render(<DestinationCombobox />);
    const input = screen.getByRole("combobox", { name: "" });

    fireEvent.change(input, { target: { value: "sp" } });
    await debounce();
    expect(fetcher).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "sao" } });
    await debounce();

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(String(fetcher.mock.calls[0]?.[0])).toContain("q=sao");
    expect(screen.getAllByRole("option")).toHaveLength(5);
    expect(screen.getByText("Google Maps")).toHaveAttribute("translate", "no");
  });

  it("permite selecionar com teclado e invalida a referência ao editar", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        jsonResponse({
          enabled: true,
          suggestions: [
            {
              reference: "fixture:sao-paulo-sp-br",
              label: "São Paulo, SP, Brasil",
              primaryText: "São Paulo",
              secondaryText: "SP, Brasil",
              provider: "fixture",
              attribution: "RouteBook test fixture",
            },
          ],
        }),
      ),
    );

    const { container } = render(<DestinationCombobox />);
    const input = container.querySelector<HTMLInputElement>("#destination");
    if (!input) throw new Error("Destination input not rendered.");

    fireEvent.change(input, { target: { value: "sao paulo" } });
    await debounce();
    await screen.findByRole("option", { name: /São Paulo/ });

    fireEvent.keyDown(input, { key: "Enter" });
    expect(input).toHaveValue("São Paulo, SP, Brasil");
    expect(container.querySelector<HTMLInputElement>('input[name="destinationProvider"]')).toHaveValue(
      "fixture",
    );
    expect(
      container.querySelector<HTMLInputElement>('input[name="destinationReference"]'),
    ).toHaveValue("fixture:sao-paulo-sp-br");

    fireEvent.change(input, { target: { value: "São Paulo, SP" } });
    expect(
      container.querySelector<HTMLInputElement>('input[name="destinationReference"]'),
    ).toHaveValue("");
    expect(screen.getByText(/Destino selecionado/)).not.toBeInTheDocument();
  });

  it("preserva o texto e informa degradação quando sugestões estão desabilitadas", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        jsonResponse({
          enabled: false,
          suggestions: [],
          message: "Sugestões de destinos não estão disponíveis neste ambiente.",
        }),
      ),
    );

    const { container } = render(<DestinationCombobox />);
    const input = container.querySelector<HTMLInputElement>("#destination");
    if (!input) throw new Error("Destination input not rendered.");

    fireEvent.change(input, { target: { value: "Recife" } });
    await debounce();

    expect(input).toHaveValue("Recife");
    expect(screen.getByText(/sugestões automáticas não estão disponíveis/i)).toBeInTheDocument();
  });

  it("ignora resposta antiga quando uma consulta nova já venceu", async () => {
    let resolveFirst: ((response: Response) => void) | undefined;
    const first = new Promise<Response>((resolve) => {
      resolveFirst = resolve;
    });
    const fetcher = vi
      .fn<() => Promise<Response>>()
      .mockImplementationOnce(() => first)
      .mockImplementationOnce(() =>
        jsonResponse({
          enabled: true,
          suggestions: [
            {
              reference: "recife",
              label: "Recife, PE, Brasil",
              primaryText: "Recife",
              secondaryText: "PE, Brasil",
              provider: "google",
              attribution: "Google Maps",
            },
          ],
          attribution: "Google Maps",
        }),
      );
    vi.stubGlobal("fetch", fetcher);

    const { container } = render(<DestinationCombobox />);
    const input = container.querySelector<HTMLInputElement>("#destination");
    if (!input) throw new Error("Destination input not rendered.");

    fireEvent.change(input, { target: { value: "sao" } });
    await debounce();
    expect(fetcher).toHaveBeenCalledTimes(1);

    fireEvent.change(input, { target: { value: "recife" } });
    await debounce();
    await screen.findByRole("option", { name: /Recife/ });

    resolveFirst?.(
      Response.json({
        enabled: true,
        suggestions: [
          {
            reference: "sao-paulo",
            label: "São Paulo, SP, Brasil",
            primaryText: "São Paulo",
            secondaryText: "SP, Brasil",
            provider: "google",
            attribution: "Google Maps",
          },
        ],
      }),
    );

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Recife/ })).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: /São Paulo/ })).not.toBeInTheDocument();
    });
  });
});
