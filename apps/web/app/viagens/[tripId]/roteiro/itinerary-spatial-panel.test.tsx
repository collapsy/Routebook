import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ItineraryDaySpatialContext } from "../../../../lib/itinerary-spatial-context";
import { ItinerarySpatialPanel } from "./itinerary-spatial-panel";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("dia=2026-08-23"),
}));

const firstDay: ItineraryDaySpatialContext = {
  dayId: "day-1",
  dayDate: "2026-08-22",
  accommodation: { status: "not-provided" },
  activitySteps: [],
};

const secondDay: ItineraryDaySpatialContext = {
  dayId: "day-2",
  dayDate: "2026-08-23",
  accommodation: {
    status: "available",
    point: {
      id: "accommodation",
      label: "Condomínio Solar Água",
      kind: "accommodation",
      coordinate: { latitude: -6.2302, longitude: -35.0503 },
    },
  },
  activitySteps: [
    {
      activityId: "activity-1",
      title: "Praia do Amor",
      order: 1,
      placeId: "place-1",
      status: "available",
      point: {
        id: "activity-1",
        label: "Praia do Amor",
        kind: "activity",
        coordinate: { latitude: -6.244, longitude: -35.041 },
        sequence: 1,
        activityId: "activity-1",
        placeId: "place-1",
        placeSlug: "praia-do-amor",
      },
    },
    {
      activityId: "activity-2",
      title: "Descanso",
      order: 2,
      status: "unavailable",
      reason: "manual-activity",
    },
  ],
};

afterEach(() => {
  cleanup();
});

describe("ItinerarySpatialPanel", () => {
  it("selects the requested day and preserves unavailable activities in text", () => {
    render(
      <ItinerarySpatialPanel
        days={[
          { date: "2026-08-22", position: 1, label: "22 de ago.", context: firstDay },
          { date: "2026-08-23", position: 2, label: "23 de ago.", context: secondDay },
        ]}
        tripId="trip-1"
      />,
    );

    expect(screen.getByRole("heading", { name: "Mapa do Dia 2" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dia 2/i })).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: "Atividade 1: Praia do Amor. Abrir detalhes." }),
    ).toHaveAttribute("href", "/viagens/trip-1/lugares/praia-do-amor");
    expect(screen.getByText("Atividade manual sem Lugar associado.")).toBeInTheDocument();
    expect(screen.getByText("1 Atividade não pôde ser localizada.")).toBeInTheDocument();
  });
});
