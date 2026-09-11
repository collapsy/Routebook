import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CategoryIllustration } from "./category-illustration";

afterEach(cleanup);

describe("CategoryIllustration", () => {
  it("expõe categoria e disclosure sem fingir fotografia do Place", () => {
    render(
      <CategoryIllustration
        ariaLabel="Ilustração de Praia para Praia das Minas — não é foto do local"
        kind="beach"
        placeFallback
      />,
    );

    const illustration = screen.getByRole("img", {
      name: "Ilustração de Praia para Praia das Minas — não é foto do local",
    });
    expect(illustration).toHaveAttribute("data-category-illustration", "beach");
    expect(illustration).toHaveAttribute("data-place-image-fallback", "true");
    expect(screen.getByText("Ilustração de categoria — não é foto do local")).toBeInTheDocument();
  });

  it.each([
    ["attraction", "Ponto turístico"],
    ["viewpoint", "Mirante"],
  ] as const)("expõe fallback próprio para %s", (kind, label) => {
    render(
      <CategoryIllustration
        ariaLabel={`Ilustração de ${label} — não é foto do local`}
        kind={kind}
        placeFallback
      />,
    );

    const illustration = screen.getByRole("img", {
      name: `Ilustração de ${label} — não é foto do local`,
    });
    expect(illustration).toHaveAttribute("data-category-illustration", kind);
    expect(illustration).toHaveAttribute("data-place-category", kind);
    expect(screen.getByText(label)).toBeInTheDocument();
    cleanup();
  });

  it("reduz o fallback de Lugar a um selo curto sem repetir categoria ou justificativa", () => {
    render(
      <CategoryIllustration
        ariaLabel="Imagem ilustrativa de Gastronomia para Chateau Allemand"
        kind="gastronomy"
        placeFallback
        presentation="compact"
      />,
    );

    const illustration = screen.getByRole("img", {
      name: "Imagem ilustrativa de Gastronomia para Chateau Allemand",
    });
    expect(illustration).toHaveAttribute("data-presentation", "compact");
    expect(screen.getByText("Imagem ilustrativa")).toBeInTheDocument();
    expect(screen.queryByText("Gastronomia")).not.toBeInTheDocument();
    expect(screen.queryByText("Referência visual")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Ilustração de categoria — não é foto do local"),
    ).not.toBeInTheDocument();
  });

  it("suporta variantes temporais sem atribuir a imagem a um local", () => {
    render(
      <CategoryIllustration
        ariaLabel="Ilustração do nascer da lua"
        disclosure="Ilustração do fenômeno — não representa as condições reais deste dia."
        kind="moonrise"
        label="Nascer da lua"
      />,
    );

    expect(screen.getByRole("img", { name: "Ilustração do nascer da lua" })).toHaveAttribute(
      "data-category-illustration",
      "moonrise",
    );
    expect(
      screen.getByText("Ilustração do fenômeno — não representa as condições reais deste dia."),
    ).toBeInTheDocument();
  });

  it("usa status vivo quando a ilustração acompanha busca assíncrona de fotografia", () => {
    render(
      <CategoryIllustration
        ariaLabel="Buscando fotografia licenciada para um lugar"
        kind="nightlife"
        label="Buscando fotografia…"
        live
      />,
    );

    expect(
      screen.getByRole("status", { name: "Buscando fotografia licenciada para um lugar" }),
    ).toHaveAttribute("aria-live", "polite");
  });
});
