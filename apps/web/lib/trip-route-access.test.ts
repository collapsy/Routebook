import { describe, expect, it, vi } from "vitest";

import type { TripAuthorizationReader } from "@routebook/identity-access";

import type { RouteBookSessionReader } from "./auth-session";
import { resolveTripRouteAccess } from "./trip-route-access";

const requestHeaders = new Headers({ cookie: "routebook-session=test" });
const now = new Date("2026-08-03T12:00:00.000Z");

function sessionReader(userId: string | null): RouteBookSessionReader {
  return {
    getSession: vi.fn(async () =>
      userId
        ? {
            user: {
              id: userId,
              name: "Viajante",
              email: "viajante@example.com",
              emailVerified: true,
              image: null,
              createdAt: now,
              updatedAt: now,
            },
            session: {
              id: "session-1",
              token: "session-token",
              userId,
              expiresAt: new Date("2026-08-10T12:00:00.000Z"),
              createdAt: now,
              updatedAt: now,
              ipAddress: null,
              userAgent: null,
            },
          }
        : null,
    ),
  } as unknown as RouteBookSessionReader;
}

function authorizationReader(
  options: {
    scope?: "not-found" | "unscoped" | "scoped";
    membership?: "missing" | "active";
  } = {},
): TripAuthorizationReader {
  const scope = options.scope ?? "scoped";
  const membership = options.membership ?? "active";

  return {
    findTripScope: vi.fn(async () =>
      scope === "scoped" ? { status: "scoped", accountId: "account-1" } : { status: scope },
    ),
    findMembership: vi.fn(async () =>
      membership === "active"
        ? {
            id: "membership-1",
            accountId: "account-1",
            userId: "user-1",
            role: "owner",
            status: "active",
            createdAt: now,
            updatedAt: now,
          }
        : null,
    ),
  };
}

describe("resolveTripRouteAccess", () => {
  it("identifica ausência de sessão antes de consultar autorização", async () => {
    const reader = authorizationReader();

    await expect(
      resolveTripRouteAccess(
        { tripId: "trip-1", action: "trip:view", requestHeaders },
        { sessionReader: sessionReader(null), authorizationReader: reader },
      ),
    ).resolves.toEqual({ status: "unauthenticated" });
    expect(reader.findTripScope).not.toHaveBeenCalled();
  });

  it("retorna o contexto autorizado para membership ativa", async () => {
    await expect(
      resolveTripRouteAccess(
        { tripId: "trip-1", action: "trip:view", requestHeaders },
        {
          sessionReader: sessionReader("user-1"),
          authorizationReader: authorizationReader(),
        },
      ),
    ).resolves.toEqual({
      status: "authorized",
      context: {
        userId: "user-1",
        tripId: "trip-1",
        accountId: "account-1",
        membershipId: "membership-1",
        role: "owner",
        action: "trip:view",
      },
    });
  });

  it("oculta recurso inexistente ou sem membership", async () => {
    await expect(
      resolveTripRouteAccess(
        { tripId: "trip-missing", action: "trip:view", requestHeaders },
        {
          sessionReader: sessionReader("user-1"),
          authorizationReader: authorizationReader({ scope: "not-found" }),
        },
      ),
    ).resolves.toEqual({ status: "not-found" });

    await expect(
      resolveTripRouteAccess(
        { tripId: "trip-foreign", action: "trip:view", requestHeaders },
        {
          sessionReader: sessionReader("user-1"),
          authorizationReader: authorizationReader({ membership: "missing" }),
        },
      ),
    ).resolves.toEqual({ status: "not-found" });
  });

  it("não mascara falha técnica desconhecida", async () => {
    const technicalReader: TripAuthorizationReader = {
      findTripScope: vi.fn(async () => {
        throw new Error("database unavailable");
      }),
      findMembership: vi.fn(),
    };

    await expect(
      resolveTripRouteAccess(
        { tripId: "trip-1", action: "trip:view", requestHeaders },
        {
          sessionReader: sessionReader("user-1"),
          authorizationReader: technicalReader,
        },
      ),
    ).rejects.toThrow("database unavailable");
  });
});
