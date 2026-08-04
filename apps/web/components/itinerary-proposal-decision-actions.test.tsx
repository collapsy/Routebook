import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AcceptItineraryProposalActionState } from "../lib/itinerary-proposal-acceptance";

const routerMocks = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
const actionStateMocks = vi.hoisted(() => ({
  state: { status: "idle" } as AcceptItineraryProposalActionState,
  pending: false,
  submit: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMocks,
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: () => [
      actionStateMocks.state,
      actionStateMocks.submit,
      actionStateMocks.pending,
    ],
  };
});

import { ItineraryProposalDecisionActions } from "./itinerary-proposal-decision-actions";

const acceptAction = vi.fn();
const discardAction = vi.fn();

const props = {
  acceptAction,
  canAccept: true,
  canDecide: true,
  discardAction,
  expectedItineraryVersion: 4,
  idempotencyKey: "accept-itinerary-proposal:proposal-ready:4",
  itineraryHref: "/viagens/trip-1/roteiro",
  proposalId: "proposal-ready",
} as const;

beforeEach(() => {
  actionStateMocks.state = { status: "idle" };
  actionStateMocks.pending = false;
  vi.clearAllMocks();
});

afterEach(cleanup);

describe("ItineraryProposalDecisionActions", () => {
  it("exige confirmação e envia somente o contrato mínimo", () => {
    render(<ItineraryProposalDecisionActions {...props} />);

    const disclosure = screen.getByText("Aceitar proposta");
    expect(disclosure).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Confirmar e aceitar proposta" }),
    ).not.toBeVisible();

    fireEvent.click(disclosure);

    expect(
      screen.getByRole("button", { name: "Confirmar e aceitar proposta" }),
    ).toBeVisible();
    expect(
      screen.getByRole("checkbox", { name: /atualizará o Roteiro/i }),
    ).toBeRequired();
    expect(
      document.querySelector('input[name="itineraryProposalId"]'),
    ).toHaveValue("proposal-ready");
    expect(
      document.querySelector('input[name="expectedItineraryVersion"]'),
    ).toHaveValue(4);
    expect(document.querySelector('input[name="idempotencyKey"]')).toHaveValue(
      "accept-itinerary-proposal:proposal-ready:4",
    );
    expect(
      document.querySelector('input[name="actorId"]'),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector('input[name="items"]'),
    ).not.toBeInTheDocument();
  });

  it("oculta todas as decisões quando o usuário não possui permissão", () => {
    render(
      <ItineraryProposalDecisionActions
        {...props}
        canAccept={false}
        canDecide={false}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Você pode consultar esta proposta" }),
    ).toBeVisible();
    expect(screen.queryByText("Aceitar proposta")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Descartar proposta" }),
    ).not.toBeInTheDocument();
  });

  it("mantém o descarte quando a proposta ficou obsoleta para um decisor", () => {
    render(<ItineraryProposalDecisionActions {...props} canAccept={false} />);

    expect(screen.queryByText("Aceitar proposta")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Descartar proposta" }),
    ).toBeVisible();
  });

  it("bloqueia decisões concorrentes e anuncia o processamento", () => {
    actionStateMocks.pending = true;

    render(<ItineraryProposalDecisionActions {...props} />);

    expect(
      screen.getByRole("button", { name: "Aplicando proposta…" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Descartar proposta" }),
    ).toBeDisabled();
    expect(
      screen.getByText("Aplicando a proposta e atualizando o Roteiro…"),
    ).toBeVisible();
  });

  it("apresenta erro recuperável sem navegar", () => {
    actionStateMocks.state = {
      status: "error",
      code: "itinerary-version-mismatch",
      message: "O roteiro mudou desde a geração desta proposta.",
    };

    render(<ItineraryProposalDecisionActions {...props} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "O roteiro mudou desde a geração desta proposta.",
    );
    expect(routerMocks.push).not.toHaveBeenCalled();
  });

  it.each(["applied", "replay"] as const)(
    "trata %s como sucesso e abre o Roteiro atualizado",
    (kind) => {
      actionStateMocks.state = {
        status: "success",
        kind,
        tripId: "trip-1",
        itineraryId: "itinerary-1",
        itineraryProposalId: "proposal-ready",
        proposalApplicationId: "application-1",
        decisionId: "decision-1",
        requestFingerprint: "a".repeat(64),
        resultingItineraryVersion: 5,
        appliedProposedActivityIds: ["proposed-1"],
      };

      render(<ItineraryProposalDecisionActions {...props} />);

      expect(routerMocks.push).toHaveBeenCalledWith(
        `/viagens/trip-1/roteiro?propostaAceita=${kind}`,
      );
      expect(routerMocks.refresh).toHaveBeenCalled();
      expect(screen.getByRole("status")).toBeVisible();
    },
  );
});
