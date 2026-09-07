import { describe, expect, it, vi } from "vitest";

import type {
  ExternalPlaceCandidate,
  ExternalPlaceReconciliation,
  Place,
} from "@routebook/place-catalog";
import type { Trip } from "@routebook/trip-management";

import type { PlaceBootstrapPolicy } from "./place-bootstrap";
import {
  buildTripOverviewDiscoveryMap,
  loadTripOverviewDiscoveryMap,
  TRIP_OVERVIEW_EXTERNAL_DISPLAY_LIMIT,
} from "./trip-overview-discovery-map";

const NOW = new Date("2026-09-07T12:00:00.000Z");

function trip(): Trip {
  return {
    id: "trip-gramado",
    name: "Gramado",
    destination: {
      name: "Gramado, RS, Brasil",
      type: "city",
      countryCode: "BR",
      latitude: -29.3746,
      longitude: -50.8764,
      timeZone: "America/Sao_Paulo",
    },
    period: {
      startDate: "2026-09-10",
      endDate: "2026-09-14",
      timeZone: "America/Sao_Paulo",
    },
    accommodation: {
      name: "Hotel Sky Gramado",
      address: "Av. das Hortênsias, Gramado",
      coordinate: { latitude: -29.378, longitude: -50.873 },
    },
    status: "draft",
    participants: [],
    contextVersion: 1,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function place(overrides: Partial<Place> = {}): Place {
  return {
    id: "place-1",
    slug: "lago-negro",
    name: "Lago Negro",
    summary: "Parque conhecido pelo lago e pela paisagem arborizada de Gramado.",
    category: "nature",
    latitude: -29.392,
    longitude: -50.874,
    publicationStatus: "published",
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function candidate(index: number, overrides: Partial<ExternalPlaceCandidate> = {}): ExternalPlaceCandidate {
  return {
    provider: "overture",
    externalId: `external-${index}`,
    name: `Lugar externo ${index}`,
    latitude: -29.378 + index * 0.0001,
    longitude: -50.873 + index * 0.0001,
    providerCategory: "restaurant",
    category: "gastronomy",
    addressLabel: `Rua ${index}, Gramado`,
    sourceLicense: "CDLA-Permissive-2.0",
    collectedAt: NOW,
    confidence: 0.9,
    ...overrides,
  };
}

const bootstrapPolicy: PlaceBootstrapPolicy = {
  discovery: { enabled: true, maxAttempts: 1, candidateLimit: 200 },
  quality: { enabled: false, maxAttempts: 1, targetLimit: 60 },
  media: { enabled: false, maxAttempts: 1, previewBudget: 0 },
};

describe("trip overview discovery map", () => {
  it("usa a Hospedagem como Region e limita external-only a 20 no resumo", async () => {
    const search = vi.fn().mockResolvedValue(
      Array.from({ length: 25 }, (_, index) => candidate(index + 1)),
    );
    const listPublishedWithinRadius = vi.fn().mockResolvedValue([]);
    const listByPlaceIds = vi.fn().mockResolvedValue([]);

    const result = await loadTripOverviewDiscoveryMap(trip(), new Set(), {
      placeRepository: { listPublishedWithinRadius },
      externalReferenceRepository: { listByPlaceIds },
      placeSearchPort: { search },
      bootstrapPolicy,
    });

    expect(search).toHaveBeenCalledWith({
      center: { latitude: -29.378, longitude: -50.873 },
      radiusMeters: 8_000,
      limit: 200,
    });
    expect(result.regionSource).toBe("accommodation");
    expect(result.discoveryStatus).toBe("success");
    expect(result.canonicalCount).toBe(0);
    expect(result.externalAvailableCount).toBe(25);
    expect(result.externalVisibleCount).toBe(TRIP_OVERVIEW_EXTERNAL_DISPLAY_LIMIT);
    expect(result.points).toHaveLength(TRIP_OVERVIEW_EXTERNAL_DISPLAY_LIMIT + 1);
    expect(result.points[0]).toMatchObject({
      id: "accommodation",
      kind: "accommodation",
      label: "Hotel Sky Gramado",
    });
    expect(result.points.slice(1).every((point) => point.kind === "external-place")).toBe(true);
  });

  it("não duplica candidato linked e preserva identidade canônica/salva", () => {
    const canonical = place();
    const linkedCandidate = candidate(1, {
      externalId: "lago-negro-overture",
      name: "Lago Negro",
      category: "nature",
      providerCategory: "park",
      latitude: -29.3921,
      longitude: -50.8741,
    });
    const reconciliations: ExternalPlaceReconciliation[] = [
      {
        candidate: linkedCandidate,
        status: "linked",
        matchedPlaceId: canonical.id,
        reason: "Referência externa já vinculada.",
      },
    ];

    const result = buildTripOverviewDiscoveryMap({
      trip: trip(),
      publishedPlaces: [canonical],
      externalReconciliations: reconciliations,
      reference: { latitude: -29.378, longitude: -50.873 },
      savedPlaceIds: new Set([canonical.id]),
      discoveryStatus: "success",
      regionSource: "accommodation",
    });

    expect(result.canonicalCount).toBe(1);
    expect(result.externalVisibleCount).toBe(0);
    expect(result.points.filter((point) => point.label === "Lago Negro")).toEqual([
      expect.objectContaining({ kind: "saved-place", href: "/viagens/trip-gramado/lugares/lago-negro" }),
    ]);
  });

  it("não representa candidatos rejeitados", () => {
    const rejected = candidate(1);
    const result = buildTripOverviewDiscoveryMap({
      trip: trip(),
      publishedPlaces: [],
      externalReconciliations: [
        {
          candidate: rejected,
          status: "rejected",
          reason: "Candidato não atende à política segura.",
        },
      ],
      reference: { latitude: -29.378, longitude: -50.873 },
      discoveryStatus: "success",
    });

    expect(result.externalAvailableCount).toBe(0);
    expect(result.externalVisibleCount).toBe(0);
    expect(result.points).toHaveLength(1);
    expect(result.points[0]?.kind).toBe("accommodation");
  });

  it("degrada para Hospedagem e canônicos quando a fonte externa falha", async () => {
    const canonical = place();
    const search = vi.fn().mockRejectedValue(new Error("network unavailable"));

    const result = await loadTripOverviewDiscoveryMap(trip(), new Set(), {
      placeRepository: { listPublishedWithinRadius: vi.fn().mockResolvedValue([canonical]) },
      externalReferenceRepository: { listByPlaceIds: vi.fn().mockResolvedValue([]) },
      placeSearchPort: { search },
      bootstrapPolicy,
    });

    expect(result.discoveryStatus).toBe("failed");
    expect(result.canonicalCount).toBe(1);
    expect(result.externalVisibleCount).toBe(0);
    expect(result.points.map((point) => point.kind)).toEqual([
      "accommodation",
      "published-place",
    ]);
  });
});
