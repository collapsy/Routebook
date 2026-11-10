import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { TripContextNav } from "./trip-context-nav";

const route = vi.hoisted(() => ({
  pathname: "/viagens/one/lugares",
  query: "etapa=itapema&busca=praia",
}));
vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
  useSearchParams: () => new URLSearchParams(route.query),
}));
vi.mock("next/link", () => ({
  default: (props: ComponentProps<"a">) => <a {...props} />,
  useLinkStatus: () => ({ pending: false }),
}));
afterEach(cleanup);

it("lembra exploração ao trocar de área, mas não ao trocar de Viagem", () => {
  const { rerender } = render(<TripContextNav tripId="one" />);
  route.pathname = "/viagens/one/roteiro";
  route.query = "";
  rerender(<TripContextNav tripId="one" />);
  expect(screen.getByRole("link", { name: "Lugares" })).toHaveAttribute(
    "href",
    "/viagens/one/lugares?etapa=itapema&busca=praia",
  );
  route.pathname = "/viagens/two/etapas";
  rerender(<TripContextNav tripId="two" />);
  expect(screen.getByRole("link", { name: "Lugares" })).toHaveAttribute(
    "href",
    "/viagens/two/lugares",
  );
  expect(screen.getByRole("link", { name: "Viagem" })).toHaveAttribute("aria-current", "page");
});
