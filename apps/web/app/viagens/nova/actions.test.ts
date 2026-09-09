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
const geocoderMocks = vi.hoisted(() => ({ geocode: vi.fn(), resolve: vi.fn() }));

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
vi.mock("@/lib/geocoding", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/geocoding")>();
  return {
    ...original,
    resolveAccommodationGeocoder: geocoderMocks.resolve,
  };
});

import { GeocodingProviderError } from "@/lib/geocoding";

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

const panajachelDestination = {
  destination: {
    name: "Panajachel, Guatemala",
    type: "city" as const,
    countryCode: "GT",
    latitude: 14.7447393,
    longitude: -91.153659,
    timeZone: "America/Guatemala",
  },
  provenance: {
    ...resolvedDestination.provenance,
    externalReference: "ChIJ-PANAJACHEL",
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
  geocoderMocks.resolve.mockReturnValue({ geocode: geocoderMocks.geocode });
  geocoderMocks.geocode.mockResolvedValue({
    normalizedAddress: "Avenida Paulista, São Paulo - SP, Brasil",
    latitude: -23.5614,
    longitude: -46.6559,
  });
});

describe("createTripAction destination selection", () => {
  it("revalida referência selecionada e geocodifica a hospedagem antes de criar a Trip", async () => {
    await expect(createTripAction({ fieldErrors: {} }, tripForm())).rejects.toThrow(
      "NEXT_REDIRECT:/viagens?created=1",
    );

    expect(suggestionMocks.resolveSelected).toHaveBeenCalledWith({
      provider: "google",
      reference: "ChIJ-SP",
      sessionToken: "8b0201d2-4fee-42cf-a4aa-2a073aa445c0",
    });
    expect(resolverMocks.resolveConfigured).not.toHaveBeenCalled();
    expect(geocoderMocks.geocode).toHaveBeenCalledWith(
      "Avenida Paulista, São Paulo - SP, São Paulo, SP",
      { countryCode: "BR" },
    );
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
        accommodationLatitude: -23.5614,
        accommodationLongitude: -46.6559,
      },
    });
  });

  it("resolve Hotel Palacio Maya em Panajachel durante a criação name-only", async () => {
    suggestionMocks.resolveSelected.mockResolvedValue({
      status: "resolved",
      value: panajachelDestination,
    });
    geocoderMocks.geocode.mockResolvedValue({
      normalizedAddress:
        "Hotel El Palacio Maya, Calle Santander, Barrio Jucanyá, Panajachel, Sololá, Guatemala",
      latitude: 14.7440496,
      longitude: -91.1561068,
    });

    const formData = tripForm({
      destination: "Panajachel, Guatemala",
      destinationSelectedLabel: "Panajachel, Guatemala",
      destinationReference: "ChIJ-PANAJACHEL",
      name: "Panajachel 2026",
      accommodationName: "Hotel Palacio Maya",
      accommodationAddress: "",
    });

    await expect(createTripAction({ fieldErrors: {} }, formData)).rejects.toThrow(
      "NEXT_REDIRECT:/viagens?created=1",
    );

    expect(geocoderMocks.geocode).toHaveBeenCalledWith("Hotel Palacio Maya, Panajachel, Guatemala", {
      countryCode: "GT",
      anchor: { latitude: 14.7447393, longitude: -91.153659 },
      maxDistanceKm: 40,
      rejectAmbiguous: true,
    });
    expect(databaseMocks.createTrip).toHaveBeenCalledWith(
      expect.objectContaining({
        trip: expect.objectContaining({
          accommodationName: "Hotel Palacio Maya",
          accommodationAddress:
            "Hotel El Palacio Maya, Calle Santander, Barrio Jucanyá, Panajachel, Sololá, Guatemala",
          accommodationLatitude: 14.7440496,
          accommodationLongitude: -91.1561068,
        }),
      }),
    );
  });

  it("cria a Trip sem coordenada quando o hotel não produz candidato seguro", async () => {
    geocoderMocks.geocode.mockResolvedValue(undefined);
    const formData = tripForm({ accommodationAddress: "" });

    await expect(createTripAction({ fieldErrors: {} }, formData)).rejects.toThrow(
      "NEXT_REDIRECT:/viagens?created=1",
    );

    expect(databaseMocks.createTrip).toHaveBeenCalledWith(
      expect.objectContaining({
        trip: expect.objectContaining({
          accommodationName: "Hotel Paulista",
        }),
      }),
    );
    const call = databaseMocks.createTrip.mock.calls[0]?.[0];
    expect(call.trip.accommodationLatitude).toBeUndefined();
    expect(call.trip.accommodationLongitude).toBeUndefined();
  });

  it("cria a Trip sem coordenada quando o Provider da hospedagem está indisponível", async () => {
    geocoderMocks.geocode.mockRejectedValue(new GeocodingProviderError());
    const formData = tripForm({ accommodationAddress: "" });

    await expect(createTripAction({ fieldErrors: {} }, formData)).rejects.toThrow(
      "NEXT_REDIRECT:/viagens?created=1",
    );

    const call = databaseMocks.createTrip.mock.calls[0]?.[0];
    expect(call.trip.accommodationName).toBe("Hotel Paulista");
    expect(call.trip.accommodationLatitude).toBeUndefined();
    expect(call.trip.accommodationLongitude).toBeUndefined();
  });

  it("não chama o Geocoder quando nenhuma hospedagem foi informada", async () => {
    const formData = tripForm({ accommodationName: "", accommodationAddress: "" });

    await expect(createTripAction({ fieldErrors: {} }, formData)).rejects.toThrow(
      "NEXT_REDIRECT:/viagens?created=1",
    );

    expect(geocoderMocks.geocode).not.toHaveBeenCalled();
    expect(databaseMocks.createTrip).toHaveBeenCalledWith(
      expect.objectContaining({
        trip: expect.objectContaining({ accommodationName: "" }),
      }),
    );
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

  it("emite um token de reset novo quando a referência selecionada não pode ser confirmada", async () => {
    suggestionMocks.resolveSelected.mockResolvedValue({ status: "not-found" });

    const first = await createTripAction({ fieldErrors: {} }, tripForm());
    const second = await createTripAction(first, tripForm());

    expect(first.fieldErrors).toEqual({
      destination: "Não conseguimos confirmar esse destino. Selecione novamente uma sugestão.",
    });
    expect(first.destinationSelectionResetToken).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(second.destinationSelectionResetToken).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(second.destinationSelectionResetToken).not.toBe(first.destinationSelectionResetToken);
    expect(databaseMocks.createTrip).not.toHaveBeenCalled();
  });

  it("invalida a sessão já concluída quando a persistência da Trip falha", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    databaseMocks.createTrip.mockRejectedValue(new Error("database unavailable"));

    const result = await createTripAction({ fieldErrors: {} }, tripForm());

    expect(suggestionMocks.resolveSelected).toHaveBeenCalledTimes(1);
    expect(result.fieldErrors).toEqual({});
    expect(result.formError).toBe(
      "Não foi possível salvar a viagem agora. Revise a conexão e tente novamente.",
    );
    expect(result.destinationSelectionResetToken).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
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
