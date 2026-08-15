const service = "routebook-web";
const gitCommitShaPattern = /^[0-9a-f]{40}$/i;

export const readinessTimeoutMilliseconds = 2_000;

export type LivenessReport = Readonly<{
  service: typeof service;
  signal: "liveness";
  status: "ok";
}>;

export type ReadinessReport = Readonly<{
  service: typeof service;
  signal: "readiness";
  status: "ready" | "unavailable";
  dependencies: Readonly<{
    database: "available" | "unavailable";
  }>;
}>;

export type ReleaseReport = Readonly<{
  service: typeof service;
  signal: "release";
  status: "identified" | "unknown";
  commitSha: string | null;
}>;

export type OperationalHealthReport = LivenessReport | ReadinessReport | ReleaseReport;

export function livenessReport(): LivenessReport {
  return Object.freeze({ service, signal: "liveness", status: "ok" });
}

export function releaseReport(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): ReleaseReport {
  const configuredSha = environment.VERCEL_GIT_COMMIT_SHA?.trim();
  const commitSha =
    configuredSha && gitCommitShaPattern.test(configuredSha) ? configuredSha.toLowerCase() : null;

  return Object.freeze({
    service,
    signal: "release",
    status: commitSha ? "identified" : "unknown",
    commitSha,
  });
}

export async function readinessReport(
  checkDatabase: () => Promise<unknown>,
  timeoutMilliseconds = readinessTimeoutMilliseconds,
): Promise<ReadinessReport> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      checkDatabase(),
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error("readiness-timeout")), timeoutMilliseconds);
      }),
    ]);

    return Object.freeze({
      service,
      signal: "readiness",
      status: "ready",
      dependencies: Object.freeze({ database: "available" }),
    });
  } catch {
    return Object.freeze({
      service,
      signal: "readiness",
      status: "unavailable",
      dependencies: Object.freeze({ database: "unavailable" }),
    });
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
}

export function operationalHealthResponse(report: OperationalHealthReport): Response {
  return Response.json(report, {
    status: report.status === "unavailable" ? 503 : 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
