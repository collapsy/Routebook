import { describe, expect, it, vi } from "vitest";

import { getRouteBookSession, type RouteBookSessionReader } from "./auth-session";

const requestHeaders = new Headers({ cookie: "routebook-session=test" });

describe("getRouteBookSession", () => {
  it("retorna null quando Better Auth não resolve sessão", async () => {
    const reader = {
      getSession: vi.fn(async () => null),
    } as unknown as RouteBookSessionReader;

    await expect(getRouteBookSession(requestHeaders, reader)).resolves.toBeNull();
    expect(reader.getSession).toHaveBeenCalledWith({ headers: requestHeaders });
  });

  it("publica somente o contexto autenticado necessário", async () => {
    const expiresAt = new Date("2026-08-09T21:00:00.000Z");
    const reader = {
      getSession: vi.fn(async () => ({
        user: {
          id: "user-1",
          name: "Ronaldo",
          email: "ronaldo@example.com",
          emailVerified: true,
          image: "https://example.com/avatar.png",
          createdAt: new Date("2026-08-02T21:00:00.000Z"),
          updatedAt: new Date("2026-08-02T21:00:00.000Z"),
        },
        session: {
          id: "session-1",
          token: "session-token",
          userId: "user-1",
          expiresAt,
          createdAt: new Date("2026-08-02T21:00:00.000Z"),
          updatedAt: new Date("2026-08-02T21:00:00.000Z"),
          ipAddress: null,
          userAgent: null,
        },
      })),
    } as unknown as RouteBookSessionReader;

    await expect(getRouteBookSession(requestHeaders, reader)).resolves.toEqual({
      user: {
        id: "user-1",
        name: "Ronaldo",
        email: "ronaldo@example.com",
        emailVerified: true,
        image: "https://example.com/avatar.png",
      },
      session: {
        id: "session-1",
        token: "session-token",
        expiresAt,
      },
    });
  });
});
