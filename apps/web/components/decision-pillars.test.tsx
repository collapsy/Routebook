import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DecisionPillars } from "./decision-pillars";

describe("DecisionPillars", () => {
  it("apresenta os três princípios de valor do RouteBook", () => {
    render(<DecisionPillars />);

    expect(
      screen.getByRole("heading", { name: "Menos listas. Mais contexto para decidir." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Descoberta")).toBeInTheDocument();
    expect(screen.getByText("Contexto")).toBeInTheDocument();
    expect(screen.getByText("Controle")).toBeInTheDocument();
  });
});
