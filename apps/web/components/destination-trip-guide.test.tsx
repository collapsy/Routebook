import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { addActivity, createItinerary, deriveTripDays } from "@routebook/trip-management";

import { DestinationTripGuide } from "./destination-trip-guide";

vi.mock("next/link", () => ({
  default: ({
    children,
    className,
    href,
  }: {
    children: ReactNode;
    className?: string;
    href: string;
  }) => (
    <a className={className} href={href}>
      {children}
    </a>
  ),
}));

const period = {
  startDate: "2026-11-10",
  endDate: "2026-11-12",
  timeZone: "America/Sao_Paulo",
} as const;

describe("DestinationTripGuide", () => {
  it("apresenta no Hoje somente a atividade persistida", () => {
    const itinerary = addActivity(
      createItinerary({ tripId: "trip-sp", period }, new Date("2026-09-03T12:00:00Z")),
      {
        dayDate: "2026-11-11",
        title: "Museu confirmado",
        type: "place-visit",
        startTime: "10:30",
      },
      new Date("2026-09-03T12:00:00Z"),
    );

    render(
      <DestinationTripGuide
        days={deriveTripDays(period)}
        destinationName="São Paulo, SP"
        itinerary={itinerary}
        mode="today"
        savedPlaceCount={1}
        selectedDate="2026-11-11"
        tripId="trip-sp"
      />,
    );

    expect(screen.getByRole("heading", { name: /Dia 2/ })).toBeInTheDocument();
    expect(screen.getByText("Museu confirmado")).toBeInTheDocument();
    expect(screen.getByText(/10:30/)).toBeInTheDocument();
  });

  it("mantém todos os Dias disponíveis sem exigir guia editorial", () => {
    render(
      <DestinationTripGuide
        days={deriveTripDays(period)}
        destinationName="São Paulo, SP"
        itinerary={null}
        mode="days"
        savedPlaceCount={0}
        tripId="trip-sp"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Guia da viagem em São Paulo, SP" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Nenhuma atividade confirmada")).toHaveLength(3);
    expect(screen.getAllByRole("link", { name: "Abrir Dia no Roteiro" })).toHaveLength(3);
  });
});
