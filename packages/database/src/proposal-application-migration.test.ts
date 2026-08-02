import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const migrationUrl = new URL("../drizzle/0018_create_proposal_applications.sql", import.meta.url);

async function migrationSql(): Promise<string> {
  return readFile(migrationUrl, "utf8");
}

describe("migration 0018 — proposal_applications", () => {
  it("cria a tabela e a unicidade idempotente por Proposal", async () => {
    const sql = await migrationSql();

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "proposal_applications"');
    expect(sql).toContain('"itinerary_proposal_id" uuid NOT NULL');
    expect(sql).toContain('"idempotency_key" text NOT NULL');
    expect(sql).toContain(
      'ON "proposal_applications" ("itinerary_proposal_id", "idempotency_key")',
    );
  });

  it("protege fingerprint, tipo, status, versões e timeline", async () => {
    const sql = await migrationSql();

    expect(sql).toContain("\"request_fingerprint\" ~ '^[0-9a-f]{64}$'");
    expect(sql).toContain("\"application_type\" IN ('full', 'partial')");
    expect(sql).toContain("\"status\" IN ('started', 'succeeded', 'failed')");
    expect(sql).toContain('"expected_itinerary_version" > 0');
    expect(sql).toContain('"completed_at" IS NULL OR "completed_at" >= "started_at"');
  });

  it("impede combinações terminais parciais", async () => {
    const sql = await migrationSql();

    expect(sql).toContain("\"status\" = 'started'");
    expect(sql).toContain("\"status\" = 'succeeded'");
    expect(sql).toContain("\"status\" = 'failed'");
    expect(sql).toContain('"resulting_itinerary_version" IS NOT NULL');
    expect(sql).toContain('"failure_code" IS NOT NULL');
  });
});
