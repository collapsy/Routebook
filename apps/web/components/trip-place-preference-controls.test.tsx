import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TripPlacePreferenceControls } from "./trip-place-preference-controls";

const navigationMocks = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: navigationMocks.refresh }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("TripPlacePreferenceControls", () => {
  it("atualiza a preferência na própria tela e revalida sem navegar", async () => {
    const action = vi.fn(async (formData: FormData) => ({
      status: "success" as const,
      message: "Preferência atualizada.",
      preference: { intent: "MAYBE" as const, priority: null },
      submitted: Object.fromEntries(formData.entries()),
    }));
    const initialUrl = window.location.href;

    render(
      <TripPlacePreferenceControls
        currentIntent="WANT"
        fields={{ tripId: "trip-1", placeSlug: "praia-do-amor" }}
        label="Preferência para Praia do Amor"
        refreshOnSuccess
        setAction={action}
      />,
    );

    expect(document.querySelector('[data-preference-feedback-slot="true"]')).toBeInTheDocument();
    const maybeButton = screen.getByRole("button", { name: "Talvez" });
    await userEvent.click(maybeButton);

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect(Object.fromEntries(action.mock.calls[0]?.[0].entries() ?? [])).toEqual({
      tripId: "trip-1",
      placeSlug: "praia-do-amor",
      intent: "MAYBE",
    });
    await waitFor(() => expect(maybeButton).toHaveAttribute("aria-pressed", "true"));
    expect(await screen.findByRole("status")).toHaveTextContent("Preferência atualizada.");
    expect(navigationMocks.refresh).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe(initialUrl);
  });

  it("mantém uma descoberta externa na lista sem revalidar a página", async () => {
    const action = vi.fn(async () => ({
      status: "success" as const,
      message: "Lugar salvo em Minha seleção.",
      preference: { intent: "WANT" as const, priority: null },
    }));

    render(
      <TripPlacePreferenceControls
        fields={{ tripId: "trip-1", externalId: "external-1" }}
        label="Preferência para lugar externo"
        refreshOnSuccess={false}
        setAction={action}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Quero ir" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Lugar salvo");
    expect(navigationMocks.refresh).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Quero ir" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("restaura um salto programático ao topo durante a mutação inline", async () => {
    let scrollY = 640;
    let monitorFrame: FrameRequestCallback | undefined;
    const scrollYSpy = vi.spyOn(window, "scrollY", "get").mockImplementation(() => scrollY);
    const scrollXSpy = vi.spyOn(window, "scrollX", "get").mockReturnValue(0);
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation((_x, y) => {
      scrollY = Number(y);
    });
    const requestAnimationFrameSpy = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        monitorFrame = callback;
        return 1;
      });
    const cancelAnimationFrameSpy = vi
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation(() => undefined);
    const action = vi.fn(async () => ({
      status: "success" as const,
      message: "Preferência atualizada.",
      preference: { intent: "WANT" as const, priority: null },
    }));

    render(
      <TripPlacePreferenceControls
        fields={{ tripId: "trip-1", placeSlug: "praia-do-amor" }}
        label="Preferência para Praia do Amor"
        setAction={action}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Quero ir" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Preferência atualizada.");

    scrollY = 0;
    monitorFrame?.(0);

    expect(scrollToSpy).toHaveBeenCalledWith(0, 640);

    scrollYSpy.mockRestore();
    scrollXSpy.mockRestore();
    scrollToSpy.mockRestore();
    requestAnimationFrameSpy.mockRestore();
    cancelAnimationFrameSpy.mockRestore();
  });

  it("restaura a seleção anterior e anuncia o erro quando a ação falha", async () => {
    const action = vi.fn(async () => ({
      status: "error" as const,
      message: "Não foi possível atualizar a preferência.",
    }));

    render(
      <TripPlacePreferenceControls
        currentIntent="WANT"
        fields={{ tripId: "trip-1", placeSlug: "praia-do-amor" }}
        label="Preferência para Praia do Amor"
        setAction={action}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Não tenho interesse" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível atualizar a preferência.",
    );
    expect(screen.getByRole("button", { name: "Quero ir" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Não tenho interesse" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(navigationMocks.refresh).not.toHaveBeenCalled();
  });

  it("preserva o espaço de Imperdível ao trocar para uma intenção que não é Quero ir", async () => {
    const action = vi.fn(async () => ({
      status: "success" as const,
      message: "Preferência atualizada.",
      preference: { intent: "MAYBE" as const, priority: null },
    }));

    const { container } = render(
      <TripPlacePreferenceControls
        currentIntent="WANT"
        fields={{ tripId: "trip-1", placeSlug: "praia-do-amor" }}
        label="Preferência para Praia do Amor"
        mustDoAction={action}
        setAction={action}
        summaryLabel="Preferência"
      />,
    );

    expect(screen.getByRole("button", { name: "Marcar como Imperdível" })).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Talvez" }));

    await waitFor(() =>
      expect(container.querySelector('[data-must-do-placeholder="true"]')).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: "Marcar como Imperdível" }),
    ).not.toBeInTheDocument();
    expect(container.querySelector('[data-preference-summary="true"]')).toHaveTextContent(
      "Preferência: Talvez",
    );
  });
});
