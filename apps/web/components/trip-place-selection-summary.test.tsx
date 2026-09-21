import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TripPlacePreferenceControls } from "./trip-place-preference-controls";
import { TripPlaceSelectionSummary } from "./trip-place-selection-summary";

const navigationMocks = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: navigationMocks.refresh }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("TripPlaceSelectionSummary", () => {
  it("atualiza as contagens quando a preferência muda sem recarregar a página", async () => {
    const action = vi.fn(async (formData: FormData) => {
      const intent = String(formData.get("intent")) as "WANT" | "MAYBE" | "NOT_INTERESTED";
      return {
        status: "success" as const,
        message: "Preferência atualizada.",
        preference: { intent, priority: null },
      };
    });

    const { container } = render(
      <>
        <TripPlaceSelectionSummary
          initialCounts={{ WANT: 1, MAYBE: 0, NOT_INTERESTED: 0, mustDo: 0 }}
        />
        <TripPlacePreferenceControls
          currentIntent="WANT"
          fields={{ tripId: "trip-1", placeSlug: "praia-do-amor" }}
          label="Preferência para Praia do Amor"
          setAction={action}
        />
      </>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Talvez" }));

    const summary = container.querySelector('[data-selection-summary="true"]');
    expect(summary).not.toBeNull();
    const wantRow = within(summary as HTMLElement).getByText("Quero ir").closest("div");
    const maybeRow = within(summary as HTMLElement).getByText("Talvez").closest("div");

    await waitFor(() => expect(wantRow).toHaveTextContent("Quero ir0"));
    await waitFor(() => expect(maybeRow).toHaveTextContent("Talvez1"));
    expect(navigationMocks.refresh).not.toHaveBeenCalled();
  });
});
