import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const baseBranch = "codex/rb-inc-159-place-actions-itinerary-entry";
execFileSync("git", ["fetch", "origin", baseBranch], { stdio: "inherit" });

const registry = execFileSync(
  "git",
  ["show", `origin/${baseBranch}:docs/registry.md`],
  { encoding: "utf8" },
);
const marker = "\n## Status possíveis\n";
const rows = `| RB-INC-160 | Guia diário completo da viagem de Pipa | Implementation | Draft | 0.1.0 | [rb-inc-160-complete-pipa-trip-guide.md](./implementation/increments/rb-inc-160-complete-pipa-trip-guide.md) |\n| RB-CTX-160 | Context Pack do RB-INC-160 — Guia diário completo da viagem de Pipa | Implementation Context Pack | Draft | 0.1.0 | [rb-inc-160-complete-pipa-trip-guide.md](./implementation/context-packs/rb-inc-160-complete-pipa-trip-guide.md) |\n`;

if (!registry.includes(marker)) {
  throw new Error("Registry marker not found");
}

writeFileSync("docs/registry.md", registry.replace(marker, `\n${rows}${marker}`));

execFileSync(
  "pnpm",
  [
    "exec",
    "prettier",
    "--write",
    "apps/web/e2e/trip-day-guide.spec.ts",
    "apps/web/lib/pipa-day-guide.test.ts",
    "apps/web/lib/pipa-day-guide.ts",
  ],
  { stdio: "inherit" },
);
