import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const registryPath = "docs/registry.md";
const registry = readFileSync(registryPath, "utf8");
const anchor =
  "| RB-CTX-093 | Context Pack do RB-INC-093 | Implementation Context | Draft | 0.1.0 | [rb-inc-093-itinerary-proposal-acceptance-e2e.md](./implementation/context-packs/rb-inc-093-itinerary-proposal-acceptance-e2e.md) |";
const rows = [
  "| RB-INC-094 | Adapter Determinístico de Geração de Itinerary Proposal Ready | Implementation | Draft | 0.1.0 | [rb-inc-094-deterministic-itinerary-proposal-generator.md](./implementation/increments/rb-inc-094-deterministic-itinerary-proposal-generator.md) |",
  "| RB-CTX-094 | Context Pack do RB-INC-094 | Implementation Context | Draft | 0.1.0 | [rb-inc-094-deterministic-itinerary-proposal-generator.md](./implementation/context-packs/rb-inc-094-deterministic-itinerary-proposal-generator.md) |",
].join("\n");

if (registry.includes(rows)) {
  throw new Error("RB-INC-094 já está registrado.");
}
if (registry.split(anchor).length !== 2) {
  throw new Error("O anchor RB-CTX-093 não é único.");
}

writeFileSync(registryPath, registry.replace(anchor, `${anchor}\n${rows}`));

execFileSync(
  "pnpm",
  [
    "exec",
    "prettier",
    "--write",
    "modules/proposal-management/src/deterministic-itinerary-proposal-generator.ts",
    "modules/proposal-management/src/deterministic-itinerary-proposal-generator.test.ts",
    "modules/proposal-management/src/index.ts",
    "docs/implementation/increments/rb-inc-094-deterministic-itinerary-proposal-generator.md",
    "docs/implementation/context-packs/rb-inc-094-deterministic-itinerary-proposal-generator.md",
    registryPath,
  ],
  { stdio: "inherit" },
);
