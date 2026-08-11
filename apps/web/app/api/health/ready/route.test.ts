import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ execute: vi.fn() }));

vi.mock("@routebook/database", () => ({
  getDatabase: () => ({ execute: databaseMocks.execute }),
}));

import { GET } from "./route";

describe("GET /api/health/ready", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("responde ready após uma consulta PostgreSQL superficial", async () => {
    databaseMocks.execute.mockResolvedValue([{ "?column?": 1 }]);

    const response = await GET();

    expect(databaseMocks.execute).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      service: "routebook-web",
      signal: "readiness",
      status: "ready",
      dependencies: { database: "available" },
    });
  });

  it("responde indisponível sem expor a falha PostgreSQL", async () => {
    databaseMocks.execute.mockRejectedValue(new Error("postgresql://secret@internal"));

    const response = await GET();
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body).not.toContain("secret");
    expect(JSON.parse(body)).toEqual({
      service: "routebook-web",
      signal: "readiness",
      status: "unavailable",
      dependencies: { database: "unavailable" },
    });
  });
});
