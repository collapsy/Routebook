import { describe, expect, it } from "vitest";

import { resolveBetterAuthSecret, resolveBetterAuthUrl } from "./auth";

describe("Better Auth configuration", () => {
  it("usa segredo e URL explicitamente configurados", () => {
    const environment = {
      NODE_ENV: "production",
      BETTER_AUTH_SECRET: " configured-secret-with-more-than-32-characters ",
      BETTER_AUTH_URL: " https://routebook.example.com ",
    } as NodeJS.ProcessEnv;

    expect(resolveBetterAuthSecret(environment)).toBe(
      "configured-secret-with-more-than-32-characters",
    );
    expect(resolveBetterAuthUrl(environment)).toBe("https://routebook.example.com");
  });

  it("permite valores determinísticos somente fora de produção", () => {
    const environment = { NODE_ENV: "test" } as NodeJS.ProcessEnv;

    expect(resolveBetterAuthSecret(environment)).toContain("development-only");
    expect(resolveBetterAuthUrl(environment)).toBe("http://localhost:3000");
  });

  it("usa o hostname confiável do deployment Vercel quando a URL explícita não existe", () => {
    const environment = {
      NODE_ENV: "production",
      VERCEL_URL: "routebook-git-preview-rnd10.vercel.app",
    } as NodeJS.ProcessEnv;

    expect(resolveBetterAuthUrl(environment)).toBe(
      "https://routebook-git-preview-rnd10.vercel.app",
    );
  });

  it("rejeita hostname Vercel com caracteres de URL injetáveis", () => {
    const environment = {
      NODE_ENV: "production",
      VERCEL_URL: "routebook.vercel.app/path?token=secret",
    } as NodeJS.ProcessEnv;

    expect(() => resolveBetterAuthUrl(environment)).toThrow("BETTER_AUTH_URL");
  });

  it("rejeita produção sem segredo ou URL", () => {
    const environment = { NODE_ENV: "production" } as NodeJS.ProcessEnv;

    expect(() => resolveBetterAuthSecret(environment)).toThrow("BETTER_AUTH_SECRET");
    expect(() => resolveBetterAuthUrl(environment)).toThrow("BETTER_AUTH_URL");
  });
});
