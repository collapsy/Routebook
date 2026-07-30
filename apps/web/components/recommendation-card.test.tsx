import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { RecommendationCardViewModel } from "../lib/recommendation-experience";
import { RecommendationCard } from "./recommendation-card";

const presentedCard: RecommendationCardViewModel = {
  id: "00000000-0000-4000-8000-000000000041" as RecommendationCardViewModel["id"],
  status: "presented",
  placeId: "place-1",
  placeSlug: "praia-do-amor",
  placeName: "Praia do Amor",
  category: "beach",
  summary: "Praia publicada no catálogo de Pipa.",
  reasons: [
    {
      code: "interest-category-match",
      message: "A categoria do Lugar corresponde a um interesse informado.",
      evidence: { category: "beach" },
    },
  ],
  limitations: [
    {
      code: "catalog-operational-data-unavailable",
      message: "O catálogo não possui horário de funcionamento verificável.",
    },
  ],
  confidenceLevel: "high",
  confidenceBasis: ["interesses compatíveis disponíveis", "distância geodésica disponível"],
  geodesicDistanceLabel: "1,8 km em linha reta",
  isSaved: true,
  isPlanned: true,
  detailsHref: "/viagens/trip-1/lugares/praia-do-amor",
  canIgnore: true,
};

afterEach(() => {
  cleanup();
});

describe("RecommendationCard", () => {
  it("presents known reasons, limitations, qualitative confidence and contextual states", () => {
    render(
      <RecommendationCard card={presentedCard} ignoreAction={vi.fn()} tripId="trip-1" />,
    );

    expect(screen.getByRole("heading", { name: "Praia do Amor" })).toBeInTheDocument();
    expect(screen.getByText("Praia publicada no catálogo de Pipa.")).toBeInTheDocument();
    expect(screen.getByText("A categoria do Lugar corresponde a um interesse informado.")).toBeInTheDocument();
    expect(screen.getByText("O catálogo não possui horário de funcionamento verificável.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Confiança Alta" })).toBeInTheDocument();
    expect(screen.getByText("Lugar salvo")).toBeInTheDocument();
    expect(screen.getByText("Já está no roteiro")).toBeInTheDocument();
    expect(screen.getByText(/1,8 km em linha reta/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ignorar recomendação de Praia do Amor" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver detalhes de Praia do Amor" })).toHaveAttribute(
      "href",
      "/viagens/trip-1/lugares/praia-do-amor",
    );
  });

  it("does not expose internal score, stars or arbitrary percentages", () => {
    render(
      <RecommendationCard card={presentedCard} ignoreAction={vi.fn()} tripId="trip-1" />,
    );

    expect(screen.queryByText(/score/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/estrela/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument();
  });

  it("renders rejected state without an active ignore action", () => {
    render(
      <RecommendationCard
        card={{ ...presentedCard, status: "rejected", canIgnore: false }}
        ignoreAction={vi.fn()}
        tripId="trip-1"
      />,
    );

    expect(screen.getByText("Recomendação ignorada")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "nenhuma Preferência ou Atividade foi alterada",
    );
    expect(screen.queryByRole("button", { name: /Ignorar recomendação/ })).not.toBeInTheDocument();
  });
});
