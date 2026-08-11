const service = "routebook-web";

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

export type OperationalHealthReport = LivenessReport | ReadinessReport;

export function livenessReport(): LivenessReport {
  return Object.freeze({ service, signal: "liveness", status: "ok" });
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
