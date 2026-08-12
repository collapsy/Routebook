import { readFileSync, writeFileSync } from "node:fs";

const registryPath = "docs/registry.md";
const registry = readFileSync(registryPath, "utf8");
const marker =
  "| RB-CTX-132 | Context Pack do RB-INC-132 — Pesquisa e Filtros de Places | Implementation Context Pack | Draft | 0.1.0 | [rb-inc-132-place-discovery-filters.md](./implementation/context-packs/rb-inc-132-place-discovery-filters.md) |\n";
const registryAddition = `${marker}| RB-INC-133 | Gate de Migration antes da Promoção de Production | Implementation | Draft | 0.1.0 | [rb-inc-133-production-migration-gate.md](./implementation/increments/rb-inc-133-production-migration-gate.md) |\n| RB-CTX-133 | Context Pack do RB-INC-133 — Gate de Migration de Production | Implementation Context Pack | Draft | 0.1.0 | [rb-inc-133-production-migration-gate.md](./implementation/context-packs/rb-inc-133-production-migration-gate.md) |\n`;

if (!registry.includes("| RB-INC-133 |")) {
  if (!registry.includes(marker)) {
    throw new Error("Marcador RB-CTX-132 não encontrado no registry.");
  }
  writeFileSync(registryPath, registry.replace(marker, registryAddition));
}

const traceabilityPath = "docs/implementation/traceability-matrix.md";
let traceability = readFileSync(traceabilityPath, "utf8").replace(
  'last_updated: "2026-08-09"',
  'last_updated: "2026-08-11"',
);

if (!traceability.includes("## Evidências previstas do RB-INC-133")) {
  traceability += `

## Evidências previstas do RB-INC-133

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | \`docs/implementation/increments/rb-inc-133-production-migration-gate.md\` |
| Context Pack | \`docs/implementation/context-packs/rb-inc-133-production-migration-gate.md\` |
| origem | incidente de ordem de deployment observado no RB-INC-132 e issue #308 |
| release gate | \`.github/workflows/production-release.yml\` |
| policy | \`scripts/release-migration-policy.mjs\` e testes |
| ledger | \`packages/database/src/migration-ledger-status.ts\` e testes |
| referência de Production | \`codex/production-release\`, inicialmente em \`90c90cb8e95f48a6e799213486d71c63eca00634\` |
| estado do banco | leitura somente: 25 registros no ledger, último timestamp \`1786301600000\` (0024), com 0025 pendente no ledger |
| segurança | nenhum secret versionado; alto risco bloqueado sem \`workflow_dispatch\` explícito |
| rastreabilidade | issue #308; PR pendente |
`;
  writeFileSync(traceabilityPath, traceability);
}
