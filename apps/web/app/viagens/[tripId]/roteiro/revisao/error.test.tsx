import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import PlanningConflictReviewError from "./error";

vi.mock("next/navigation", () => ({
  useParams: () => ({ tripId: "trip-1" }),
}));

describe("PlanningConflictReviewError", () => {
  it("preserves the itinerary and offers a recoverable retry", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<PlanningConflictReviewError reset={reset} />);

    expect(screen.getByRole("alert")).toHaveTextContent("O Roteiro permanece inalterado");
    expect(screen.getByRole("link", { name: "Voltar para o Roteiro" })).toHaveAttribute(
      "href",
      "/viagens/trip-1/roteiro",
    );
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
