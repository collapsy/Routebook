import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { TripMapPoint } from "../lib/trip-map";
import { TripMap } from "./trip-map";

const accommodationPoint: TripMapPoint = {
  id: "accommodation",
  label: "Condomínio Solar Água",
  kind: "accommodation",
  latitude: -6.2302,
  longitude: -35.0503,
};

const savedPlacePoint: TripMapPoint = {
  id: "praia-do-amor",
  label: "Praia do Amor",
  kind: "saved-place",
  latitude: -6.244,
  longitude: -35.041,
  href: "/viagens/trip-1/lugares/praia-do-amor",
};

const points: TripMapPoint[] = [accommodationPoint, savedPlacePoint];

afterEach(() => {
  cleanup();
});

describe("TripMap", () => {
  it("shows an explicit empty state without valid points", () => {
    render(<TripMap points={[]} title="Mapa de Pipa" />);

    expect(screen.getByRole("heading", { name: "Mapa ainda indisponível" })).toBeInTheDocument();
    expect(screen.getByText(/demais áreas da viagem continuam disponíveis/i)).toBeInTheDocument();
  });

  it("renders the cartographic layer, legend and accessible location list", () => {
    render(<TripMap points={points} title="Mapa de Pipa" />);

    expect(screen.getByTitle("Mapa de Mapa de Pipa")).toHaveAttribute(
      "src",
      expect.stringContaining("openstreetmap.org/export/embed.html"),
    );
    expect(screen.getByRole("list", { name: "Legenda do mapa" })).toBeInTheDocument();
    expect(screen.getAllByText("Condomínio Solar Água").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Ver detalhes" })).toHaveAttribute(
      "href",
      "/viagens/trip-1/lugares/praia-do-amor",
    );
  });

  it("ignores malformed coordinates", () => {
    render(
      <TripMap
        points={[{ ...accommodationPoint, latitude: 120 }, savedPlacePoint]}
        title="Mapa de Pipa"
      />,
    );

    expect(screen.queryByText("Condomínio Solar Água")).not.toBeInTheDocument();
    expect(screen.getAllByText("Praia do Amor").length).toBeGreaterThan(0);
  });
});
