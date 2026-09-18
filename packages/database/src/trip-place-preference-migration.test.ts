import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const migrationPath = fileURLToPath(
  new URL("../drizzle/0034_persist_trip_place_preferences.sql", import.meta.url),
);
const migration = fs.readFileSync(migrationPath, "utf8");

describe("0034_persist_trip_place_preferences", () => {
  it("faz backfill do legado antes de promover as colunas obrigatórias", () => {
    const backfill = migration.indexOf('UPDATE "saved_places"');
    const intentNotNull = migration.indexOf('ALTER COLUMN "intent" SET NOT NULL');
    const updatedAtNotNull = migration.indexOf('ALTER COLUMN "updated_at" SET NOT NULL');

    expect(backfill).toBeGreaterThanOrEqual(0);
    expect(migration).toContain("\\\"intent\\\" = 'WANT'");
    expect(migration).toContain('"priority" = NULL');
    expect(migration).toContain('"updated_at" = "created_at"');
    expect(intentNotNull).toBeGreaterThan(backfill);
    expect(updatedAtNotNull).toBeGreaterThan(backfill);
  });

  it("preserva a tabela e a chave contextual enquanto adiciona constraints canônicas", () => {
    expect(migration).not.toMatch(/\bDROP\s+(TABLE|COLUMN)\b/i);
    expect(migration).not.toMatch(/\bDELETE\s+FROM\b/i);
    expect(migration).not.toMatch(/\bRENAME\b/i);
    expect(migration).toContain("saved_places_intent_check");
    expect(migration).toContain("saved_places_priority_check");
    expect(migration).toContain("saved_places_priority_intent_check");
  });
});
