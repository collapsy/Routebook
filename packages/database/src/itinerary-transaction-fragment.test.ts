import { describe, expect, it, vi } from "vitest";

import {
  ApplyProposalItemsDomainError,
  createItinerary,
  type Itinerary,
} from "@routebook/trip-management";
import {
  AcceptItineraryProposalError,
  createAcceptItineraryProposalCommand,
} from "@routebook/proposal-management";

import {
  createItineraryTransactionFragment,
  type ItineraryTransactionRepository,
} from "./itinerary-transaction-fragment";
import type { ItineraryDatabaseExecutor } from "./itinerary-repository";

const decidedAt = new Date("2026-08-02T12:00:00.000Z");

function itinerary(): Itinerary {
  const created = createItinerary(
    {
      tripId: "trip-1",
      period: {
        startDate: "2026-08-22",
        endDate: "2026-08-23",
        timeZone: "America/Fortaleza",
      },
    },
    new Date("2026-08-02T08:00:00.000Z"),
  );

  return { ...created, id: "itinerary-1" };
}

function command(current: Itinerary, overrides: Record<string, unknown> = {}) {
  return createAcceptItineraryProposalCommand({
    tripId: "trip-1",
    itineraryId: "itinerary-1",
    itineraryProposalId: "proposal-1",
    expectedItineraryVersion: current.version,
    idempotencyKey: "accept-1",
    actorType: "participant",
    actorId: "participant-1",
    decidedAt,
    items: [
      {
        proposedActivityId: "proposed-1",
        operationType: "add",
        targetTripDayId: current.days[0]!.id,
        title: "Praia do Amor",
        activityType: "place-visit",
        flexibility: "suggested",
        startTime: "09:00",
        durationMinutes: 180,
      },
    ],
    ...overrides,
  } as never);
}

function executor(): ItineraryDatabaseExecutor {
  return {
    select() {
      throw new Error("select não deveria ser chamado pelo fake repository");
    },
    insert() {
      throw new Error("insert não deveria ser chamado pelo fake repository");
    },
    delete() {
      throw new Error("delete não deveria ser chamado pelo fake repository");
    },
  } as unknown as ItineraryDatabaseExecutor;
}

function repository(current: Itinerary | null = itinerary()) {
  const findByTripId = vi.fn(async () => current);
  const save = vi.fn(async (saved: Itinerary) => saved);
  const value: ItineraryTransactionRepository = { findByTripId, save };
  return { value, findByTripId, save };
}

function expectAcceptanceError(error: unknown, code: string): boolean {
  expect(error).toBeInstanceOf(AcceptItineraryProposalError);
  expect(error).toMatchObject({ code });
  return true;
}

