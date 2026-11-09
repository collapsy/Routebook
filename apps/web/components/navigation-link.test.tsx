import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { NavigationLink } from "./navigation-link";

const state = vi.hoisted(() => ({ pending: false }));
vi.mock("next/link", () => ({
  default: (props: ComponentProps<"a">) => <a {...props} />,
  useLinkStatus: () => state,
}));
afterEach(() => {
  cleanup();
  state.pending = false;
});

it("anuncia a espera do link e remove o aviso quando a navegação termina", () => {
  const { rerender } = render(
    <NavigationLink href="/viagens/1/lugares" pendingLabel="Carregando Itapema…">
      Itapema
    </NavigationLink>,
  );
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  state.pending = true;
  rerender(
    <NavigationLink href="/viagens/1/lugares" pendingLabel="Carregando Itapema…">
      Itapema
    </NavigationLink>,
  );
  expect(screen.getByRole("status")).toHaveTextContent("Carregando Itapema…");
  expect(screen.getByRole("link")).toHaveAttribute("href", "/viagens/1/lugares");
  state.pending = false;
  rerender(<NavigationLink href="/viagens/1/lugares">Itapema</NavigationLink>);
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
