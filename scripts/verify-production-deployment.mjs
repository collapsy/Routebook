import { pathToFileURL } from "node:url";

const DEFAULT_ATTEMPTS = 60;
const DEFAULT_INTERVAL_MS = 10_000;
const DEFAULT_TIMEOUT_MS = 5_000;
const GIT_SHA_PATTERN = /^[0-9a-f]{40}$/i;

export class ProductionDeploymentVerificationError extends Error {
  constructor(code, details = {}) {
    super(code);
    this.name = "ProductionDeploymentVerificationError";
    this.code = code;
    this.details = details;
  }
}

function normalizeExpectedSha(value) {
  const sha = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!GIT_SHA_PATTERN.test(sha)) {
    throw new ProductionDeploymentVerificationError("invalid_expected_sha");
  }
  return sha;
}

function normalizeReleaseUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new ProductionDeploymentVerificationError("invalid_release_url");
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.hash
  ) {
    throw new ProductionDeploymentVerificationError("invalid_release_url");
  }

  return url;
}

function positiveInteger(value, code) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ProductionDeploymentVerificationError(code);
  }
  return value;
}

function releaseContract(body) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return null;
  if (body.service !== "routebook-web" || body.signal !== "release") return null;

  if (body.status === "unknown" && body.commitSha === null) {
    return { status: "unknown", commitSha: null };
  }

  if (
    body.status === "identified" &&
    typeof body.commitSha === "string" &&
    GIT_SHA_PATTERN.test(body.commitSha)
  ) {
    return { status: "identified", commitSha: body.commitSha.toLowerCase() };
  }

  return null;
}

async function observeRelease({ releaseUrl, fetchImpl, timeoutMs, attempt }) {
  const checkUrl = new URL(releaseUrl);
  checkUrl.searchParams.set("_routebook_release_check", String(attempt));

  let response;
  try {
    response = await fetchImpl(checkUrl, {
      headers: {
        accept: "application/json",
        "cache-control": "no-cache",
      },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return { attempt, kind: "request_error" };
  }

  if (response.status !== 200) {
    return { attempt, kind: "http_status", httpStatus: response.status };
  }

  if (!response.headers.get("cache-control")?.toLowerCase().includes("no-store")) {
    return { attempt, kind: "cache_policy", httpStatus: response.status };
  }

  let body;
  try {
    body = await response.json();
  } catch {
    return { attempt, kind: "invalid_json", httpStatus: response.status };
  }

  const contract = releaseContract(body);
  if (!contract) {
    return { attempt, kind: "invalid_contract", httpStatus: response.status };
  }

  return {
    attempt,
    kind: contract.status === "identified" ? "identified" : "unknown",
    httpStatus: response.status,
    commitSha: contract.commitSha,
  };
}

function defaultSleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function waitForProductionDeployment({
  releaseUrl,
  expectedSha,
  fetchImpl = globalThis.fetch,
  sleepImpl = defaultSleep,
  attempts = DEFAULT_ATTEMPTS,
  intervalMs = DEFAULT_INTERVAL_MS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  onObservation = () => undefined,
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new ProductionDeploymentVerificationError("fetch_unavailable");
  }
  if (typeof sleepImpl !== "function") {
    throw new ProductionDeploymentVerificationError("sleep_unavailable");
  }
  if (typeof onObservation !== "function") {
    throw new ProductionDeploymentVerificationError("observer_unavailable");
  }

  const normalizedExpectedSha = normalizeExpectedSha(expectedSha);
  const normalizedReleaseUrl = normalizeReleaseUrl(releaseUrl);
  const normalizedAttempts = positiveInteger(attempts, "invalid_attempts");
  const normalizedIntervalMs = positiveInteger(intervalMs, "invalid_interval");
  const normalizedTimeoutMs = positiveInteger(timeoutMs, "invalid_timeout");

  let lastObservation;

  for (let attempt = 1; attempt <= normalizedAttempts; attempt += 1) {
    const observation = await observeRelease({
      releaseUrl: normalizedReleaseUrl,
      fetchImpl,
      timeoutMs: normalizedTimeoutMs,
      attempt,
    });
    lastObservation = observation;
    onObservation(observation);

    if (observation.kind === "identified" && observation.commitSha === normalizedExpectedSha) {
      return Object.freeze({
        status: "verified",
        expectedSha: normalizedExpectedSha,
        attemptsUsed: attempt,
        lastObservation: observation,
      });
    }

    if (attempt < normalizedAttempts) {
      await sleepImpl(normalizedIntervalMs);
    }
  }

  throw new ProductionDeploymentVerificationError("candidate_not_served", {
    expectedSha: normalizedExpectedSha,
    attempts: normalizedAttempts,
    lastObservation,
  });
}

function parseIntegerArgument(value, name) {
  if (value === undefined || !/^\d+$/.test(value)) {
    throw new ProductionDeploymentVerificationError(`invalid_${name}`);
  }
  return Number(value);
}

function parseCliArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new ProductionDeploymentVerificationError("invalid_arguments");
    }
    values.set(key.slice(2), value);
  }

  return {
    releaseUrl: values.get("url"),
    expectedSha: values.get("expected-sha"),
    attempts: values.has("attempts")
      ? parseIntegerArgument(values.get("attempts"), "attempts")
      : DEFAULT_ATTEMPTS,
    intervalMs: values.has("interval-ms")
      ? parseIntegerArgument(values.get("interval-ms"), "interval")
      : DEFAULT_INTERVAL_MS,
    timeoutMs: values.has("timeout-ms")
      ? parseIntegerArgument(values.get("timeout-ms"), "timeout")
      : DEFAULT_TIMEOUT_MS,
  };
}

function formatObservation(observation) {
  const fields = [`attempt=${observation.attempt}`, `state=${observation.kind}`];
  if (observation.httpStatus !== undefined) fields.push(`http=${observation.httpStatus}`);
  if (observation.commitSha) fields.push(`sha=${observation.commitSha}`);
  return fields.join(" ");
}

async function main() {
  try {
    const options = parseCliArguments(process.argv.slice(2));
    const result = await waitForProductionDeployment({
      ...options,
      onObservation(observation) {
        process.stdout.write(`[production-deployment] ${formatObservation(observation)}\n`);
      },
    });

    process.stdout.write(
      `[production-deployment] verified sha=${result.expectedSha} attempts=${result.attemptsUsed}\n`,
    );
  } catch (error) {
    const code =
      error instanceof ProductionDeploymentVerificationError ? error.code : "unexpected_failure";
    const lastObservation =
      error instanceof ProductionDeploymentVerificationError ? error.details.lastObservation : undefined;
    const suffix = lastObservation ? ` last=${formatObservation(lastObservation)}` : "";
    process.stderr.write(`[production-deployment] failed code=${code}${suffix}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
