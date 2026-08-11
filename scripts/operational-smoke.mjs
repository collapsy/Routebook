import { pathToFileURL } from "node:url";

const DEFAULT_TIMEOUT_MS = 5_000;

const SIGNALS = [
  {
    name: "liveness",
    path: "/api/health/live",
    expected: {
      service: "routebook-web",
      signal: "liveness",
      status: "ok",
    },
  },
  {
    name: "readiness",
    path: "/api/health/ready",
    expected: {
      service: "routebook-web",
      signal: "readiness",
      status: "ready",
      dependencies: { database: "available" },
    },
  },
];

export class OperationalSmokeError extends Error {
  constructor(code) {
    super(code);
    this.name = "OperationalSmokeError";
    this.code = code;
  }
}

function normalizeBaseUrl(value) {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new OperationalSmokeError("invalid_base_url");
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new OperationalSmokeError("invalid_base_url");
  }

  url.pathname = url.pathname.replace(/\/$/, "");
  return url;
}

function matchesExpected(value, expected) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;

  return Object.entries(expected).every(([key, expectedValue]) => {
    if (typeof expectedValue === "object" && expectedValue !== null) {
      return matchesExpected(value[key], expectedValue);
    }

    return value[key] === expectedValue;
  });
}

async function checkSignal({ baseUrl, fetchImpl, signal, timeoutMs }) {
  let response;

  try {
    response = await fetchImpl(new URL(signal.path, `${baseUrl.href}/`), {
      headers: { accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new OperationalSmokeError(`${signal.name}_request_failed`);
  }

  if (response.status !== 200) {
    throw new OperationalSmokeError(`${signal.name}_http_status`);
  }

  if (!response.headers.get("cache-control")?.toLowerCase().includes("no-store")) {
    throw new OperationalSmokeError(`${signal.name}_cache_policy`);
  }

  let body;

  try {
    body = await response.json();
  } catch {
    throw new OperationalSmokeError(`${signal.name}_invalid_json`);
  }

  if (!matchesExpected(body, signal.expected)) {
    throw new OperationalSmokeError(`${signal.name}_invalid_contract`);
  }
}

export async function runOperationalSmoke({
  baseUrl,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new OperationalSmokeError("fetch_unavailable");
  }

  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new OperationalSmokeError("invalid_timeout");
  }

  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  for (const signal of SIGNALS) {
    await checkSignal({ baseUrl: normalizedBaseUrl, fetchImpl, signal, timeoutMs });
  }

  return { status: "ok", checks: SIGNALS.map(({ name }) => name) };
}

async function main() {
  try {
    const result = await runOperationalSmoke({ baseUrl: process.argv[2] });
    process.stdout.write(`[operational-smoke] ${result.status}: ${result.checks.join(",")}\n`);
  } catch (error) {
    const code = error instanceof OperationalSmokeError ? error.code : "unexpected_failure";
    process.stderr.write(`[operational-smoke] failed: ${code}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
