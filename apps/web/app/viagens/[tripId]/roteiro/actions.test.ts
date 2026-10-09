import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  access: vi.fn(),
  findTrip: vi.fn(),
  findItinerary: vi.fn(),
  saveItinerary: vi.fn(),
  createItinerary: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect, notFound: mocks.notFound }));
vi.mock("@routebook/database", () => ({
  DrizzleItineraryRepository: class {
    findByTripId = mocks.findItinerary;
    save = mocks.saveItinerary;
  },
  DrizzleTripRepository: class {},
}));
vi.mock("@routebook/trip-management", () => ({
  createItinerary: mocks.createItinerary,
  findTripById: mocks.findTrip,
}));
vi.mock("../../../../lib/trip-route-access", () => ({
  resolveTripRouteAccess: mocks.access,
}));

import { startItineraryAction } from "./actions";

const tripId = "11111111-1111-4111-8111-111111111111";
const trip = { id: tripId, period: { startDate: "2027-05-01", endDate: "2027-05-03" } };

function form(returnTo?: string): FormData {
  const data = new FormData();
  data.set("tripId", tripId);
  if (returnTo) data.set("returnTo", returnTo);
  return data;
}

describe("startItineraryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.access.mockResolvedValue({ status: "authorized" });
    mocks.findTrip.mockResolvedValue(trip);
    mocks.findItinerary.mockResolvedValue(null);
    mocks.createItinerary.mockReturnValue({ tripId, days: [] });
    mocks.saveItinerary.mockResolvedValue(undefined);
  });

  it("cria somente após ação autorizada e volta à etapa de proposta sem gerar", async () => {
    await expect(startItineraryAction(form("proposal"))).rejects.toThrow(
      `NEXT_REDIRECT:/viagens/${tripId}/preparacao/proposta?preparar=1`,
    );

    expect(mocks.access).toHaveBeenCalledWith({ tripId, action: "trip:edit" });
    expect(mocks.createItinerary).toHaveBeenCalledWith({ tripId, period: trip.period });
    expect(mocks.saveItinerary).toHaveBeenCalledTimes(1);
  });

  it("é idempotente quando já existe Itinerary", async () => {
    mocks.findItinerary.mockResolvedValue({ tripId, days: [] });

    await expect(startItineraryAction(form())).rejects.toThrow(
      `NEXT_REDIRECT:/viagens/${tripId}/roteiro`,
    );

    expect(mocks.createItinerary).not.toHaveBeenCalled();
    expect(mocks.saveItinerary).not.toHaveBeenCalled();
  });

  it("não escreve quando a pessoa não está autenticada", async () => {
    mocks.access.mockResolvedValue({ status: "unauthenticated" });

    await expect(startItineraryAction(form())).rejects.toThrow(
      `NEXT_REDIRECT:/entrar?next=${encodeURIComponent(`/viagens/${tripId}/roteiro`)}`,
    );

    expect(mocks.findTrip).not.toHaveBeenCalled();
    expect(mocks.saveItinerary).not.toHaveBeenCalled();
  });
});
