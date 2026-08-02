import { readFileSync, writeFileSync, unlinkSync } from "node:fs";

const registryPath = "docs/registry.md";
const matrixPath = "docs/implementation/traceability-matrix.md";
const workflowPath = ".github/workflows/rb-inc-076-docs-sync.yml";
const scriptPath = "scripts/sync-rb-inc-076-docs.mjs";

let registry = readFileSync(registryPath, "utf8");
const registryRows = [
  "| RB-INC-076 | Repository Transacional de Itinerary Proposal | Implementation Increment | Draft | 0.1.0 | [rb-inc-076-scoped-proposal-repository.md](./implementation/increments/rb-inc-076-scoped-proposal-repository.md) |",
  "| RB-CTX-076 | Context Pack do RB-INC-076 | Implementation Context Pack | Draft | 0.1.0 | [rb-inc-076-scoped-proposal-repository.md](./implementation/context-packs/rb-inc-076-scoped-proposal-repository.md) |",
];
if (!registry.includes("| RB-INC-076 |")) {
  const anchor = /^\| RB-CTX-075 .*$/m;
  const match = registry.match(anchor);
  if (!match) throw new Error("RB-CTX-075 não encontrado no registry.");
  registry = registry.replace(match[0], `${match[0]}\n${registryRows.join("\n")}`);
  writeFileSync(registryPath, registry);
}

let matrix = readFileSync(matrixPath, "utf8");
const row076 =
  "| RB-INC-076 | RB-ADR-006, RB-ADR-027, RB-ARC-003–004, RB-DATA-002 e RB-INC-055, RB-INC-067, RB-INC-073–075 | #175 | `feature/rb-inc-076-scoped-proposal-repository`, PR #176 | executor Drizzle injetado, modo global preservado e rollback externo sem nested transaction | código validado em run 30734294000; documentação e evidências finais em execução | Em execução |";
const anchorPattern = /^\| RB-INC-075 .*$/m;
const anchorMatch = matrix.match(anchorPattern);
if (!anchorMatch) throw new Error("RB-INC-075 não encontrado na matriz.");
const integrated075 = anchorMatch[0].replace(/\| Pronto para integração \|$/, "| Integrado |");
if (!matrix.includes("| RB-INC-076 |")) {
  matrix = matrix.replace(anchorMatch[0], `${integrated075}\n${row076}`);
} else {
  matrix = matrix.replace(anchorMatch[0], integrated075);
}
matrix = matrix.replace(/^last_updated: .*$/m, 'last_updated: "2026-08-02"');
writeFileSync(matrixPath, matrix);

unlinkSync(workflowPath);
unlinkSync(scriptPath);
