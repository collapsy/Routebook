import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import { authUsers, closeDatabase, getDatabase } from "@routebook/database";

import { getRouteBookSession } from "./auth-session";
import { createRouteBookAuth } from "./auth";

function sessionCookie(headers: Headers): string {
  const cookies = headers.getSetCookie();
  const cookie = cookies
    .map((value) => value.split(";", 1)[0])
    .filter((value): value is string => Boolean(value))
    .join("; ");

  if (!cookie) throw new Error("Better Auth não retornou cookie de sessão.");
  return cookie;
}

afterAll(async () => {
  await closeDatabase();
});

describe("Better Auth with PostgreSQL", () => {
  it("cria usuário, emite sessão, resolve no servidor e revoga no logout", async () => {
    const database = getDatabase();
    const email = `routebook-${randomUUID()}@example.com`;
    const password = "routebook-test-password";
    const currentAuth = createRouteBookAuth({
      database,
      secret: "routebook-test-secret-with-at-least-32-characters",
      baseURL: "http://localhost:3000",
    });

    try {
      const signedUp = await currentAuth.api.signUpEmail({
        body: {
          name: "RouteBook QA",
          email,
          password,
        },
        returnHeaders: true,
      });
      const cookie = sessionCookie(signedUp.headers);
      const requestHeaders = new Headers({ cookie });

      expect(signedUp.response.user).toMatchObject({
        name: "RouteBook QA",
        email,
        emailVerified: false,
      });
      await expect(
        getRouteBookSession(requestHeaders, currentAuth.api),
      ).resolves.toMatchObject({
        user: {
          id: signedUp.response.user.id,
          name: "RouteBook QA",
          email,
          emailVerified: false,
        },
        session: {
          token: expect.any(String),
          expiresAt: expect.any(Date),
        },
      });

      await currentAuth.api.signOut({ headers: requestHeaders });
      await expect(
        getRouteBookSession(requestHeaders, currentAuth.api),
      ).resolves.toBeNull();
    } finally {
      await database.delete(authUsers).where(eq(authUsers.email, email));
    }
  });

  it("retorna null para cookie ausente ou inválido", async () => {
    const currentAuth = createRouteBookAuth({
      database: getDatabase(),
      secret: "routebook-test-secret-with-at-least-32-characters",
      baseURL: "http://localhost:3000",
    });

    await expect(
      getRouteBookSession(new Headers(), currentAuth.api),
    ).resolves.toBeNull();
    await expect(
      getRouteBookSession(
        new Headers({ cookie: "better-auth.session_token=invalid" }),
        currentAuth.api,
      ),
    ).resolves.toBeNull();
  });
});
