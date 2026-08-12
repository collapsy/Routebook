import { describe, expect, it } from "vitest";

import { resolveMigrationLedgerStatus } from "./migration-ledger-status";

const journal = {
  entries: [
    { idx: 0, when: 1000, tag: "0000_init" },
    { idx: 1, when: 2000, tag: "0001_add_column" },
  ],
};

describe("resolveMigrationLedgerStatus", () => {
  it("identifica migrations pendentes por timestamp contíguo", () => {
    expect(
      resolveMigrationLedgerStatus(journal, { count: 1, latestAppliedAt: 1000 }),
    ).toEqual({
      appliedCount: 1,
      latestAppliedAt: 1000,
      pendingCount: 1,
      pendingTags: ["0001_add_column"],
    });
  });

  it("trata banco sem ledger como totalmente pendente", () => {
    expect(
      resolveMigrationLedgerStatus(journal, { count: 0, latestAppliedAt: null }),
    ).toEqual({
      appliedCount: 0,
      latestAppliedAt: null,
      pendingCount: 2,
      pendingTags: ["0000_init", "0001_add_column"],
    });
  });

  it("rejeita timestamp que não pertence ao journal", () => {
    expect(() =>
      resolveMigrationLedgerStatus(journal, { count: 1, latestAppliedAt: 9999 }),
    ).toThrow("Ledger não corresponde");
  });

  it("rejeita ledger com lacunas ou duplicidade", () => {
    expect(() =>
      resolveMigrationLedgerStatus(journal, { count: 2, latestAppliedAt: 1000 }),
    ).toThrow("Ledger não é contíguo");
  });
});