describe("createItineraryTransactionFragment", () => {
  it("cria o repository com o executor escopado, aplica integralmente e persiste uma vez", async () => {
    const current = itinerary();
    const stored = repository(current);
    const scopedExecutor = executor();
    const repositoryFactory = vi.fn(() => stored.value);
    const fragment = createItineraryTransactionFragment(scopedExecutor, repositoryFactory);
    const acceptanceCommand = command(current);

    const applied = await fragment.apply(acceptanceCommand);

    expect(repositoryFactory).toHaveBeenCalledWith(scopedExecutor);
    expect(repositoryFactory).toHaveBeenCalledTimes(1);
    expect(stored.findByTripId).toHaveBeenCalledWith("trip-1");
    expect(stored.findByTripId).toHaveBeenCalledTimes(1);
    expect(stored.save).toHaveBeenCalledTimes(1);
    expect(stored.save).toHaveBeenCalledWith(applied.itinerary);
    expect(applied.itinerary).not.toBe(current);
    expect(applied.itinerary.version).toBe(current.version + 1);
    expect(applied.itinerary.updatedAt).toEqual(decidedAt);
    expect(applied.itinerary.days[0]?.activities).toHaveLength(1);
    expect(applied.itinerary.days[0]?.activities[0]).toMatchObject({
      title: "Praia do Amor",
      type: "place-visit",
      flexibility: "suggested",
      startTime: "09:00",
      durationMinutes: 180,
    });
    expect(applied.result).toEqual({
      itineraryId: "itinerary-1",
      resultingItineraryVersion: current.version + 1,
      appliedProposedActivityIds: ["proposed-1"],
    });
  });

  it("retorna itinerary-not-found quando o aggregate não existe", async () => {
    const current = itinerary();
    const stored = repository(null);
    const fragment = createItineraryTransactionFragment(executor(), () => stored.value);

    await expect(fragment.apply(command(current))).rejects.toSatisfy((error) =>
      expectAcceptanceError(error, "itinerary-not-found"),
    );
    expect(stored.save).not.toHaveBeenCalled();
  });

  it("retorna itinerary-not-found para identidade divergente", async () => {
    const current = itinerary();
    const stored = repository({ ...current, id: "itinerary-other" });
    const fragment = createItineraryTransactionFragment(executor(), () => stored.value);

    await expect(fragment.apply(command(current))).rejects.toSatisfy((error) =>
      expectAcceptanceError(error, "itinerary-not-found"),
    );
    expect(stored.save).not.toHaveBeenCalled();
  });

  it("retorna itinerary-version-mismatch antes de qualquer write", async () => {
    const current = itinerary();
    const stored = repository({ ...current, version: current.version + 1 });
    const fragment = createItineraryTransactionFragment(executor(), () => stored.value);

    await expect(fragment.apply(command(current))).rejects.toSatisfy((error) =>
      expectAcceptanceError(error, "itinerary-version-mismatch"),
    );
    expect(stored.save).not.toHaveBeenCalled();
  });

  it("propaga erro de domínio da transformação sem persistir", async () => {
    const current = itinerary();
    const stored = repository(current);
    const fragment = createItineraryTransactionFragment(executor(), () => stored.value);
    const acceptanceCommand = command(current, {
      items: [
        {
          proposedActivityId: "proposed-1",
          operationType: "add",
          targetTripDayId: "missing-day",
          title: "Dia inexistente",
        },
      ],
    });

    await expect(fragment.apply(acceptanceCommand)).rejects.toMatchObject({
      name: "ApplyProposalItemsDomainError",
      code: "target-trip-day-not-found",
    } satisfies Partial<ApplyProposalItemsDomainError>);
    expect(stored.save).not.toHaveBeenCalled();
  });

  it("propaga falhas de leitura e persistência sem retry", async () => {
    const current = itinerary();
    const findError = new Error("find failure");
    const saveError = new Error("save failure");
    const stored = repository(current);
    stored.findByTripId.mockRejectedValueOnce(findError);
    const fragment = createItineraryTransactionFragment(executor(), () => stored.value);

    await expect(fragment.apply(command(current))).rejects.toBe(findError);
    expect(stored.findByTripId).toHaveBeenCalledTimes(1);
    expect(stored.save).not.toHaveBeenCalled();

    stored.findByTripId.mockResolvedValueOnce(current);
    stored.save.mockRejectedValueOnce(saveError);
    await expect(fragment.apply(command(current))).rejects.toBe(saveError);
    expect(stored.findByTripId).toHaveBeenCalledTimes(2);
    expect(stored.save).toHaveBeenCalledTimes(1);
  });

  it("rejeita executor, factory, repository e comando inválidos", async () => {
    const stored = repository();

    expect(() =>
      createItineraryTransactionFragment(undefined as never, () => stored.value),
    ).toThrowError(TypeError);
    expect(() => createItineraryTransactionFragment(executor(), null as never)).toThrowError(
      TypeError,
    );
    expect(() =>
      createItineraryTransactionFragment(executor(), () => undefined as never),
    ).toThrowError(TypeError);

    const fragment = createItineraryTransactionFragment(executor(), () => stored.value);
    await expect(fragment.apply(undefined as never)).rejects.toThrowError(TypeError);
  });
});
