import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ItineraryProposalReviewError from "./error";

vi.mock("next/navigation", () => ({
  useParams: () => ({ tripId: "trip-1" }),
}));

describe("ItineraryProposalReviewError", () => {
  it("keeps the canonical Itinerary safe and offers a recoverable retry", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<ItineraryProposalReviewError reset={reset} />);

    expect(screen.getByRole("alert")).toHaveTextContent("O Roteiro atual permanece inalterado");
    expect(screen.getByRole("link", { name: "Voltar para o Roteiro" })).toHaveAttribute(
      "href",
      "/viagens/trip-1/roteiro",
    );
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
