import { readFile } from "node:fs/promises";

import { promoteExternalPlaceCandidate } from "../packages/database/src/index.ts";
import { validateExternalPlaceCandidate } from "../modules/place-catalog/src/index.ts";

function parseArguments(argv) {
  const values = new Map();
  const flags = new Set();

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument?.startsWith("--")) continue;
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      flags.add(argument);
      continue;
    }
    values.set(argument, value);
    index += 1;
  }

  return { values, flags };
}

function hydrateCandidate(value) {
  if (!value || typeof value !== "object") throw new Error("Candidato inválido no artefato.");
  const hydrated = {
    ...value,
    collectedAt: new Date(value.collectedAt),
  };
  validateExternalPlaceCandidate(hydrated);
  return hydrated;
}

async function main() {
  const { values, flags } = parseArguments(process.argv.slice(2));
  const inputPath = values.get("--input");
  const destinationId = values.get("--destination");
  const requestedLimit = Number(values.get("--limit") ?? "200");
  const shouldPromote = flags.has("--promote");

  if (!inputPath || !destinationId) {
    throw new Error(
      "Uso: --input <candidates.json> --destination <destinationId> [--limit 200] [--promote].",
    );
  }
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 200) {
    throw new Error("O limite de promoção deve estar entre 1 e 200.");
  }

  const payload = JSON.parse(await readFile(inputPath, "utf8"));
  if (payload?.schemaVersion !== 1 || payload?.provider !== "overture") {
    throw new Error("O artefato não possui o contrato Overture v1 esperado pelo RouteBook.");
  }

  const rawCandidates = Array.isArray(payload.candidates) ? payload.candidates : [];
  const candidates = rawCandidates.slice(0, requestedLimit).map(hydrateCandidate);

  if (!shouldPromote) {
    process.stdout.write(
      `Dry-run: ${candidates.length} candidatos válidos para ${destinationId}; nenhum write foi executado. Use --promote para criar drafts.\n`,
    );
    return;
  }

  const summary = { created: 0, existing: 0, blocked: 0 };
  for (const candidate of candidates) {
    try {
      const result = await promoteExternalPlaceCandidate({ destinationId, candidate });
      summary[result.status] += 1;
      process.stdout.write(`${result.status}: ${candidate.name} -> ${result.slug}\n`);
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? error.code : "error";
      if (code === "possible-match" || code === "candidate-rejected") {
        summary.blocked += 1;
        process.stdout.write(`blocked(${code}): ${candidate.name}\n`);
        continue;
      }
      throw error;
    }
  }

  process.stdout.write(
    `Promoção concluída em drafts: ${summary.created} criados, ${summary.existing} existentes, ${summary.blocked} bloqueados.\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
