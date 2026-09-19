import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const migrationPath = fileURLToPath(
  new URL("../drizzle/0035_persist_itinerary_proposal_generation_context.sql", import.meta.url),
);
const migration = fs.readFileSync(migrationPath, "utf8");

describe("0035_persist_itinerary_proposal_generation_context", () => {
  it("é aditiva e preserva Proposals existentes como INITIAL", () => {
    expect(migration).toContain(
      'ADD COLUMN "generation_scope" varchar(16) DEFAULT \'INITIAL\' NOT NULL',
    );
    expect(migration).toContain('ADD COLUMN "generation_context" jsonb');
    expect(migration).toContain("itinerary_proposals_generation_scope_check");
    expect(migration).toContain("'INITIAL', 'REPLAN'");
  });

  it("não executa operação destrutiva nem reescreve conteúdo existente", () => {
    expect(migration).not.toMatch(/\bDROP\s+(TABLE|COLUMN)\b/i);
    expect(migration).not.toMatch(/\bDELETE\s+FROM\b/i);
    expect(migration).not.toMatch(/\bUPDATE\s+/i);
    expect(migration).not.toMatch(/\bRENAME\b/i);
  });
});
