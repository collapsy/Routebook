import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PlacePrimaryImage } from "./place-primary-image";

const primaryImage = {
  assetPath: "/place-images/tests/praia-do-amor.webp",
  altText: "Falésias e mar na Praia do Amor.",
  sourceName: "Acervo RouteBook",
  sourceUrl: "https://example.com/acervo/praia-do-amor",
  license: "uso autorizado",
  attribution: "Foto: Acervo RouteBook",
} as const;

afterEach(cleanup);

describe("PlacePrimaryImage", () => {
  it("renderiza asset interno com alt governado", () => {
    render(<PlacePrimaryImage placeName="Praia do Amor" primaryImage={primaryImage} />);

    expect(screen.getByRole("img", { name: primaryImage.altText })).toBeInTheDocument();
    expect(screen.queryByText("Sem foto")).not.toBeInTheDocument();
  });

  it("usa estado neutro e compacto quando o Place não possui imagem", () => {
    render(<PlacePrimaryImage category="beach" placeName="Praia do Amor" />);

    const fallback = screen.getByRole("img", {
      name: "Foto não disponível para Praia do Amor",
    });
    expect(fallback).toHaveAttribute("data-place-image-fallback", "true");
    expect(fallback).toHaveAttribute("data-presentation", "compact");
    expect(screen.getByText("Sem foto")).toBeInTheDocument();
    expect(screen.queryByText("Imagem ilustrativa")).not.toBeInTheDocument();
    expect(screen.queryByText("Referência visual")).not.toBeInTheDocument();
  });

  it("troca para o mesmo fallback compacto quando o asset governado falha ao carregar", () => {
    render(
      <PlacePrimaryImage category="beach" placeName="Praia do Amor" primaryImage={primaryImage} />,
    );

    fireEvent.error(screen.getByRole("img", { name: primaryImage.altText }));

    expect(
      screen.getByRole("img", {
        name: "Foto não disponível para Praia do Amor",
      }),
    ).toHaveAttribute("data-presentation", "compact");
  });

  it("permite fallback neutro descritivo quando um contexto precisar de mais área", () => {
    render(
      <PlacePrimaryImage category="beach" compactFallback={false} placeName="Praia do Amor" />,
    );

    expect(
      screen.getByRole("img", { name: "Foto não disponível para Praia do Amor" }),
    ).toHaveAttribute("data-presentation", "descriptive");
    expect(screen.getByText("Foto não disponível")).toBeInTheDocument();
    expect(screen.queryByText(/ilustra/i)).not.toBeInTheDocument();
  });

  it("exibe Provenance textual sem usar sourceUrl como mídia", () => {
    render(
      <PlacePrimaryImage placeName="Praia do Amor" primaryImage={primaryImage} showProvenance />,
    );

    const image = screen.getByRole("img", { name: primaryImage.altText });
    expect(image.getAttribute("src")).not.toContain("example.com");
    expect(screen.getByText(/Foto: Acervo RouteBook/)).toBeInTheDocument();
    expect(screen.getByText(/uso autorizado/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver fonte" })).toHaveAttribute(
      "href",
      primaryImage.sourceUrl,
    );
  });
});
