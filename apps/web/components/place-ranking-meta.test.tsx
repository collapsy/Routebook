import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlaceRankingMeta } from "./place-ranking-meta";

describe("PlaceRankingMeta", () => {
  it("não fabrica score, Top ou explicação de ranking quando não existem sinais", () => {
    const { container } = render(
      <PlaceRankingMeta
        categoryLabel="Praias"
        orderLabel="Mais próximos"
        position={1}
        timeZone="America/Sao_Paulo"
      />,
    );
    const view = within(container);

    expect(view.queryByLabelText("Evidência do ranking")).not.toBeInTheDocument();
    expect(view.queryByText(/Score/)).not.toBeInTheDocument();
    expect(view.queryByText(/Top praias/i)).not.toBeInTheDocument();
    expect(view.queryByText(/Mais próximos/)).not.toBeInTheDocument();
    expect(view.queryByText(/ordenação selecionada/i)).not.toBeInTheDocument();
  });

  it("resume score e rating e mantém volume, fonte e motivo no disclosure", () => {
    const { container } = render(
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
    const view = within(container);

    expect(view.getByText("Top praias")).toBeInTheDocument();
    expect(view.getByText("Score 9,1/10")).toBeInTheDocument();
    expect(view.getByText("Nota 4,8/5")).toBeInTheDocument();
    expect(view.getByText("Por que aparece assim?")).toBeInTheDocument();
    expect(view.getByText(/2\.340 avaliações/)).toBeInTheDocument();
    expect(view.getByText(/Fonte: Google Places/)).toBeInTheDocument();
    expect(view.queryByText(/Provider/i)).not.toBeInTheDocument();
    expect(view.getByText(/Muito bem avaliado/)).toBeInTheDocument();
  });
});
