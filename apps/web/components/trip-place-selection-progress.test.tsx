import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TRIP_PLACE_PREFERENCE_CHANGED_EVENT } from "./trip-place-preference-events";
import { TripPlaceSelectionProgress } from "./trip-place-selection-progress";

afterEach(cleanup);

describe("TripPlaceSelectionProgress", () => {
  it("mostra contagens iniciais e orienta sem impor quantidade mínima", () => {
    render(
      <TripPlaceSelectionProgress
        initialCounts={{ WANT: 0, MAYBE: 0, NOT_INTERESTED: 2, mustDo: 0 }}
        reviewHref="/viagens/trip-1/lugares-salvos"
      />,
    );

    expect(screen.getByText("Comece pelo que desperta interesse")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("não existe quantidade mínima obrigatória");
    expect(screen.getByRole("link", { name: "Revisar seleção" })).toHaveAttribute(
      "href",
      "/viagens/trip-1/lugares-salvos",
    );
  });

  it("atualiza o resumo quando a preferência muda sem depender de refresh", () => {
    render(
      <TripPlaceSelectionProgress
        initialCounts={{ WANT: 1, MAYBE: 1, NOT_INTERESTED: 0, mustDo: 1 }}
      />,
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent(TRIP_PLACE_PREFERENCE_CHANGED_EVENT, {
          detail: {
            previousIntent: "WANT",
            nextIntent: "MAYBE",
            previousPriority: "MUST_DO",
            nextPriority: null,
          },
        }),
      );
    });

    const summary = screen.getByLabelText("Resumo das preferências");
    expect(summary).toHaveTextContent("Quero ir0");
    expect(summary).toHaveTextContent("Talvez2");
    expect(summary).toHaveTextContent("Imperdíveis0");
    expect(screen.getByRole("status")).toHaveTextContent("2 lugares estão em consideração");
  });
});
