import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ItineraryProposalGenerationControl } from "./itinerary-proposal-generation-control";

afterEach(cleanup);

describe("ItineraryProposalGenerationControl", () => {
  it("gera somente WANT por padrão", async () => {
    const action = vi.fn().mockResolvedValue({ status: "idle" });

    render(<ItineraryProposalGenerationControl action={action} />);

    const includeMaybe = screen.getByRole("checkbox", {
      name: "Incluir lugares marcados como Talvez",
    });
    expect(includeMaybe).not.toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "Gerar proposta de roteiro" }));

    await waitFor(() => expect(action).toHaveBeenCalledWith(false));
  });

  it("encaminha opt-in explícito para MAYBE sem alterar a seleção persistida", async () => {
    const action = vi.fn().mockResolvedValue({ status: "idle" });

    render(<ItineraryProposalGenerationControl action={action} />);

    const includeMaybe = screen.getByRole("checkbox", {
      name: "Incluir lugares marcados como Talvez",
    });
    fireEvent.click(includeMaybe);
    expect(includeMaybe).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "Gerar proposta de roteiro" }));

    await waitFor(() => expect(action).toHaveBeenCalledWith(true));
  });

  it("exibe erro recuperável retornado pela action", async () => {
    const action = vi.fn().mockResolvedValue({
      status: "error",
      code: "generation-failed",
      message: "Não foi possível concluir a geração da proposta de roteiro.",
    });

    render(<ItineraryProposalGenerationControl action={action} />);
    fireEvent.click(screen.getByRole("button", { name: "Gerar proposta de roteiro" }));

    expect(
      await screen.findByText("Não foi possível concluir a geração da proposta de roteiro."),
    ).toBeVisible();
  });
});
