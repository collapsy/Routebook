import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  access: vi.fn(),
  findTrip: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
  resolveSelected: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  },
}));
vi.mock("@routebook/database", () => ({
  DrizzleTripRepository: class {},
  DrizzleTripStageRepository: class {
    add = mocks.add;
    remove = mocks.remove;
  },
}));
vi.mock("@routebook/trip-management", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@routebook/trip-management")>()),
  findTripById: mocks.findTrip,
}));
vi.mock("@/lib/destination-resolver", () => ({ resolveConfiguredDestinationResolver: vi.fn() }));
vi.mock("@/lib/destination-suggestions", () => ({
  resolveSelectedDestination: mocks.resolveSelected,
}));
vi.mock("@/lib/trip-route-access", () => ({ resolveTripRouteAccess: mocks.access }));

import { addTripStageAction, removeTripStageAction } from "./actions";

const tripId = "11111111-1111-4111-8111-111111111111";
const trip = {
  id: tripId,
  destination: {
    name: "Joinville, SC",
    type: "city",
    countryCode: "BR",
    latitude: -26.304,
    longitude: -48.846,
    timeZone: "America/Sao_Paulo",
  },
  period: { startDate: "2026-11-06", endDate: "2026-11-09", timeZone: "America/Sao_Paulo" },
};

function addForm() {
  const form = new FormData();
  form.set("tripId", tripId);
  form.set("destination", "Itapema, SC, Brasil");
  form.set("destinationProvider", "fixture");
  form.set("destinationReference", "fixture:itapema-sc-br");
  form.set("destinationSelectedLabel", "Itapema, SC, Brasil");
  form.set("destinationSessionToken", "session-1");
  form.set("startDate", "2026-11-07");
  form.set("endDate", "2026-11-07");
  return form;
}

describe("Trip Stage actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.access.mockResolvedValue({ status: "authorized" });
    mocks.findTrip.mockResolvedValue(trip);
    mocks.resolveSelected.mockResolvedValue({
      status: "resolved",
      value: {
        destination: {
          name: "Itapema, SC",
          type: "city",
          countryCode: "BR",
          latitude: -27.09,
          longitude: -48.61,
          timeZone: "America/Sao_Paulo",
        },
        provenance: {
          provider: "fixture",
          externalReference: "fixture:itapema-sc-br",
          sourceLicense: "test",
          collectedAt: new Date("2026-10-16T12:00:00.000Z"),
          method: "selected-fixture",
          confidenceLevel: "confirmed",
        },
      },
    });
  });

  it("adds a one-day visit only after trip edit authorization", async () => {
    await expect(addTripStageAction(addForm())).rejects.toThrow("NEXT_REDIRECT:");
    expect(mocks.access).toHaveBeenCalledWith({ tripId, action: "trip:edit" });
    expect(mocks.add).toHaveBeenCalledWith(
      expect.objectContaining({
        tripId,
        startDate: "2026-11-07",
        endDate: "2026-11-07",
        destination: expect.objectContaining({ name: "Itapema, SC" }),
      }),
      expect.objectContaining({ provider: "fixture" }),
    );
  });

  it("rejects dates outside the Trip before writing", async () => {
    const form = addForm();
    form.set("startDate", "2026-11-10");
    form.set("endDate", "2026-11-10");
    await expect(addTripStageAction(form)).rejects.toThrow("erro=datas");
    expect(mocks.add).not.toHaveBeenCalled();
  });

  it("does not remove a stage without edit access", async () => {
    mocks.access.mockResolvedValue({ status: "not-found" });
    const form = new FormData();
    form.set("tripId", tripId);
    form.set("stageId", "22222222-2222-4222-8222-222222222222");
    await expect(removeTripStageAction(form)).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.remove).not.toHaveBeenCalled();
  });
});
