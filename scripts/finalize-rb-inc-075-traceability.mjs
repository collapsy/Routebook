import { readFileSync, writeFileSync, unlinkSync } from "node:fs";

const matrixPath = "docs/implementation/traceability-matrix.md";
const workflowPath = ".github/workflows/rb-inc-075-traceability-finalize.yml";
const scriptPath = "scripts/finalize-rb-inc-075-traceability.mjs";
const finalRow =
  "| RB-INC-075 | RB-ADR-027, RB-ARC-003–004, RB-DATA-002 e RB-INC-069, RB-INC-071, RB-INC-073–074 | #173 | `feature/rb-inc-075-proposal-application-transaction-fragment`, PR #174 | fragment de reserva idempotente e conclusão terminal de Proposal Application sobre executor escopado | runs 30733685016 e 30733685015; 192 documentos, migrations, suíte integral, build e 56 E2E responsivos verdes | Pronto para integração |";

let matrix = readFileSync(matrixPath, "utf8");
const pattern = /^\| RB-INC-075 .*$/m;
if (!pattern.test(matrix)) throw new Error("RB-INC-075 não encontrado na matriz.");
matrix = matrix.replace(pattern, finalRow);
writeFileSync(matrixPath, matrix);

unlinkSync(workflowPath);
unlinkSync(scriptPath);
