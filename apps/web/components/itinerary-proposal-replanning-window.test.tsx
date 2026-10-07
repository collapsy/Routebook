import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ItineraryProposalReplanningWindow } from "./itinerary-proposal-replanning-window";

afterEach(cleanup);

const days = [
  { id: "day-1", date: "2026-10-07", position: 1 },
  { id: "day-2", date: "2026-10-08", position: 2 },
];

const windowSnapshot = {
  capturedAt: "2026-10-07T15:30:00.000Z",
  timeZone: "America/Fortaleza",
  localDate: "2026-10-07",
  localTime: "12:30",
  eligibleDayIds: ["day-2"],
  eligibleActivityIds: [],
  protectedActivityIds: ["activity-1"],
  reasonByActivityId: { "activity-1": "CURRENT_DAY_IN_PROGRESS" },
} as const;

describe("ItineraryProposalReplanningWindow", () => {
  it("exibe o instante, timezone, Dias elegíveis e proteção do snapshot", () => {
    render(<ItineraryProposalReplanningWindow days={days} window={windowSnapshot} />);

    expect(screen.getByRole("heading", { name: "Recorte temporal desta proposta" })).toBeVisible();
    expect(screen.getByText(/America\/Fortaleza; horário local 2026-10-07 às 12:30/)).toBeVisible();
    expect(screen.getByText(/Dia 2 — quinta-feira, 08 de outubro/)).toBeVisible();
    expect(screen.getByText(/1 atividade\(s\) protegida\(s\)/)).toBeVisible();
  });

  it("explica quando a janela não contém Dias elegíveis", () => {
    render(
      <ItineraryProposalReplanningWindow
        days={days}
        window={{ ...windowSnapshot, eligibleDayIds: [] }}
      />,
    );

    expect(
      screen.getByText(
        "Nenhum Dia estava elegível para receber mudanças quando a proposta foi gerada.",
      ),
    ).toBeVisible();
  });

  it("não presume datas quando um ID do snapshot não pertence ao Roteiro carregado", () => {
    render(
      <ItineraryProposalReplanningWindow
        days={days}
        window={{ ...windowSnapshot, eligibleDayIds: ["unknown-day"] }}
      />,
    );

    expect(screen.getByText(/Não foi possível associar todos os Dias elegíveis/)).toBeVisible();
    expect(screen.queryByText(/Dia 1|Dia 2/)).not.toBeInTheDocument();
  });
});
