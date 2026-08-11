import { sql } from "drizzle-orm";

import { getDatabase } from "@routebook/database";

import { operationalHealthResponse, readinessReport } from "@/lib/operational-health";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const report = await readinessReport(async () => {
    await getDatabase().execute(sql`SELECT 1`);
  });

  return operationalHealthResponse(report);
}
