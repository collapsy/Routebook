import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { EditItineraryProposalActionState } from "../lib/itinerary-proposal-editing";
import type {
  ItineraryProposalReviewActivity,
  ItineraryProposalReviewDayOption,
} from "../lib/itinerary-proposal-experience";

const routerMocks = vi.hoisted(() => ({ refresh: vi.fn() }));
const editingMocks = vi.hoisted(() => ({ edit: vi.fn() }));
const actionStateMocks = vi.hoisted(() => ({
  state: { status: "idle" } as EditItineraryProposalActionState,
  pending: false,
  submit: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMocks,
}));

vi.mock("../app/viagens/[tripId]/roteiro/proposta/edit-action", () => ({
  editItineraryProposalAction: editingMocks.edit,
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

import { ItineraryProposalActivityEditor } from "./itinerary-proposal-activity-editor";

const dayOptions: readonly ItineraryProposalReviewDayOption[] = [
  { id: "day-1", label: "Dia 1 · 22 de agosto" },
  { id: "day-2", label: "Dia 2 · 23 de agosto" },
];

function activity(
  overrides: Partial<ItineraryProposalReviewActivity> = {},
): ItineraryProposalReviewActivity {
  return {
    id: "activity-proposed",
    title: "Mirante ao pôr do sol",
    operationType: "add",
    operationLabel: "Adicionar",
    timeLabel: "Horário proposto: 17:30",
    editValues: {
      targetTripDayId: "day-1",
      title: "Mirante ao pôr do sol",
      description: "Vista aberta para o fim da tarde.",
      proposedStartTime: "17:30",
      durationMinutes: "90",
      flexibility: "flexible",
      estimatedCostAmount: "25",
      estimatedCostCurrency: "BRL",
    },
    ...overrides,
  };
}

const props = {
  dayOptions,
  proposalId: "proposal-ready",
  tripId: "trip-1",
} as const;

beforeEach(() => {
  actionStateMocks.state = { status: "idle" };
  actionStateMocks.pending = false;
  vi.clearAllMocks();
});

afterEach(cleanup);

describe("ItineraryProposalActivityEditor", () => {
  it("pré-preenche add com os valores atuais e preserva os identificadores server-side", () => {
    render(<ItineraryProposalActivityEditor {...props} activity={activity()} />);

    fireEvent.click(screen.getByText("Editar sugestão"));

    expect(document.querySelector('input[name="itineraryProposalId"]')).toHaveValue(
      "proposal-ready",
    );
    expect(document.querySelector('input[name="proposedActivityId"]')).toHaveValue(
      "activity-proposed",
    );
    expect(screen.getByRole("combobox", { name: "Dia proposto" })).toHaveValue("day-1");
    expect(screen.getByRole("textbox", { name: "Título" })).toHaveValue("Mirante ao pôr do sol");
    expect(screen.getByRole("textbox", { name: "Descrição da sugestão" })).toHaveValue(
      "Vista aberta para o fim da tarde.",
    );
    expect(screen.getByLabelText("Horário")).toHaveValue("17:30");
    expect(screen.getByLabelText("Duração (min)")).toHaveValue(90);
    expect(screen.getByRole("combobox", { name: "Flexibilidade" })).toHaveValue("flexible");
    expect(screen.getByLabelText("Valor")).toHaveValue(25);
    expect(screen.getByLabelText("Moeda")).toHaveValue("BRL");
    expect(screen.getByText(/O Roteiro só muda depois/i)).toBeVisible();
  });

  it("limita move ao Dia proposto e não oferece campos de conteúdo", () => {
    render(
      <ItineraryProposalActivityEditor
        {...props}
        activity={activity({
          operationType: "move",
          operationLabel: "Mover",
          editValues: {
            targetTripDayId: "day-2",
            title: "Mirante ao pôr do sol",
            description: "",
            proposedStartTime: "",
            durationMinutes: "",
            flexibility: "",
            estimatedCostAmount: "",
            estimatedCostCurrency: "",
          },
        })}
      />,
    );

    fireEvent.click(screen.getByText("Editar sugestão"));

    expect(screen.getByRole("combobox", { name: "Dia proposto" })).toHaveValue("day-2");
    expect(screen.queryByRole("textbox", { name: "Título" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Horário")).not.toBeInTheDocument();
  });

  it("não oferece editor para remove porque a operação não possui conteúdo editável aplicável", () => {
    render(
      <ItineraryProposalActivityEditor
        {...props}
        activity={activity({ operationType: "remove", operationLabel: "Remover" })}
      />,
    );

    expect(screen.queryByText("Editar sugestão")).not.toBeInTheDocument();
  });

  it("bloqueia o envio enquanto salva e anuncia o processamento", () => {
    actionStateMocks.pending = true;

    render(<ItineraryProposalActivityEditor {...props} activity={activity()} />);
    fireEvent.click(screen.getByText("Editar sugestão"));

    expect(screen.getByRole("button", { name: "Salvando edição…" })).toBeDisabled();
    expect(screen.getByText("Salvando a edição na proposta…")).toBeVisible();
  });

  it("apresenta erro recuperável sem atualizar a página", () => {
    actionStateMocks.state = {
      status: "error",
      code: "proposal-not-ready",
      message: "A proposta de roteiro não pode mais ser editada.",
    };

    render(<ItineraryProposalActivityEditor {...props} activity={activity()} />);
    fireEvent.click(screen.getByText("Editar sugestão"));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "A proposta de roteiro não pode mais ser editada.",
    );
    expect(routerMocks.refresh).not.toHaveBeenCalled();
  });

  it("anuncia sucesso, reforça que o Roteiro não mudou e atualiza a revisão", () => {
    actionStateMocks.state = {
      status: "success",
      tripId: "trip-1",
      itineraryProposalId: "proposal-ready",
      proposedActivityId: "activity-proposed",
      updatedAt: "2026-08-09T17:20:00.000Z",
    };

    render(<ItineraryProposalActivityEditor {...props} activity={activity()} />);
    fireEvent.click(screen.getByText("Editar sugestão"));

    expect(screen.getByRole("status")).toHaveTextContent(
      "O Roteiro confirmado ainda não foi alterado",
    );
    expect(routerMocks.refresh).toHaveBeenCalledTimes(1);
  });
});
