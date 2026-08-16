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
const databaseMocks = vi.hoisted(() => {
  class PlacePromotionServiceError extends Error {
    constructor(
      message: string,
      readonly code:
        "candidate-rejected" | "possible-match" | "linked-place-not-found" | "destination-conflict",
      readonly matchedPlaceId?: string,
    ) {
      super(message);
      this.name = "PlacePromotionServiceError";
    }
  }

  return {
    promote: vi.fn(),
    PlacePromotionServiceError,
  };
});
const tripMocks = vi.hoisted(() => ({ findTripById: vi.fn() }));
const accessMocks = vi.hoisted(() => ({ resolve: vi.fn() }));
const overtureMocks = vi.hoisted(() => ({ search: vi.fn() }));

vi.mock("next/cache", () => ({ revalidatePath: cacheMocks.revalidatePath }));
vi.mock("next/navigation", () => ({
  notFound: navigationMocks.notFound,
  redirect: navigationMocks.redirect,
}));
vi.mock("@routebook/database", () => ({
  DrizzleTripRepository: class {
    findById = vi.fn();
  },
  PlacePromotionServiceError: databaseMocks.PlacePromotionServiceError,
  promoteExternalPlaceCandidate: databaseMocks.promote,
}));
vi.mock("@routebook/trip-management", () => ({ findTripById: tripMocks.findTripById }));
vi.mock("../../../../lib/trip-route-access", () => ({
  resolveTripRouteAccess: accessMocks.resolve,
}));
vi.mock("../../../../lib/overture-place-search", () => ({
  OverturePmtilesPlaceSearchAdapter: class {
    search = overtureMocks.search;
  },
}));

import { promoteExternalPlaceAction } from "./actions";

const tripId = "11111111-1111-4111-8111-111111111111";
const candidate = Object.freeze({
  provider: "overture",
  externalId: "overture-place-123",
  name: "Praia externa revalidada",
  latitude: -6.231,
  longitude: -35.052,
  providerCategory: "beach",
  category: "beach" as const,
  addressLabel: "Pipa, Tibau do Sul - RN",
  sourceUrl: "https://docs.overturemaps.org/guides/places/",
  sourceLicense: "CDLA-Permissive-2.0",
  collectedAt: new Date("2026-08-16T12:00:00Z"),
  confidence: 0.95,
});
const trip = {
  id: tripId,
  destination: { name: "Pipa, Tibau do Sul - RN" },
  accommodation: {
    name: "Hospedagem teste",
    coordinate: { latitude: -6.2302, longitude: -35.0503 },
  },
};

function promotionForm(): FormData {
  const formData = new FormData();
  formData.set("tripId", tripId);
  formData.set("externalId", candidate.externalId);
  formData.set("busca", "praia externa");
  formData.set("categoria", "beach");
  formData.set("distancia", "3");
  formData.set("preco", "free");
  return formData;
}

