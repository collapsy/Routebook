import { beforeEach, describe, expect, it, vi } from "vitest";

const cacheMocks = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
const navigationMocks = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));
const databaseMocks = vi.hoisted(() => ({
  listPreferences: vi.fn(),
  savePreference: vi.fn(),
  removePreference: vi.fn(),
  listPlaces: vi.fn(),
}));
const tripMocks = vi.hoisted(() => ({ findTripById: vi.fn() }));
const accessMocks = vi.hoisted(() => ({ resolve: vi.fn() }));

vi.mock("next/cache", () => ({ revalidatePath: cacheMocks.revalidatePath }));
vi.mock("next/navigation", () => ({
  notFound: navigationMocks.notFound,
  redirect: navigationMocks.redirect,
}));
vi.mock("@routebook/database", () => ({
  DrizzleItineraryRepository: class {},
  DrizzlePlaceRepository: class {
    listByIds = databaseMocks.listPlaces;
  },
  DrizzleTripPlacePreferenceRepository: class {
    listByTripId = databaseMocks.listPreferences;
    save = databaseMocks.savePreference;
    remove = databaseMocks.removePreference;
  },
  DrizzleTripRepository: class {},
}));
vi.mock("@routebook/trip-management", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@routebook/trip-management")>();
  return { ...actual, findTripById: tripMocks.findTripById };
});
vi.mock("../../../../lib/trip-route-access", () => ({
  resolveTripRouteAccess: accessMocks.resolve,
}));

import { clearSelectionPlacePreferenceAction, setSelectionPlacePreferenceAction } from "./actions";

const tripId = "11111111-1111-4111-8111-111111111111";
const place = {
  id: "22222222-2222-4222-8222-222222222222",
  slug: "praia-do-amor",
  name: "Praia do Amor",
};
const trip = {
  id: tripId,
  period: { startDate: "2026-08-22", endDate: "2026-08-29" },
};

function preference(
  intent: "WANT" | "MAYBE" | "NOT_INTERESTED" = "WANT",
  priority: "MUST_DO" | null = null,
) {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    tripId,
    placeId: place.id,
    intent,
    priority,
    createdAt: new Date("2026-09-18T10:00:00Z"),
    updatedAt: new Date("2026-09-18T10:00:00Z"),
  };
}

function form(intent?: string, priority?: string): FormData {
  const formData = new FormData();
  formData.set("tripId", tripId);
  formData.set("placeSlug", place.slug);
  if (intent) formData.set("intent", intent);
  if (priority) formData.set("priority", priority);
  return formData;
}

describe("ações de Minha seleção", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accessMocks.resolve.mockResolvedValue({ status: "authorized" });
    tripMocks.findTripById.mockResolvedValue(trip);
    databaseMocks.listPlaces.mockResolvedValue([place]);
    databaseMocks.savePreference.mockImplementation(async (value) => value);
  });

  it("troca WANT + MUST_DO para MAYBE removendo a prioridade", async () => {
    databaseMocks.listPreferences.mockResolvedValue([preference("WANT", "MUST_DO")]);

    await setSelectionPlacePreferenceAction(form("MAYBE"));

    expect(databaseMocks.savePreference).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "33333333-3333-4333-8333-333333333333",
        intent: "MAYBE",
        priority: null,
      }),
    );
    expect(cacheMocks.revalidatePath).toHaveBeenCalledWith(`/viagens/${tripId}/lugares-salvos`);
  });

  it("não persiste novamente quando a escolha é idempotente", async () => {
    databaseMocks.listPreferences.mockResolvedValue([preference("MAYBE")]);

    await setSelectionPlacePreferenceAction(form("MAYBE"));

    expect(databaseMocks.savePreference).not.toHaveBeenCalled();
  });

  it("limpa somente a preferência", async () => {
    databaseMocks.listPreferences.mockResolvedValue([preference("NOT_INTERESTED")]);

    await clearSelectionPlacePreferenceAction(form());

    expect(databaseMocks.removePreference).toHaveBeenCalledWith(tripId, place.id);
    expect(databaseMocks.savePreference).not.toHaveBeenCalled();
  });

  it("rejeita Imperdível fora de Quero ir", async () => {
    databaseMocks.listPreferences.mockResolvedValue([preference("WANT")]);

    await expect(setSelectionPlacePreferenceAction(form("MAYBE", "MUST_DO"))).rejects.toThrow(
      "Imperdível somente pode ser usado com Quero ir.",
    );

    expect(databaseMocks.savePreference).not.toHaveBeenCalled();
  });
});
