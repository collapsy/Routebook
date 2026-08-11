import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AcceptItineraryProposalActionState } from "../lib/itinerary-proposal-acceptance";
import type { AcceptItineraryProposalPartiallyActionState } from "../lib/itinerary-proposal-partial-acceptance";

const routerMocks = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
const acceptanceMocks = vi.hoisted(() => ({ accept: vi.fn() }));
const partialAcceptanceMocks = vi.hoisted(() => ({ accept: vi.fn() }));
const actionStateMocks = vi.hoisted(() => ({
  call: 0,
  full: {
    state: { status: "idle" } as AcceptItineraryProposalActionState,
    pending: false,
    submit: vi.fn(),
  },
  partial: {
    state: { status: "idle" } as AcceptItineraryProposalPartiallyActionState,
    pending: false,
    submit: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMocks,
}));

vi.mock("../app/viagens/[tripId]/roteiro/proposta/accept-action", () => ({
  acceptItineraryProposalAction: acceptanceMocks.accept,
}));

vi.mock("../app/viagens/[tripId]/roteiro/proposta/partial-accept-action", () => ({
  acceptItineraryProposalPartiallyAction: partialAcceptanceMocks.accept,
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: () => {
      const state =
        actionStateMocks.call++ % 2 === 0 ? actionStateMocks.full : actionStateMocks.partial;
      return [state.state, state.submit, state.pending];
    },
  };
});

import { ItineraryProposalDecisionActions } from "./itinerary-proposal-decision-actions";

const discardAction = vi.fn();

const props = {
  canAccept: true,
  canDecide: true,
  discardAction,
  expectedItineraryVersion: 4,
  idempotencyKey: "accept-itinerary-proposal:proposal-ready:4",
  itineraryHref: "/viagens/trip-1/roteiro",
  partialAcceptanceItems: [
    { id: "proposed-1", title: "Mirante", dayLabel: "Dia 1" },
    { id: "proposed-2", title: "Praia", dayLabel: "Dia 2" },
  ],
  proposalId: "proposal-ready",
  tripId: "trip-1",
} as const;

beforeEach(() => {
  actionStateMocks.call = 0;
  actionStateMocks.full.state = { status: "idle" };
  actionStateMocks.full.pending = false;
  actionStateMocks.partial.state = { status: "idle" };
  actionStateMocks.partial.pending = false;
  vi.clearAllMocks();
});

afterEach(cleanup);

describe("ItineraryProposalDecisionActions", () => {
  it("exige confirmação e envia somente o contrato mínimo", () => {
    render(<ItineraryProposalDecisionActions {...props} />);

    const disclosure = screen.getByText("Aceitar proposta");
    expect(disclosure).toBeVisible();
    expect(screen.getByRole("button", { name: "Confirmar e aceitar proposta" })).not.toBeVisible();

    fireEvent.click(disclosure);

    expect(screen.getByRole("button", { name: "Confirmar e aceitar proposta" })).toBeVisible();
    expect(screen.getByRole("checkbox", { name: /atualizará o Roteiro/i })).toBeRequired();
    expect(document.querySelector('input[name="itineraryProposalId"]')).toHaveValue(
      "proposal-ready",
    );
    expect(document.querySelector('input[name="expectedItineraryVersion"]')).toHaveValue("4");
    expect(document.querySelector('input[name="idempotencyKey"]')).toHaveValue(
      "accept-itinerary-proposal:proposal-ready:4",
    );
    expect(document.querySelector('input[name="actorId"]')).not.toBeInTheDocument();
    expect(document.querySelector('input[name="items"]')).not.toBeInTheDocument();
  });

  it("envia somente os IDs explicitamente selecionados no aceite parcial", () => {
    render(<ItineraryProposalDecisionActions {...props} />);

    fireEvent.click(screen.getByText("Aceitar parte da proposta"));
    const submit = screen.getByRole("button", { name: "Confirmar seleção" });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox", { name: /Mirante/i }));
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    expect(actionStateMocks.partial.submit).toHaveBeenCalledOnce();
    const formData = actionStateMocks.partial.submit.mock.calls[0]?.[0] as FormData;
    expect(formData.getAll("selectedProposedActivityId")).toEqual(["proposed-1"]);
    expect(formData.get("itineraryProposalId")).toBe("proposal-ready");
    expect(formData.get("expectedItineraryVersion")).toBe("4");
    expect(formData.get("idempotencyKey")).toBe(
      "partial-accept-itinerary-proposal:proposal-ready:4",
    );
    expect(formData.get("title")).toBeNull();
    expect(formData.get("items")).toBeNull();
  });

  it("orienta o aceite integral quando todas as mudanças estão selecionadas", () => {
    render(<ItineraryProposalDecisionActions {...props} />);

    fireEvent.click(screen.getByText("Aceitar parte da proposta"));
    fireEvent.click(screen.getByRole("checkbox", { name: /Mirante/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Praia/i }));

    expect(screen.getByText(/use o aceite integral/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Confirmar seleção" })).toBeDisabled();
    expect(actionStateMocks.partial.submit).not.toHaveBeenCalled();
  });

  it("não oferece aceite parcial para uma proposta com apenas uma mudança", () => {
    render(
      <ItineraryProposalDecisionActions
        {...props}
        partialAcceptanceItems={props.partialAcceptanceItems.slice(0, 1)}
      />,
    );

    expect(screen.queryByText("Aceitar parte da proposta")).not.toBeInTheDocument();
    expect(screen.getByText("Aceitar proposta")).toBeVisible();
  });

  it("oculta todas as decisões quando o usuário não possui permissão", () => {
    render(<ItineraryProposalDecisionActions {...props} canAccept={false} canDecide={false} />);

    expect(
      screen.getByRole("heading", { name: "Você pode consultar esta proposta" }),
    ).toBeVisible();
    expect(screen.queryByText("Aceitar proposta")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Descartar proposta" })).not.toBeInTheDocument();
  });

  it("mantém o descarte quando a proposta ficou obsoleta para um decisor", () => {
    render(<ItineraryProposalDecisionActions {...props} canAccept={false} />);

    expect(screen.queryByText("Aceitar proposta")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Descartar proposta" })).toBeVisible();
  });

  it("bloqueia decisões concorrentes e anuncia o processamento", () => {
    actionStateMocks.partial.pending = true;

    render(<ItineraryProposalDecisionActions {...props} />);

    expect(screen.getByRole("button", { name: "Confirmar e aceitar proposta" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Descartar proposta" })).toBeDisabled();
    expect(screen.getByText("Aplicando a seleção e atualizando o Roteiro…")).toBeVisible();
  });

  it("apresenta erro recuperável sem navegar", () => {
    actionStateMocks.full.state = {
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
      actionStateMocks.full.state = {
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

  it.each(["applied", "replay"] as const)(
    "trata aceite parcial %s como sucesso e abre o Roteiro com feedback específico",
    (kind) => {
      actionStateMocks.partial.state = {
        status: "success",
        kind,
        tripId: "trip-1",
        itineraryId: "itinerary-1",
        itineraryProposalId: "proposal-ready",
        proposalApplicationId: "application-1",
        decisionId: "decision-1",
        requestFingerprint: "b".repeat(64),
        resultingItineraryVersion: 5,
        appliedProposedActivityIds: ["proposed-1"],
        remainingProposedActivityIds: ["proposed-2"],
      };

      render(<ItineraryProposalDecisionActions {...props} />);

      expect(routerMocks.push).toHaveBeenCalledWith(
        `/viagens/trip-1/roteiro?propostaAceita=partial-${kind}`,
      );
      expect(routerMocks.refresh).toHaveBeenCalled();
      expect(screen.getByRole("status")).toHaveTextContent(/seleção/i);
    },
  );
});
