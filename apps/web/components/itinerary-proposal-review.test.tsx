import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { ItineraryProposalReview as ReviewModel } from "../lib/itinerary-proposal-experience";
import { ItineraryProposalReview } from "./itinerary-proposal-review";

const review: ReviewModel = {
  proposalId: "proposal-ready",
  status: "ready",
  generatedAtLabel: "1 de ago. de 2026, 09:02",
  validUntilLabel: "2 de ago. de 2026, 09:02",
  isBasedOnCurrentItinerary: true,
  proposedChangeCount: 1,
  knownConflictCount: 2,
  criteria: ["Ritmo leve", "Proximidade entre lugares"],
  justifications: ["Reduz deslocamentos no fim da tarde."],
  limitations: ["Horários externos não foram confirmados."],
  days: [
    {
      id: "day-1",
      label: "Dia 1 · 22 de agosto",
      position: 1,
      referenceAvailable: true,
      activities: [
        {
          id: "activity-proposed",
          title: "Mirante ao pôr do sol",
          operationLabel: "Adicionar",
          timeLabel: "Horário proposto: 17:30",
          durationLabel: "1 h 30 min",
          estimatedCostLabel: "R$ 25,00",
          reason: "Aproveita o fim da tarde.",
        },
      ],
    },
  ],
};

afterEach(cleanup);

describe("ItineraryProposalReview", () => {
  it("presents reviewable content while keeping the Proposal separate from the Itinerary", () => {
    render(<ItineraryProposalReview review={review} />);

    expect(screen.getByText("Sugestão — ainda não aplicada")).toBeInTheDocument();
    expect(screen.getByText(/O Roteiro atual permanece preservado/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Critérios da proposta" })).toBeInTheDocument();
    expect(screen.getByText("Proximidade entre lugares")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Limitações" })).toBeInTheDocument();
    expect(screen.getByText("Horários externos não foram confirmados.")).toBeInTheDocument();
    const changes = screen.getByRole("list", { name: "Mudanças propostas por dia" });
    expect(within(changes).getByRole("heading", { name: "Dia 1 · 22 de agosto" })).toBeVisible();
    expect(within(changes).getByRole("heading", { name: "Mirante ao pôr do sol" })).toBeVisible();
    expect(screen.getByText("Aproveita o fim da tarde.")).toBeInTheDocument();
    expect(screen.getByText(/somente leitura/i)).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: /aceitar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /aplicar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /descartar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /gerar novamente/i })).not.toBeInTheDocument();
  });

  it("shows stale context and unresolved day references honestly", () => {
    render(
      <ItineraryProposalReview
        review={{
          ...review,
          isBasedOnCurrentItinerary: false,
          days: [
            {
              ...review.days[0]!,
              id: "unavailable-day-reference",
              label: "Referência de dia indisponível",
              referenceAvailable: false,
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("O Roteiro mudou depois desta proposta");
    expect(screen.getByText("Informação não confirmada")).toBeInTheDocument();
  });

  it("presents an expired Proposal as non-applicable historical reference", () => {
    render(
      <ItineraryProposalReview
        review={{
          ...review,
          proposalId: "proposal-expired",
          status: "expired",
          expiredAtLabel: "2 de ago. de 2026, 10:15",
        }}
      />,
    );

    expect(screen.getByText("Proposta expirada — somente referência")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Consulte o histórico desta proposta" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/não pode mais ser aplicada/i)).toBeInTheDocument();
    expect(screen.getByText("Expirada em")).toBeInTheDocument();
    expect(screen.getByText("2 de ago. de 2026, 10:15")).toBeInTheDocument();
    expect(screen.getByText(/A validade terminou em/)).toHaveTextContent(
      "2 de ago. de 2026, 10:15",
    );
    expect(screen.getByRole("note")).toHaveTextContent("referência histórica");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("keeps justifications visible when no activity change was proposed", () => {
    render(
      <ItineraryProposalReview
        review={{ ...review, proposedChangeCount: 0, days: [], limitations: [] }}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Nenhuma mudança adequada foi proposta");
    expect(screen.getByRole("heading", { name: "Justificativas" })).toBeInTheDocument();
    expect(screen.getByText("Reduz deslocamentos no fim da tarde.")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma limitação foi informada para esta proposta.")).toBeVisible();
  });
});
