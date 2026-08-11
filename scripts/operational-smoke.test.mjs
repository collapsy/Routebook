import assert from "node:assert/strict";
import test from "node:test";

import { OperationalSmokeError, runOperationalSmoke } from "./operational-smoke.mjs";

function healthResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json",
    },
  });
}

const liveness = { service: "routebook-web", signal: "liveness", status: "ok" };
const readiness = {
  service: "routebook-web",
  signal: "readiness",
  status: "ready",
  dependencies: { database: "available" },
};

test("aprova os dois sinais operacionais esperados", async () => {
  const paths = [];
  const fetchImpl = async (url) => {
    paths.push(url.pathname);
    return healthResponse(url.pathname.endsWith("/live") ? liveness : readiness);
  };

  const result = await runOperationalSmoke({ baseUrl: "https://routebook.example/", fetchImpl });

  assert.deepEqual(result, { status: "ok", checks: ["liveness", "readiness"] });
  assert.deepEqual(paths, ["/api/health/live", "/api/health/ready"]);
});

test("falha com código sanitizado quando readiness está indisponível", async () => {
  const fetchImpl = async (url) =>
    url.pathname.endsWith("/live")
      ? healthResponse(liveness)
      : healthResponse({ secret: "do-not-log" }, 503);

  await assert.rejects(
    runOperationalSmoke({ baseUrl: "https://routebook.example", fetchImpl }),
    (error) =>
      error instanceof OperationalSmokeError &&
      error.code === "readiness_http_status" &&
      !error.message.includes("do-not-log"),
  );
});

test("rejeita contrato aparentemente saudável mas incompatível", async () => {
  const fetchImpl = async () =>
    healthResponse({ service: "routebook-web", signal: "liveness", status: "degraded" });

  await assert.rejects(runOperationalSmoke({ baseUrl: "https://routebook.example", fetchImpl }), {
    code: "liveness_invalid_contract",
  });
});

test("interrompe requisição que excede o timeout", async () => {
  const fetchImpl = async (_url, { signal }) =>
    new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    });

  await assert.rejects(
    runOperationalSmoke({ baseUrl: "https://routebook.example", fetchImpl, timeoutMs: 10 }),
    { code: "liveness_request_failed" },
  );
});

test("rejeita URL com credenciais ou query", async () => {
  for (const baseUrl of ["https://user:secret@example.com", "https://example.com?token=secret"]) {
    await assert.rejects(runOperationalSmoke({ baseUrl, fetchImpl: async () => null }), {
      code: "invalid_base_url",
    });
  }
});
