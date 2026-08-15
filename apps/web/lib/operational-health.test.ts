import { afterEach, describe, expect, it, vi } from "vitest";

import {
  livenessReport,
  operationalHealthResponse,
  readinessReport,
  releaseReport,
} from "./operational-health";

describe("operational health", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("produz liveness sem dependências externas", () => {
    expect(livenessReport()).toEqual({
      service: "routebook-web",
      signal: "liveness",
      status: "ok",
    });
  });

  it("identifica o release somente com SHA Git válido", () => {
    expect(
      releaseReport({ VERCEL_GIT_COMMIT_SHA: "ABCDEF0123456789ABCDEF0123456789ABCDEF01" }),
    ).toEqual({
      service: "routebook-web",
      signal: "release",
      status: "identified",
      commitSha: "abcdef0123456789abcdef0123456789abcdef01",
    });
  });

  it("não ecoa metadado de release ausente ou inválido", () => {
    expect(releaseReport({})).toEqual({
      service: "routebook-web",
      signal: "release",
      status: "unknown",
      commitSha: null,
    });
    expect(releaseReport({ VERCEL_GIT_COMMIT_SHA: "not-a-sha-sensitive-value" })).toEqual({
      service: "routebook-web",
      signal: "release",
      status: "unknown",
      commitSha: null,
    });
  });

  it("marca readiness quando o banco responde", async () => {
    const checkDatabase = vi.fn().mockResolvedValue(undefined);

    await expect(readinessReport(checkDatabase)).resolves.toEqual({
      service: "routebook-web",
      signal: "readiness",
      status: "ready",
      dependencies: { database: "available" },
    });
    expect(checkDatabase).toHaveBeenCalledTimes(1);
  });

  it("sanitiza falhas da dependência essencial", async () => {
    await expect(
      readinessReport(() => Promise.reject(new Error("postgresql://secret@internal"))),
    ).resolves.toEqual({
      service: "routebook-web",
      signal: "readiness",
      status: "unavailable",
      dependencies: { database: "unavailable" },
    });
  });

  it("encerra readiness indisponível ao exceder o timeout", async () => {
    vi.useFakeTimers();
    const report = readinessReport(() => new Promise(() => undefined), 25);

    await vi.advanceTimersByTimeAsync(25);

    await expect(report).resolves.toMatchObject({
      status: "unavailable",
      dependencies: { database: "unavailable" },
    });
  });

  it("mapeia status HTTP e proíbe cache", async () => {
    const liveResponse = operationalHealthResponse(livenessReport());
    const releaseResponse = operationalHealthResponse(
      releaseReport({ VERCEL_GIT_COMMIT_SHA: "abcdef0123456789abcdef0123456789abcdef01" }),
    );
    const unavailableResponse = operationalHealthResponse(
      await readinessReport(() => Promise.reject(new Error("sensitive"))),
    );

    expect(liveResponse.status).toBe(200);
    expect(liveResponse.headers.get("Cache-Control")).toBe("no-store");
    expect(releaseResponse.status).toBe(200);
    expect(releaseResponse.headers.get("Cache-Control")).toBe("no-store");
    expect(unavailableResponse.status).toBe(503);
    expect(await unavailableResponse.text()).not.toContain("sensitive");
  });
});
