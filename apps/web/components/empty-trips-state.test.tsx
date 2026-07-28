import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyTripsState } from "./empty-trips-state";

describe("EmptyTripsState", () => {
  it("orienta o primeiro uso e oferece uma rota válida para criar viagem", () => {
    render(<EmptyTripsState />);

    expect(
      screen.getByRole("heading", { name: "Você ainda não criou nenhuma viagem" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Criar primeira viagem" })).toHaveAttribute(
      "href",
      "/viagens/nova",
    );
    expect(screen.getByText("Crie a viagem")).toBeInTheDocument();
    expect(screen.getByText("Descubra lugares")).toBeInTheDocument();
    expect(screen.getByText("Monte o roteiro")).toBeInTheDocument();
  });
});
