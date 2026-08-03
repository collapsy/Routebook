import { describe, expect, it, vi } from "vitest";

import {
  createAuthExperience,
  resolveSafeReturnPath,
  signInCredentialsFromForm,
  signUpCredentialsFromForm,
  type RouteBookAuthApi,
} from "./auth-experience";

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

function api(overrides: Partial<RouteBookAuthApi> = {}): RouteBookAuthApi {
  return {
    signUpEmail: vi.fn().mockResolvedValue({}),
    signInEmail: vi.fn().mockResolvedValue({}),
    signOut: vi.fn().mockResolvedValue({}),
    ...overrides,
  };
}

describe("authentication input", () => {
  it("normaliza cadastro válido", () => {
    expect(
      signUpCredentialsFromForm(
        form({
          name: "  Ronaldo   Gentil  ",
          email: " RONALDO@EXAMPLE.COM ",
          password: "12345678",
        }),
      ),
    ).toEqual({
      ok: true,
      credentials: {
        name: "Ronaldo Gentil",
        email: "ronaldo@example.com",
        password: "12345678",
      },
    });
  });

  it("rejeita cadastro inválido sem chamar infraestrutura", async () => {
    const currentApi = api();
    const experience = createAuthExperience(currentApi);
    const result = await experience.signUp(
      form({ name: "R", email: "invalido", password: "curta" }),
    );

    expect(result).toMatchObject({
      ok: false,
      state: {
        fieldErrors: {
          name: expect.any(String),
          email: expect.any(String),
          password: expect.any(String),
        },
      },
    });
    expect(currentApi.signUpEmail).not.toHaveBeenCalled();
  });

  it("exige email e senha na entrada", () => {
    expect(signInCredentialsFromForm(form({ email: "", password: "" }))).toMatchObject({
      ok: false,
      state: {
        fieldErrors: {
          email: expect.any(String),
          password: expect.any(String),
        },
      },
    });
  });
});

describe("safe return path", () => {
  it.each([
    [undefined, "/viagens"],
    ["https://evil.example", "/viagens"],
    ["//evil.example", "/viagens"],
    ["/\\evil.example", "/viagens"],
    ["/api/auth/session", "/viagens"],
    ["/viagens", "/viagens"],
    ["/viagens/nova?from=auth", "/viagens/nova?from=auth"],
  ])("resolve %s como %s", (input, expected) => {
    expect(resolveSafeReturnPath(input)).toBe(expected);
  });
});

describe("authentication operations", () => {
  it("envia apenas credenciais normalizadas", async () => {
    const currentApi = api();
    const experience = createAuthExperience(currentApi);

    await expect(
      experience.signIn(form({ email: " USER@EXAMPLE.COM ", password: "password" })),
    ).resolves.toEqual({ ok: true });
    expect(currentApi.signInEmail).toHaveBeenCalledWith({
      body: { email: "user@example.com", password: "password" },
    });
  });

  it("mapeia credencial inválida sem expor mensagem técnica", async () => {
    const currentApi = api({
      signInEmail: vi.fn().mockRejectedValue({ body: { code: "INVALID_EMAIL_OR_PASSWORD" } }),
    });

    await expect(
      createAuthExperience(currentApi).signIn(
        form({ email: "user@example.com", password: "password" }),
      ),
    ).resolves.toEqual({
      ok: false,
      state: { fieldErrors: {}, formError: "Email ou senha inválidos." },
    });
  });

  it("mapeia conta existente sem confirmar detalhes do cadastro", async () => {
    const currentApi = api({
      signUpEmail: vi.fn().mockRejectedValue({ code: "USER_ALREADY_EXISTS" }),
    });

    await expect(
      createAuthExperience(currentApi).signUp(
        form({ name: "RouteBook QA", email: "user@example.com", password: "password" }),
      ),
    ).resolves.toEqual({
      ok: false,
      state: {
        fieldErrors: { email: "Não foi possível criar a conta com este email." },
      },
    });
  });

  it("propaga falha técnica desconhecida", async () => {
    const failure = new Error("database unavailable");
    const currentApi = api({ signInEmail: vi.fn().mockRejectedValue(failure) });

    await expect(
      createAuthExperience(currentApi).signIn(
        form({ email: "user@example.com", password: "password" }),
      ),
    ).rejects.toBe(failure);
  });

  it("encaminha headers no logout", async () => {
    const currentApi = api();
    const requestHeaders = new Headers({ cookie: "session=value" });

    await createAuthExperience(currentApi).signOut(requestHeaders);
    expect(currentApi.signOut).toHaveBeenCalledWith({ headers: requestHeaders });
  });
});