describe("promoteExternalPlaceAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accessMocks.resolve.mockResolvedValue({
      status: "authorized",
      context: {
        userId: "user-1",
        tripId,
        accountId: "account-1",
        membershipId: "membership-1",
        role: "owner",
        action: "trip:edit",
      },
    });
    tripMocks.findTripById.mockResolvedValue(trip);
    overtureMocks.search.mockResolvedValue([candidate]);
    databaseMocks.promote.mockResolvedValue({
      status: "created",
      placeId: "place-1",
      slug: "praia-externa-revalidada",
      publicationStatus: "draft",
    });
  });

  it("exige trip:edit e bloqueia a promoção sem sessão", async () => {
    accessMocks.resolve.mockResolvedValue({ status: "unauthenticated" });

    await expect(promoteExternalPlaceAction(promotionForm())).rejects.toThrow("NEXT_REDIRECT");

    expect(accessMocks.resolve).toHaveBeenCalledWith({ tripId, action: "trip:edit" });
    expect(navigationMocks.redirect).toHaveBeenCalledWith(
      `/entrar?next=${encodeURIComponent(`/viagens/${tripId}/lugares`)}`,
    );
    expect(overtureMocks.search).not.toHaveBeenCalled();
    expect(databaseMocks.promote).not.toHaveBeenCalled();
  });

  it("reobtém o candidato no servidor e ignora fatos externos adulterados no formulário", async () => {
    const formData = promotionForm();
    formData.set("name", "Nome adulterado no browser");
    formData.set("latitude", "0");
    formData.set("longitude", "0");
    formData.set("sourceLicense", "licenca-inventada");
    formData.set("returnTo", "https://example.invalid/redirect-aberto");

    await expect(promoteExternalPlaceAction(formData)).rejects.toThrow("NEXT_REDIRECT");

    expect(accessMocks.resolve).toHaveBeenCalledWith({ tripId, action: "trip:edit" });
    expect(overtureMocks.search).toHaveBeenCalledWith({
      destinationId: "pipa-rn-br",
      center: { latitude: -6.2302, longitude: -35.0503 },
      radiusMeters: 3_000,
      categories: ["beach"],
      limit: 40,
    });
    expect(databaseMocks.promote).toHaveBeenCalledWith({
      destinationId: "pipa-rn-br",
      candidate,
    });
    expect(cacheMocks.revalidatePath).toHaveBeenCalledWith(`/viagens/${tripId}/lugares`);

    const redirectPath = String(navigationMocks.redirect.mock.calls.at(-1)?.[0]);
    expect(redirectPath).toContain(`/viagens/${tripId}/lugares?`);
    expect(redirectPath).toContain("descoberta=externa");
    expect(redirectPath).toContain("busca=praia+externa");
    expect(redirectPath).toContain("categoria=beach");
    expect(redirectPath).toContain("distancia=3");
    expect(redirectPath).toContain("preco=free");
    expect(redirectPath).toContain("promocao=criada");
    expect(redirectPath).not.toContain("example.invalid");
    expect(redirectPath).not.toContain("adulterado");
    expect(redirectPath).not.toContain("licenca-inventada");
  });

  it("falha fechado quando o candidato não é reencontrado", async () => {
    overtureMocks.search.mockResolvedValue([]);

    await expect(promoteExternalPlaceAction(promotionForm())).rejects.toThrow("NEXT_REDIRECT");

    expect(databaseMocks.promote).not.toHaveBeenCalled();
    expect(cacheMocks.revalidatePath).not.toHaveBeenCalled();
    expect(navigationMocks.redirect).toHaveBeenCalledWith(
      expect.stringContaining("erroPromocao=candidato-nao-encontrado"),
    );
  });

  it("falha fechado quando a fonte externa não responde", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    overtureMocks.search.mockRejectedValue(new Error("provider unavailable"));

    await expect(promoteExternalPlaceAction(promotionForm())).rejects.toThrow("NEXT_REDIRECT");

    expect(databaseMocks.promote).not.toHaveBeenCalled();
    expect(cacheMocks.revalidatePath).not.toHaveBeenCalled();
    expect(navigationMocks.redirect).toHaveBeenCalledWith(
      expect.stringContaining("erroPromocao=fonte-indisponivel"),
    );
    consoleError.mockRestore();
  });

  it("mantém possível duplicidade bloqueada sem write parcial", async () => {
    databaseMocks.promote.mockRejectedValue(
      new databaseMocks.PlacePromotionServiceError(
        "Possível duplicidade encontrada.",
        "possible-match",
        "place-existing",
      ),
    );

    await expect(promoteExternalPlaceAction(promotionForm())).rejects.toThrow("NEXT_REDIRECT");

    expect(cacheMocks.revalidatePath).not.toHaveBeenCalled();
    expect(navigationMocks.redirect).toHaveBeenCalledWith(
      expect.stringContaining("erroPromocao=possivel-duplicata"),
    );
  });

  it("trata repetição idempotente como candidato já existente", async () => {
    databaseMocks.promote.mockResolvedValue({
      status: "existing",
      placeId: "place-1",
      slug: "praia-externa-revalidada",
      publicationStatus: "draft",
    });

    await expect(promoteExternalPlaceAction(promotionForm())).rejects.toThrow("NEXT_REDIRECT");

    expect(cacheMocks.revalidatePath).not.toHaveBeenCalled();
    expect(navigationMocks.redirect).toHaveBeenCalledWith(
      expect.stringContaining("promocao=existente"),
    );
  });
});
