import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const MIGRATIONS_DIR = "packages/database/drizzle";
const JOURNAL_PATH = `${MIGRATIONS_DIR}/meta/_journal.json`;

const HIGH_RISK_PATTERNS = [
  ["drop-object", /\bDROP\s+(?:TABLE|COLUMN|SCHEMA|TYPE|INDEX|VIEW|MATERIALIZED\s+VIEW)\b/i],
  ["drop-constraint", /\bDROP\s+CONSTRAINT\b/i],
  ["truncate", /\bTRUNCATE\b/i],
  ["delete-data", /\bDELETE\s+FROM\b/i],
  ["update-data", /\bUPDATE\s+[\s\S]+?\bSET\b/i],
  ["insert-data", /\bINSERT\s+INTO\b/i],
  ["alter-column-type", /\bALTER\s+(?:COLUMN\s+)?[\s\S]*?\bTYPE\b/i],
  ["set-not-null", /\bSET\s+NOT\s+NULL\b/i],
  ["rename", /\bRENAME\s+(?:TO|COLUMN)\b/i],
  ["cascade", /\bCASCADE\b/i],
];

export function parseJournal(content) {
  const journal = typeof content === "string" ? JSON.parse(content) : content;
  if (!journal || !Array.isArray(journal.entries)) {
    throw new Error("Journal de migrations inválido: entries ausente.");
  }

  let previousWhen = -1;
  journal.entries.forEach((entry, index) => {
    if (entry.idx !== index) {
      throw new Error(`Journal inválido: idx ${entry.idx} na posição ${index}.`);
    }
    if (!Number.isSafeInteger(entry.when) || entry.when <= previousWhen) {
      throw new Error(`Journal inválido: timestamp não crescente em ${entry.tag}.`);
    }
    if (!/^\d{4}_[a-z0-9_]+$/.test(entry.tag ?? "")) {
      throw new Error(`Journal inválido: tag inesperada ${String(entry.tag)}.`);
    }
    previousWhen = entry.when;
  });

  return journal;
}

export function assertAppendOnlyJournal(baseJournalInput, headJournalInput) {
  const baseJournal = parseJournal(baseJournalInput);
  const headJournal = parseJournal(headJournalInput);

  if (headJournal.entries.length < baseJournal.entries.length) {
    throw new Error("Histórico de migrations foi encurtado.");
  }

  for (let index = 0; index < baseJournal.entries.length; index += 1) {
    const baseEntry = baseJournal.entries[index];
    const headEntry = headJournal.entries[index];
    if (JSON.stringify(baseEntry) !== JSON.stringify(headEntry)) {
      throw new Error(`Migration histórica alterada: ${baseEntry.tag}.`);
    }
  }

  return headJournal.entries.slice(baseJournal.entries.length);
}

export function classifySqlRisk(sql) {
  const reasons = HIGH_RISK_PATTERNS.filter(([, pattern]) => pattern.test(sql)).map(
    ([reason]) => reason,
  );
  return { risk: reasons.length > 0 ? "high" : "safe", reasons };
}

export function classifyPendingMigrations(journalInput, latestAppliedAt, readSql) {
  const journal = parseJournal(journalInput);
  const latest = latestAppliedAt == null || latestAppliedAt === "" ? null : Number(latestAppliedAt);

  if (latest !== null && !Number.isSafeInteger(latest)) {
    throw new Error("latestAppliedAt inválido.");
  }

  let appliedCount = 0;
  if (latest !== null) {
    const appliedIndex = journal.entries.findIndex((entry) => entry.when === latest);
    if (appliedIndex === -1) {
      throw new Error(`Ledger de Production não corresponde ao journal: ${latest}.`);
    }
    appliedCount = appliedIndex + 1;
  }

  const pending = journal.entries.slice(appliedCount).map((entry) => {
    const sql = readSql(entry.tag);
    const classification = classifySqlRisk(sql);
    return { ...entry, ...classification };
  });

  const reasons = [...new Set(pending.flatMap((migration) => migration.reasons))];
  return {
    appliedCount,
    pending,
    risk: reasons.length > 0 ? "high" : "safe",
    reasons,
  };
}

