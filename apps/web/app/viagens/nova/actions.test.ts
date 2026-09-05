import { beforeEach, describe, expect, it, vi } from "vitest";

const cacheMocks = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
const navigationMocks = vi.hoisted(() => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));
const databaseMocks = vi.hoisted(() => ({ createTrip: vi.fn() }));
const sessionMocks = vi.hoisted(() => ({ getSession: vi.fn() }));
const resolverMocks = vi.hoisted(() => ({ resolveConfigured: vi.fn(), resolveText: vi.fn() }));
const suggestionMocks = vi.hoisted(() => ({ resolveSelected: vi.fn() }));

vi.mock("next/cache", () => ({ revalidatePath: cacheMocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: navigationMocks.redirect }));
vi.mock("@routebook/database", () => ({
  createPostgresAuthenticatedTrip: databaseMocks.createTrip,
}));
vi.mock("@/lib/auth-session", () => ({ getRouteBookSession: sessionMocks.getSession }));
vi.mock("@/lib/destination-resolver", () => ({
  resolveConfiguredDestinationResolver: resolverMocks.resolveConfigured,
}));
vi.mock("@/lib/destination-suggestions", () => ({
  resolveSelectedDestination: suggestionMocks.resolveSelected,
}));

import { createTripAction } from "./actions";

const resolvedDestination = {
  destination: {
    name: "São Paulo, SP",
    type: "city" as const,
    countryCode: "BR",
    latitude: -23.5505,
    longitude: -46.6333,
    timeZone: "America/Sao_Paulo",
  },
  provenance: {
    provider: "google-places",
    externalReference: "ChIJ-SP",
    sourceLicense: "Google Maps Platform Terms",
    sourceUrl: "https://maps.google.com/",
    collectedAt: new Date("2026-09-04T12:00:00.000Z"),
    method: "places-autocomplete-selection+place-details+local-timezone-estimate-v1",
    confidenceLevel: "confirmed" as const,
  },
};

function tripForm(overrides: Record<string, string> = {}): FormData {
  const values = {
    destination: "São Paulo, SP, Brasil",
    name: "Fim de semana em São Paulo",
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    accommodationName: "Hotel Paulista",
    accommodationAddress: "Avenida Paulista, São Paulo - SP",
    destinationProvider: "google",
    destinationReference: "ChIJ-SP",
    destinationSelectedLabel: "São Paulo, SP, Brasil",
    destinationSessionToken: "8b0201d2-4fee-42cf-a4aa-2a073aa445c0",
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) formData.set(key, value);
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionMocks.getSession.mockResolvedValue({ user: { id: "user-1" } });
  suggestionMocks.resolveSelected.mockResolvedValue({
    status: "resolved",
    value: resolvedDestination,
  });
  resolverMocks.resolveConfigured.mockReturnValue({
    status: "configured",
    resolver: { resolve: resolverMocks.resolveText },
  });
  resolverMocks.resolveText.mockResolvedValue({ status: "resolved", value: resolvedDestination });
  databaseMocks.createTrip.mockResolvedValue({ id: "trip-1" });
});

describe("createTripAction destination selection", () => {
  it("revalida referência selecionada no servidor antes de criar a Trip", async () => {
    await expect(createTripAction({ fieldErrors: {} }, tripForm())).rejects.toThrow(
      "NEXT_REDIRECT:/viagens?created=1",
    );

    expect(suggestionMocks.resolveSelected).toHaveBeenCalledWith({
      provider: "google",
      reference: "ChIJ-SP",
      sessionToken: "8b0201d2-4fee-42cf-a4aa-2a073aa445c0",
    });
    expect(resolverMocks.resolveConfigured).not.toHaveBeenCalled();
    expect(databaseMocks.createTrip).toHaveBeenCalledWith({
      userId: "user-1",
      destinationProvenance: resolvedDestination.provenance,
      trip: {
        name: "Fim de semana em São Paulo",
        destination: resolvedDestination.destination,
        startDate: "2026-11-10",
        endDate: "2026-11-12",
        accommodationName: "Hotel Paulista",
        accommodationAddress: "Avenida Paulista, São Paulo - SP",
      },
    });
  });

  it("rejeita identidade stale quando o texto mudou depois da seleção", async () => {
    const result = await createTripAction(
      { fieldErrors: {} },
      tripForm({ destination: "Recife, PE, Brasil" }),
    );

    expect(result).toEqual({
      fieldErrors: {
        destination:
          "O destino foi alterado depois da seleção. Escolha novamente uma sugestão para continuar.",
      },
    });
    expect(suggestionMocks.resolveSelected).not.toHaveBeenCalled();
    expect(databaseMocks.createTrip).not.toHaveBeenCalled();
  });

  it("invalida a sessão quando a referência selecionada não pode ser confirmada", async () => {
    suggestionMocks.resolveSelected.mockResolvedValue({ status: "not-found" });

    const result = await createTripAction(
      { fieldErrors: {}, destinationSelectionRevision: 4 },
      tripForm(),
    );

    expect(result).toEqual({
      fieldErrors: {
        destination: "Não conseguimos confirmar esse destino. Selecione novamente uma sugestão.",
      },
      destinationSelectionRevision: 5,
    });
    expect(databaseMocks.createTrip).not.toHaveBeenCalled();
  });

  it("invalida a sessão já concluída quando a persistência da Trip falha", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    databaseMocks.createTrip.mockRejectedValue(new Error("database unavailable"));

    const result = await createTripAction({ fieldErrors: {} }, tripForm());

    expect(suggestionMocks.resolveSelected).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      fieldErrors: {},
      formError: "Não foi possível salvar a viagem agora. Revise a conexão e tente novamente.",
      destinationSelectionRevision: 1,
    });
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it("mantém fallback textual legado quando nenhuma sugestão foi escolhida", async () => {
    const formData = tripForm({
      destination: "Florianópolis, SC",
      destinationProvider: "",
      destinationReference: "",
      destinationSelectedLabel: "",
      destinationSessionToken: "",
    });

    await expect(createTripAction({ fieldErrors: {} }, formData)).rejects.toThrow(
      "NEXT_REDIRECT:/viagens?created=1",
    );

    expect(resolverMocks.resolveConfigured).toHaveBeenCalledTimes(1);
    expect(resolverMocks.resolveText).toHaveBeenCalledWith("Florianópolis, SC");
    expect(suggestionMocks.resolveSelected).not.toHaveBeenCalled();
  });

  it("substitui o erro seco por orientação recuperável quando nenhum Provider está disponível", async () => {
    resolverMocks.resolveConfigured.mockReturnValue({ status: "unavailable", reason: "disabled" });
    const formData = tripForm({
      destinationProvider: "",
      destinationReference: "",
      destinationSelectedLabel: "",
      destinationSessionToken: "",
    });

    const result = await createTripAction({ fieldErrors: {} }, formData);

    expect(result).toEqual({
      fieldErrors: {},
      formError:
        "Selecione um destino sugerido ou tente novamente quando a busca de destinos estiver disponível.",
    });
    expect(databaseMocks.createTrip).not.toHaveBeenCalled();
  });
});
