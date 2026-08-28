import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlaceRankingMeta } from "./place-ranking-meta";

describe("PlaceRankingMeta", () => {
  it("não fabrica score ou Top quando não existem sinais", () => {
    render(
      <PlaceRankingMeta
        categoryLabel="Praias"
        orderLabel="Mais próximos"
        position={1}
      />,
    );

    expect(screen.getByText("#1 · Mais próximos")).toBeInTheDocument();
    expect(screen.queryByText(/Score RouteBook/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Top praias/i)).not.toBeInTheDocument();
  });

  it("expõe score derivado, rating, volume, Provider e motivo quando há evidência", () => {
    render(
      <PlaceRankingMeta
        categoryLabel="Praias"
        categoryRank={1}
        orderLabel="Recomendados"
        position={1}
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
    expect(screen.getByText("Score RouteBook 9,1/10")).toBeInTheDocument();
    expect(screen.getByText(/2\.340 avaliações/)).toBeInTheDocument();
    expect(screen.getByText(/Fonte: Google Places/)).toBeInTheDocument();
    expect(screen.getByText(/Muito bem avaliado/)).toBeInTheDocument();
  });
});
