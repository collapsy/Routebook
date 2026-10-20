import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  access: vi.fn(),
  findStage: vi.fn(),
  updateAccommodation: vi.fn(),
  prepare: vi.fn(),
  geocoder: vi.fn(),
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
  DrizzleTripStageRepository: class {
    findById = mocks.findStage;
    updateAccommodation = mocks.updateAccommodation;
  },
}));
vi.mock("@/lib/accommodation-geocoding", () => ({ prepareAccommodationUpdate: mocks.prepare }));
vi.mock("@/lib/geocoding", () => ({ resolveAccommodationGeocoder: mocks.geocoder }));
vi.mock("@/lib/trip-route-access", () => ({ resolveTripRouteAccess: mocks.access }));

import { updateStageAccommodationAction } from "./actions";

const tripId = "11111111-1111-4111-8111-111111111111";
const stageId = "22222222-2222-4222-8222-222222222222";
const stage = {
  id: stageId,
  tripId,
  destination: {
    name: "Itapema, SC",
    type: "city",
    countryCode: "BR",
    latitude: -27.09,
    longitude: -48.61,
    timeZone: "America/Sao_Paulo",
  },
  startDate: "2026-11-07",
  endDate: "2026-11-08",
  createdAt: new Date("2026-10-16T12:00:00Z"),
};

function form(): FormData {
  const data = new FormData();
  data.set("tripId", tripId);
  data.set("stageId", stageId);
  data.set("accommodationName", "Pousada Itapema");
  data.set("accommodationAddress", "Centro, Itapema");
  return data;
}

describe("Stage accommodation action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.access.mockResolvedValue({ status: "authorized" });
    mocks.findStage.mockResolvedValue(stage);
    mocks.updateAccommodation.mockResolvedValue(true);
    mocks.prepare.mockResolvedValue({
      input: {
        accommodationName: "Pousada Itapema",
        accommodationAddress: "Centro, Itapema",
        accommodationLatitude: -27.0905,
        accommodationLongitude: -48.6112,
      },
      locationStatus: "resolved",
    });
  });

  it("saves only the accommodation for an authorized stage", async () => {
    await expect(updateStageAccommodationAction({ fieldErrors: {} }, form())).rejects.toThrow(
      "saved=1&located=1",
    );
    expect(mocks.access).toHaveBeenCalledWith({ tripId, action: "trip:edit" });
    expect(mocks.findStage).toHaveBeenCalledWith(tripId, stageId);
    expect(mocks.updateAccommodation).toHaveBeenCalledWith(
      tripId,
      stageId,
      expect.objectContaining({
        name: "Pousada Itapema",
        coordinate: { latitude: -27.0905, longitude: -48.6112 },
      }),
    );
  });

  it("rejects access to a stage outside the authorized trip", async () => {
    mocks.findStage.mockResolvedValue(null);
    await expect(updateStageAccommodationAction({ fieldErrors: {} }, form())).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(mocks.updateAccommodation).not.toHaveBeenCalled();
  });

  it("does not write without edit permission", async () => {
    mocks.access.mockResolvedValue({ status: "not-found" });
    await expect(updateStageAccommodationAction({ fieldErrors: {} }, form())).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(mocks.findStage).not.toHaveBeenCalled();
    expect(mocks.updateAccommodation).not.toHaveBeenCalled();
  });

  it("returns field errors for invalid coordinates", async () => {
    mocks.prepare.mockResolvedValue({
      input: { accommodationName: "Pousada", accommodationLatitude: 91 },
      locationStatus: "manual",
    });
    await expect(
      updateStageAccommodationAction({ fieldErrors: {} }, form()),
    ).resolves.toMatchObject({
      fieldErrors: { accommodationLongitude: expect.any(String) },
    });
    expect(mocks.updateAccommodation).not.toHaveBeenCalled();
  });

  it("saves text without claiming a location when geocoding is unavailable", async () => {
    mocks.prepare.mockResolvedValue({
      input: { accommodationName: "Pousada Itapema", accommodationAddress: "Centro, Itapema" },
      locationStatus: "unavailable",
    });
    await expect(updateStageAccommodationAction({ fieldErrors: {} }, form())).rejects.toThrow(
      "saved=1&located=0",
    );
    expect(mocks.updateAccommodation).toHaveBeenCalledWith(
      tripId,
      stageId,
      expect.objectContaining({ name: "Pousada Itapema" }),
    );
  });

  it("removes only the accommodation while keeping the stage", async () => {
    mocks.prepare.mockResolvedValue({
      input: { accommodationName: "" },
      locationStatus: "removed",
    });
    await expect(updateStageAccommodationAction({ fieldErrors: {} }, form())).rejects.toThrow(
      "saved=1",
    );
    expect(mocks.updateAccommodation).toHaveBeenCalledWith(tripId, stageId, undefined);
  });
});
