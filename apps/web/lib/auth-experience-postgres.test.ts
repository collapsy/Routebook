import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import { authUsers, closeDatabase, getDatabase } from "@routebook/database";

import { createAuthExperience } from "./auth-experience";
import { createRouteBookAuth } from "./auth";

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

afterAll(async () => {
  await closeDatabase();
});

describe("auth experience with PostgreSQL", () => {
  it("cadastra, entra e rejeita credencial inválida pelo contrato real", async () => {
    const database = getDatabase();
    const email = `rb-inc-089-${randomUUID()}@example.com`;
    const password = "routebook-postgres-password";
    const currentAuth = createRouteBookAuth({
      database,
      secret: "routebook-test-secret-with-at-least-32-characters",
      baseURL: "http://localhost:3000",
    });
    const experience = createAuthExperience(currentAuth.api);

    try {
      await expect(
        experience.signUp(form({ name: "RouteBook PostgreSQL", email, password })),
      ).resolves.toEqual({ ok: true });
      await expect(experience.signIn(form({ email, password }))).resolves.toEqual({ ok: true });
      await expect(
        experience.signIn(form({ email, password: "incorrect-password" })),
      ).resolves.toEqual({
        ok: false,
        state: { fieldErrors: {}, formError: "Email ou senha inválidos." },
      });
    } finally {
      await database.delete(authUsers).where(eq(authUsers.email, email));
    }
  });
});
