import { readFileSync, writeFileSync, unlinkSync } from "node:fs";

const registryPath = "docs/registry.md";
const matrixPath = "docs/implementation/traceability-matrix.md";
const workflowPath = ".github/workflows/rb-inc-075-docs-sync.yml";
const scriptPath = "scripts/sync-rb-inc-075-docs.mjs";

const registryRows = [
  "| RB-INC-075 | Fragment Transacional de Proposal Application | Implementation Increment | Draft | 0.1.0 | [rb-inc-075-proposal-application-transaction-fragment.md](./implementation/increments/rb-inc-075-proposal-application-transaction-fragment.md) |",
  "| RB-CTX-075 | Context Pack do RB-INC-075 | Implementation Context Pack | Draft | 0.1.0 | [rb-inc-075-proposal-application-transaction-fragment.md](./implementation/context-packs/rb-inc-075-proposal-application-transaction-fragment.md) |",
];

let registry = readFileSync(registryPath, "utf8");
if (!registry.includes("| RB-INC-075 |")) {
  const anchor = /^\| RB-CTX-074 .*$/m;
  const match = registry.match(anchor);
  if (!match) throw new Error("Não foi possível localizar RB-CTX-074 no registry.");
  registry = registry.replace(match[0], `${match[0]}\n${registryRows.join("\n")}`);
  writeFileSync(registryPath, registry);
}

const row075 =
  "| RB-INC-075 | RB-ADR-027, RB-ARC-003–004, RB-DATA-002 e RB-INC-069, RB-INC-071, RB-INC-073–074 | #173 | `feature/rb-inc-075-proposal-application-transaction-fragment`, PR #174 | fragment de reserva idempotente e conclusão terminal de Proposal Application sobre executor escopado | código validado em run 30733450623; documentação e evidências finais em execução | Em execução |";

let matrix = readFileSync(matrixPath, "utf8");
const anchorPattern = /^\| RB-INC-074 .*$/m;
const anchorMatch = matrix.match(anchorPattern);
if (!anchorMatch) throw new Error("Não foi possível localizar RB-INC-074 na matriz.");
const integrated074 = anchorMatch[0].replace(/\| Pronto para integração \|$/, "| Integrado |");
if (!matrix.includes("| RB-INC-075 |")) {
  matrix = matrix.replace(anchorMatch[0], `${integrated074}\n${row075}`);
} else {
  matrix = matrix.replace(anchorMatch[0], integrated074);
}
matrix = matrix.replace('last_updated: "2026-07-28"', 'last_updated: "2026-08-02"');
writeFileSync(matrixPath, matrix);

unlinkSync(workflowPath);
unlinkSync(scriptPath);
