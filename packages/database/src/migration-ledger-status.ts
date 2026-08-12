import { appendFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import postgres from "postgres";

type JournalEntry = {
  idx: number;
  when: number;
  tag: string;
};

type Journal = {
  entries: JournalEntry[];
};

export type MigrationLedgerStatus = {
  appliedCount: number;
  latestAppliedAt: number | null;
  pendingCount: number;
  pendingTags: string[];
};

export function resolveMigrationLedgerStatus(
  journal: Journal,
  ledger: { count: number; latestAppliedAt: number | null },
): MigrationLedgerStatus {
  if (!Array.isArray(journal.entries)) {
    throw new Error("Journal de migrations inválido.");
  }

  if (ledger.count === 0) {
    if (ledger.latestAppliedAt !== null) {
      throw new Error("Ledger inconsistente: timestamp presente sem registros.");
    }
    return {
      appliedCount: 0,
      latestAppliedAt: null,
      pendingCount: journal.entries.length,
      pendingTags: journal.entries.map((entry) => entry.tag),
    };
  }

  if (ledger.latestAppliedAt === null) {
    throw new Error("Ledger inconsistente: registros presentes sem timestamp.");
  }

  const latestIndex = journal.entries.findIndex((entry) => entry.when === ledger.latestAppliedAt);
  if (latestIndex === -1) {
    throw new Error("Ledger não corresponde ao journal versionado.");
  }

  const expectedAppliedCount = latestIndex + 1;
  if (ledger.count !== expectedAppliedCount) {
    throw new Error(
      `Ledger não é contíguo: ${ledger.count} registros para ${expectedAppliedCount} migrations esperadas.`,
    );
  }

  const pendingEntries = journal.entries.slice(expectedAppliedCount);
  return {
    appliedCount: ledger.count,
    latestAppliedAt: ledger.latestAppliedAt,
    pendingCount: pendingEntries.length,
    pendingTags: pendingEntries.map((entry) => entry.tag),
  };
}

async function readJournal(): Promise<Journal> {
  const raw = await readFile(new URL("../drizzle/meta/_journal.json", import.meta.url), "utf8");
  return JSON.parse(raw) as Journal;
}

async function inspectLedger(): Promise<MigrationLedgerStatus> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não configurada.");
  }

  const sql = postgres(databaseUrl, { max: 1 });
  try {
    const [table] = await sql`
      SELECT to_regclass('drizzle.__drizzle_migrations')::text AS "migrationTable"
    `;

    const journal = await readJournal();
    if (!table?.migrationTable) {
      return resolveMigrationLedgerStatus(journal, { count: 0, latestAppliedAt: null });
    }

    const [ledger] = await sql`
      SELECT
        count(*)::integer AS "count",
        max(created_at)::text AS "latestAppliedAt"
      FROM drizzle.__drizzle_migrations
    `;

    return resolveMigrationLedgerStatus(journal, {
      count: ledger?.count ?? 0,
      latestAppliedAt: ledger?.latestAppliedAt ? Number(ledger.latestAppliedAt) : null,
    });
  } finally {
    await sql.end();
  }
}

async function writeGithubOutput(status: MigrationLedgerStatus) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;

  await appendFile(
    outputPath,
    [
      `applied_count=${status.appliedCount}`,
      `latest_applied_at=${status.latestAppliedAt ?? ""}`,
      `pending_count=${status.pendingCount}`,
      `pending_tags=${status.pendingTags.join(",")}`,
    ].join("\n") + "\n",
  );
}

async function main() {
  const status = await inspectLedger();
  console.log(JSON.stringify(status));
  await writeGithubOutput(status);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
