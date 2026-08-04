import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AcceptItineraryProposalActionState } from "../lib/itinerary-proposal-acceptance";
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

const acceptAction = vi.fn(
  async (state: AcceptItineraryProposalActionState): Promise<AcceptItineraryProposalActionState> =>
    state,
);
const discardAction = vi.fn(async () => undefined);

const decisionProps = {
  acceptAction,
  canAccept: true,
  canDecide: true,
  discardAction,
  expectedItineraryVersion: 4,
  idempotencyKey: "accept-itinerary-proposal:proposal-ready:4",
  itineraryHref: "/viagens/trip-1/roteiro",
} as const;

afterEach(cleanup);

describe("ItineraryProposalReview", () => {
  it("presents reviewable content while keeping the Proposal separate from the Itinerary", () => {
    render(<ItineraryProposalReview {...decisionProps} review={review} />);

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
    expect(screen.getByText(/confirmação explícita/i)).toBeInTheDocument();

    expect(screen.getByText("Aceitar proposta")).toBeVisible();
    expect(screen.getByRole("button", { name: "Descartar proposta" })).toBeVisible();
    expect(document.querySelector('input[name="itineraryProposalId"]')).toHaveValue(
      "proposal-ready",
    );
  });

  it("shows stale context and hides acceptance honestly", () => {
    render(
      <ItineraryProposalReview
        {...decisionProps}
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
    expect(screen.queryByText("Aceitar proposta")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Descartar proposta" })).toBeVisible();
  });

  it("renders a read-only review for a user without decision permission", () => {
    render(
      <ItineraryProposalReview
        {...decisionProps}
        canAccept={false}
        canDecide={false}
        review={review}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Você pode consultar esta proposta" }),
    ).toBeVisible();
    expect(screen.queryByText("Aceitar proposta")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Descartar proposta" })).not.toBeInTheDocument();
  });

  it("presents an expired Proposal as non-applicable historical reference", () => {
    render(
      <ItineraryProposalReview
        {...decisionProps}
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
    expect(screen.queryByRole("button", { name: "Descartar proposta" })).not.toBeInTheDocument();
    expect(screen.queryByText("Aceitar proposta")).not.toBeInTheDocument();
  });

  it("keeps justifications visible when no activity change was proposed", () => {
    render(
      <ItineraryProposalReview
        {...decisionProps}
        review={{ ...review, proposedChangeCount: 0, days: [], limitations: [] }}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Nenhuma mudança adequada foi proposta");
    expect(screen.getByRole("heading", { name: "Justificativas" })).toBeInTheDocument();
    expect(screen.getByText("Reduz deslocamentos no fim da tarde.")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma limitação foi informada para esta proposta.")).toBeVisible();
  });
});
