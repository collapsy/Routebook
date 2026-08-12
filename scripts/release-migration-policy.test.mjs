import assert from "node:assert/strict";
import test from "node:test";

import {
  assertAppendOnlyJournal,
  classifyPendingMigrations,
  classifySqlRisk,
  parseJournal,
} from "./release-migration-policy.mjs";

function journal(tags) {
  return {
    version: "7",
    dialect: "postgresql",
    entries: tags.map((tag, idx) => ({
      idx,
      version: "7",
      when: 1000 + idx,
      tag,
      breakpoints: true,
    })),
  };
}

test("aceita journal estritamente append-only", () => {
  const base = journal(["0000_init"]);
  const head = journal(["0000_init", "0001_add_column"]);
  assert.deepEqual(
    assertAppendOnlyJournal(base, head).map((entry) => entry.tag),
    ["0001_add_column"],
  );
});

test("rejeita alteração de migration histórica", () => {
  const base = journal(["0000_init"]);
  const head = journal(["0000_changed"]);
  assert.throws(() => assertAppendOnlyJournal(base, head), /histórica alterada/);
});

test("classifica DDL aditivo como seguro", () => {
  assert.deepEqual(classifySqlRisk('ALTER TABLE "places" ADD COLUMN "note" text;'), {
    risk: "safe",
    reasons: [],
  });
});

test("classifica DML e operações destrutivas como alto risco", () => {
  const classification = classifySqlRisk(
    'UPDATE "places" SET "note" = NULL; ALTER TABLE "places" DROP CONSTRAINT "x";',
  );
  assert.equal(classification.risk, "high");
  assert.deepEqual(classification.reasons, ["drop-constraint", "update-data"]);
});

test("considera pendentes todas as migrations posteriores ao ledger", () => {
  const input = journal(["0000_init", "0001_add_column", "0002_backfill"]);
  const result = classifyPendingMigrations(input, "1000", (tag) =>
    tag === "0002_backfill" ? "UPDATE t SET x = 1" : "ALTER TABLE t ADD COLUMN x int",
  );
  assert.equal(result.appliedCount, 1);
  assert.deepEqual(
    result.pending.map((entry) => entry.tag),
    ["0001_add_column", "0002_backfill"],
  );
  assert.equal(result.risk, "high");
  assert.deepEqual(result.reasons, ["update-data"]);
});

test("rejeita ledger que não corresponde ao journal", () => {
  assert.throws(
    () => classifyPendingMigrations(journal(["0000_init"]), "9999", () => ""),
    /não corresponde ao journal/,
  );
});

test("valida estrutura e monotonicidade do journal", () => {
  const invalid = journal(["0000_init", "0001_next"]);
  invalid.entries[1].when = invalid.entries[0].when;
  assert.throws(() => parseJournal(invalid), /timestamp não crescente/);
});
