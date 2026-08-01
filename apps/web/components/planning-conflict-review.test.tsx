import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

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
    },
  ],
};

afterEach(cleanup);

describe("PlanningConflictReview", () => {
  it("shows severity counts, known impact and no domain transition actions", () => {
    render(<PlanningConflictReview review={review} />);

    expect(screen.getByRole("heading", { name: "2 conflitos para revisar" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Horários sobrepostos" })).toBeInTheDocument();
    expect(screen.getByText("Passeio de barco")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Ver dia no Roteiro/ })[0]).toHaveAttribute(
      "href",
      "/viagens/trip-1/roteiro#day-1",
    );
    expect(screen.queryByRole("button", { name: /resolver/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ignorar/i })).not.toBeInTheDocument();
  });

  it("filters results by severity and presents a contextual empty state", async () => {
    const user = userEvent.setup();
    render(<PlanningConflictReview review={review} />);

    await user.click(screen.getByRole("button", { name: /Riscos 1/ }));
    expect(screen.getByRole("heading", { name: "Horários sobrepostos" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Horário ou duração inválidos" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Sugestões 0/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Nenhum conflito desta severidade");
  });

  it("explains the limits of a review with no detected conflicts", () => {
    render(
      <PlanningConflictReview
        review={{ total: 0, counts: { error: 0, risk: 0, suggestion: 0 }, items: [] }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Nenhum conflito encontrado" })).toBeInTheDocument();
    expect(screen.getByText(/não garante ausência de imprevistos/i)).toBeInTheDocument();
  });
});
