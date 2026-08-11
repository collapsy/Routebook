import { livenessReport, operationalHealthResponse } from "@/lib/operational-health";

export const dynamic = "force-dynamic";

export function GET(): Response {
  return operationalHealthResponse(livenessReport());
}
