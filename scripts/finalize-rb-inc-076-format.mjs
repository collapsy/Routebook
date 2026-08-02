import { readFileSync, writeFileSync, unlinkSync } from "node:fs";

const testPath = "packages/database/src/proposal-repository.test.ts";
const packagePath = "package.json";
const workflowPath = ".github/workflows/rb-inc-076-format-finalize.yml";
const scriptPath = "scripts/finalize-rb-inc-076-format.mjs";

let test = readFileSync(testPath, "utf8");
test = test.replace(
  `        await new DrizzleItineraryProposalRepository().findById(\n          fixture.trip.id,\n          requested.id,\n        ),`,
  `        await new DrizzleItineraryProposalRepository().findById(fixture.trip.id, requested.id),`,
);
writeFileSync(testPath, test);

const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
packageJson.scripts["format:check"] = "prettier --check .";
writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

unlinkSync(workflowPath);
unlinkSync(scriptPath);
