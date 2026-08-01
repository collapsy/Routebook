import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { PlanningConflictReview as ReviewModel } from "../lib/planning-conflict-experience";
import { PlanningConflictReview } from "./planning-conflict-review";

const review: ReviewModel = {
  total: 2,
  counts: { error: 1, risk: 1, suggestion: 0 },
  items: [
    {
      id: "conflict-error",
      severity: "error",
      severityLabel: "Erro",
      title: "Horário ou duração inválidos",
      explanation: "A duração registrada precisa ser maior que zero.",
      impact: "O intervalo não pode ser analisado.",
      dayLabel: "Dia 1 · 22 de agosto",
      activityTitles: ["Café na vila"],
      itineraryHref: "/viagens/trip-1/roteiro#day-1",
      canIgnore: false,
    },
    {
      id: "conflict-risk",
      severity: "risk",
      severityLabel: "Risco",
      title: "Horários sobrepostos",
      explanation: "Duas atividades ocupam intervalos que se sobrepõem.",
      impact: "Os horários precisam ser revisados.",
      dayLabel: "Dia 1 · 22 de agosto",
      activityTitles: ["Café na vila", "Passeio de barco"],
      itineraryHref: "/viagens/trip-1/roteiro#day-1",
      canIgnore: true,
    },
  ],
  ignoredRisks: [],
};

const ignoreAction = vi.fn(async () => ({ redirectTo: "/revisao?riscoIgnorado=1" }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderReview(model: ReviewModel = review) {
  return render(
    <PlanningConflictReview ignoreAction={ignoreAction} review={model} tripId="trip-1" />,
  );
}

describe("PlanningConflictReview", () => {
  it("shows severity counts and offers Ignore Planning Risk only for risks", async () => {
    const user = userEvent.setup();
    renderReview();

    expect(screen.getByRole("heading", { name: "2 conflitos para revisar" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Horários sobrepostos" })).toBeInTheDocument();
    expect(screen.getByText("Passeio de barco")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Ver dia no Roteiro/ })[0]).toHaveAttribute(
      "href",
      "/viagens/trip-1/roteiro#day-1",
    );
    expect(screen.queryByRole("button", { name: /resolver/i })).not.toBeInTheDocument();
    const errorArticle = screen
      .getByRole("heading", { name: "Horário ou duração inválidos" })
      .closest("article");
    expect(errorArticle).not.toBeNull();
    expect(within(errorArticle!).queryByText("Ignorar risco")).not.toBeInTheDocument();

    await user.click(screen.getByText("Ignorar risco"));
    expect(
      screen.getByText(/A condição continuará existindo no planejamento/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /Entendo que este risco continuará/i }),
    ).toBeRequired();
    expect(screen.getByRole("button", { name: "Confirmar e ignorar risco" })).toBeInTheDocument();
  });

  it("filters results by severity and presents a contextual empty state", async () => {
    const user = userEvent.setup();
    renderReview();

    await user.click(screen.getByRole("button", { name: /Riscos 1/ }));
    expect(screen.getByRole("heading", { name: "Horários sobrepostos" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Horário ou duração inválidos" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Sugestões 0/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Nenhum conflito desta severidade");
  });

  it("keeps a failed confirmation recoverable and announces the error", async () => {
    const user = userEvent.setup();
    ignoreAction.mockRejectedValueOnce(new Error("network unavailable"));
    renderReview();

    await user.click(screen.getByText("Ignorar risco"));
    await user.click(screen.getByRole("checkbox", { name: /Entendo que este risco continuará/i }));
    await user.click(screen.getByRole("button", { name: "Confirmar e ignorar risco" }));

    expect(ignoreAction).toHaveBeenCalledOnce();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível confirmar esta decisão agora",
    );
    expect(screen.getByRole("button", { name: "Confirmar e ignorar risco" })).toBeEnabled();
  });

  it("explains the limits of a review with no detected conflicts", () => {
    renderReview({
      total: 0,
      counts: { error: 0, risk: 0, suggestion: 0 },
      items: [],
      ignoredRisks: [],
    });

    expect(screen.getByRole("heading", { name: "Nenhum conflito encontrado" })).toBeInTheDocument();
    expect(screen.getByText(/não garante ausência de imprevistos/i)).toBeInTheDocument();
  });

  it("keeps ignored Risks visible when there are no open conflicts", () => {
    renderReview({
      total: 0,
      counts: { error: 0, risk: 0, suggestion: 0 },
      items: [],
      ignoredRisks: [
        {
          id: "conflict-ignored",
          title: "Horários sobrepostos",
          explanation: "Duas atividades ocupam intervalos que se sobrepõem.",
          impact: "Os horários precisam ser revisados.",
          dayLabel: "Dia 1 · 22 de agosto",
          activityTitles: ["Café na vila", "Passeio de barco"],
          ignoredAtLabel: "31 de jul. de 2026, 21:05",
          actorLabel: "RouteBook QA",
        },
      ],
    });

    expect(screen.getByRole("heading", { name: "Nenhum conflito aberto" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Riscos ignorados" })).toBeInTheDocument();
    expect(screen.getByText("RouteBook QA")).toBeInTheDocument();
    expect(screen.getByText("31 de jul. de 2026, 21:05")).toBeInTheDocument();
    expect(screen.queryByText("Restaurar")).not.toBeInTheDocument();
    expect(screen.queryByText("Resolver")).not.toBeInTheDocument();
  });
});
