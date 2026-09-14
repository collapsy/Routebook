import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AccommodationForm } from "./accommodation-form";

describe("AccommodationForm", () => {
  it("mantém nome e endereço no fluxo primário e coordenadas em opções avançadas", () => {
    render(
      <AccommodationForm
        tripId="11111111-1111-4111-8111-111111111111"
        accommodation={{
          name: "Hotel Teste",
          address: "Rua Coberta, 1",
          coordinate: { latitude: -29.38, longitude: -50.87 },
        }}
      />,
    );

    expect(screen.getByLabelText("Nome da hospedagem")).toHaveValue("Hotel Teste");
    expect(screen.getByLabelText("Endereço")).toHaveValue("Rua Coberta, 1");
    expect(screen.queryByText("Encontrar coordenadas pelo endereço")).not.toBeInTheDocument();
    expect(screen.getByText("Localização disponível para mapa e distâncias.")).toBeInTheDocument();

    const advanced = screen.getByText("Opções avançadas de localização").closest("details");
    expect(advanced).not.toBeNull();
    expect(advanced).not.toHaveAttribute("open");
    expect(screen.getByLabelText("Latitude")).toHaveValue("");
    expect(screen.getByLabelText("Longitude")).toHaveValue("");
  });
});
