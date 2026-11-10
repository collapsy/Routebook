import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { DiscoveryFilterForm } from "./discovery-filter-form";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
afterEach(() => {
  cleanup();
  push.mockReset();
});

it("envia filtros por navegação local mantendo o GET sem JavaScript", () => {
  render(
    <DiscoveryFilterForm action="/viagens/one/lugares" className="filters">
      <input name="etapa" defaultValue="itapema" />
      <input name="busca" defaultValue="café" />
    </DiscoveryFilterForm>,
  );
  const button = screen.getByRole("button", { name: "Aplicar filtros" });
  expect(button.closest("form")).toHaveAttribute("method", "get");
  fireEvent.click(button);
  expect(push).toHaveBeenCalledWith("/viagens/one/lugares?etapa=itapema&busca=caf%C3%A9", {
    scroll: false,
  });
});
