import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TripPlanningWizard } from "./trip-planning-wizard";

afterEach(cleanup);

describe("TripPlanningWizard", () => {
  it("identifica Lugares como primeiro passo sem criar links falsos para etapas futuras", () => {
    render(<TripPlanningWizard currentView="explore" tripId="trip-1" />);

    expect(
      screen.getByRole("heading", { name: "Escolha os lugares que fazem sentido para você" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Preparar viagem · Etapa 1 de 4")).toBeInTheDocument();

    const steps = screen.getByRole("list", { name: "Etapas da preparação da viagem" });
    expect(steps).toHaveTextContent("Lugares");
    expect(steps).toHaveTextContent("Contexto");
    expect(steps).toHaveTextContent("Revisão");
    expect(steps).toHaveTextContent("Proposta");

    expect(screen.getByRole("link", { name: "Explorar" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Minha seleção" })).toHaveAttribute(
      "href",
      "/viagens/trip-1/lugares-salvos",
    );
    expect(screen.queryByRole("link", { name: "Contexto" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Revisão" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Proposta" })).not.toBeInTheDocument();
  });
});
