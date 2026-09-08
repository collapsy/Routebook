import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlaceRankingMeta } from "./place-ranking-meta";

describe("PlaceRankingMeta", () => {
  it("não fabrica score ou Top e mantém a posição no disclosure quando não existem sinais", () => {
    render(
      <PlaceRankingMeta
        categoryLabel="Praias"
        orderLabel="Mais próximos"
        position={1}
        timeZone="America/Sao_Paulo"
      />,
    );

    expect(screen.queryByText(/Score/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Top praias/i)).not.toBeInTheDocument();
    expect(screen.getByText("Entender este ranking")).toBeInTheDocument();
    expect(screen.getByText("#1 · Mais próximos")).toBeInTheDocument();
    expect(screen.getByText(/reflete apenas a ordenação selecionada/i)).toBeInTheDocument();
  });

  it("resume score e rating e mantém volume, Provider e motivo no disclosure", () => {
    render(
      <PlaceRankingMeta
        categoryLabel="Praias"
        categoryRank={1}
        orderLabel="Recomendados"
        position={1}
        timeZone="America/Sao_Paulo"
        quality={{
          score: 9.1,
          reputationScore: 0.91,
          distanceScore: 0.8,
          reasons: ["Muito bem avaliado", "Muitas avaliações"],
        }}
        signals={{
          provider: "google-places",
          externalId: "google-1",
          rating: { value: 4.8, scaleMax: 5, reviewCount: 2340 },
          collectedAt: new Date("2026-08-28T16:00:00.000Z"),
        }}
      />,
    );

    expect(screen.getByText("Top praias")).toBeInTheDocument();
    expect(screen.getByText("Score 9,1/10")).toBeInTheDocument();
    expect(screen.getByText("Nota 4,8/5")).toBeInTheDocument();
    expect(screen.getByText("Entender este ranking")).toBeInTheDocument();
    expect(screen.getByText(/2\.340 avaliações/)).toBeInTheDocument();
    expect(screen.getByText(/Fonte do ranking: Google Places/)).toBeInTheDocument();
    expect(screen.getByText(/Muito bem avaliado/)).toBeInTheDocument();
  });
});
