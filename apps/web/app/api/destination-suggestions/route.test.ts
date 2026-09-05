import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({ getSession: vi.fn() }));
const suggestionMocks = vi.hoisted(() => ({ suggest: vi.fn() }));

vi.mock("@/lib/auth-session", () => ({ getRouteBookSession: authMocks.getSession }));
vi.mock("@/lib/destination-suggestions", () => ({
  suggestConfiguredDestinations: suggestionMocks.suggest,
}));

import { GET } from "./route";

const sessionToken = "rbinc180authenticated1234567890";

function requestUrl(query = "São Paulo"): string {
  const params = new URLSearchParams({ q: query, sessionToken });
  return `http://localhost/api/destination-suggestions?${params}`;
}

beforeEach(() => {
  vi.clearAllMocks();
  authMocks.getSession.mockResolvedValue({ user: { id: "user-1" } });
  suggestionMocks.suggest.mockResolvedValue({ status: "ready", suggestions: [] });
});

describe("GET /api/destination-suggestions", () => {
  it("bloqueia usuário anônimo antes de consultar o Provider", async () => {
    authMocks.getSession.mockResolvedValue(null);

    const response = await GET(new Request(requestUrl()));
    const payload = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
    expect(payload).toEqual({ error: "Autenticação necessária para buscar destinos." });
    expect(suggestionMocks.suggest).not.toHaveBeenCalled();
  });

  it("consulta sugestões somente depois de confirmar a sessão autenticada", async () => {
    suggestionMocks.suggest.mockResolvedValue({
      status: "ready",
      suggestions: [
        {
          reference: "fixture:sao-paulo-sp-br",
          label: "São Paulo, SP, Brasil",
          primaryText: "São Paulo",
          secondaryText: "SP, Brasil",
          provider: "fixture",
          attribution: "RouteBook test fixture",
        },
      ],
    });

    const response = await GET(new Request(requestUrl()));
    const payload = (await response.json()) as {
      enabled: boolean;
      suggestions: readonly { reference: string }[];
    };

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(authMocks.getSession).toHaveBeenCalledTimes(1);
    expect(suggestionMocks.suggest).toHaveBeenCalledWith("São Paulo", sessionToken);
    expect(payload.enabled).toBe(true);
    expect(payload.suggestions[0]?.reference).toBe("fixture:sao-paulo-sp-br");
  });
});