function gitShow(ref, repositoryPath) {
  return execFileSync("git", ["show", `${ref}:${repositoryPath}`], { encoding: "utf8" });
}

function gitDiffNameStatus(baseRef, headRef) {
  const output = execFileSync(
    "git",
    ["diff", "--name-status", "--find-renames", baseRef, headRef, "--", MIGRATIONS_DIR],
    { encoding: "utf8" },
  ).trim();
  return output ? output.split("\n").map((line) => line.split("\t")) : [];
}

function assertHistoricalSqlImmutable(baseRef, headRef) {
  const changes = gitDiffNameStatus(baseRef, headRef);
  for (const [status, oldPath, newPath] of changes) {
    const paths = [oldPath, newPath].filter(Boolean);
    const touchesSql = paths.some((entry) =>
      /^packages\/database\/drizzle\/\d{4}_.+\.sql$/.test(entry),
    );
    if (!touchesSql) continue;
    if (status !== "A") {
      throw new Error(
        `Migration SQL histórica não pode ser alterada ou removida: ${paths.join(" -> ")}.`,
      );
    }
  }
}

function appendGithubOutput(outputPath, values) {
  if (!outputPath) return;
  const lines = Object.entries(values).map(
    ([key, value]) => `${key}=${String(value).replaceAll("\n", " ")}`,
  );
  fs.appendFileSync(outputPath, `${lines.join("\n")}\n`);
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    args[arg.slice(2)] = argv[index + 1];
    index += 1;
  }
  return args;
}

export function analyzeRelease({ baseRef, headRef, latestAppliedAt }) {
  assertHistoricalSqlImmutable(baseRef, headRef);
  const baseJournal = gitShow(baseRef, JOURNAL_PATH);
  const headJournal = gitShow(headRef, JOURNAL_PATH);
  const appended = assertAppendOnlyJournal(baseJournal, headJournal);
  const head = parseJournal(headJournal);

  const sqlPaths = new Set(
    gitDiffNameStatus(baseRef, headRef)
      .filter(
        ([status, filePath]) =>
          status === "A" && /^packages\/database\/drizzle\/\d{4}_.+\.sql$/.test(filePath),
      )
      .map(([, filePath]) => path.basename(filePath, ".sql")),
  );
  for (const entry of appended) {
    if (!sqlPaths.has(entry.tag)) {
      throw new Error(`Journal adicionou ${entry.tag} sem SQL correspondente.`);
    }
  }
  for (const tag of sqlPaths) {
    if (!appended.some((entry) => entry.tag === tag)) {
      throw new Error(`SQL ${tag} foi adicionado sem entrada correspondente no journal.`);
    }
  }

  const result = classifyPendingMigrations(head, latestAppliedAt, (tag) =>
    gitShow(headRef, `${MIGRATIONS_DIR}/${tag}.sql`),
  );
  return { ...result, appended };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args["base-ref"] || !args["head-ref"]) {
    throw new Error("Use --base-ref, --head-ref e opcionalmente --latest-applied-at.");
  }

  const result = analyzeRelease({
    baseRef: args["base-ref"],
    headRef: args["head-ref"],
    latestAppliedAt: args["latest-applied-at"],
  });

  const summary = {
    appliedCount: result.appliedCount,
    appendedTags: result.appended.map((entry) => entry.tag),
    pendingTags: result.pending.map((entry) => entry.tag),
    risk: result.risk,
    reasons: result.reasons,
  };
  console.log(JSON.stringify(summary));
  appendGithubOutput(args["github-output"], {
    pending_count: result.pending.length,
    pending_tags: summary.pendingTags.join(","),
    migration_risk: result.risk,
    risk_reasons: result.reasons.join(","),
  });
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isCli) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
