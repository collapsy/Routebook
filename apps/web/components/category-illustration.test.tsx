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
