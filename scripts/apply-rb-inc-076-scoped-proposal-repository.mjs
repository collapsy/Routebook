import { readFileSync, writeFileSync, unlinkSync } from "node:fs";

const repositoryPath = "packages/database/src/proposal-repository.ts";
const testPath = "packages/database/src/proposal-repository.test.ts";
const workflowPath = ".github/workflows/rb-inc-076-apply.yml";
const scriptPath = "scripts/apply-rb-inc-076-scoped-proposal-repository.mjs";

let repository = readFileSync(repositoryPath, "utf8");

const typeAnchor = "type ProposedActivityInsert = typeof proposedActivities.$inferInsert;\n";
const executorType = `\nexport type ItineraryProposalDatabaseExecutor = Pick<\n  ReturnType<typeof getDatabase>,\n  "select" | "insert" | "update" | "delete"\n>;\n`;
if (!repository.includes("export type ItineraryProposalDatabaseExecutor")) {
  if (!repository.includes(typeAnchor)) throw new Error("Type anchor não encontrado.");
  repository = repository.replace(typeAnchor, `${typeAnchor}${executorType}`);
}

repository = repository.replace(
  "async function assertProposalReferences(proposal: ItineraryProposal): Promise<void> {\n  const database = getDatabase();",
  "async function assertProposalReferences(\n  proposal: ItineraryProposal,\n  database: ItineraryProposalDatabaseExecutor,\n): Promise<void> {",
);

const classAnchor =
  "export class DrizzleItineraryProposalRepository implements ItineraryProposalRepository {\n";
const classHeader = `export class DrizzleItineraryProposalRepository implements ItineraryProposalRepository {\n  constructor(\n    private readonly database: ItineraryProposalDatabaseExecutor = getDatabase(),\n    private readonly useOwnTransaction = true,\n  ) {}\n\n  private async withWriteExecutor<TResult>(\n    operation: (database: ItineraryProposalDatabaseExecutor) => Promise<TResult>,\n  ): Promise<TResult> {\n    if (!this.useOwnTransaction) return operation(this.database);\n\n    const host = this.database as ReturnType<typeof getDatabase>;\n    if (typeof host.transaction !== "function") return operation(this.database);\n\n    return host.transaction(async (transaction) => operation(transaction));\n  }\n\n`;
if (!repository.includes("private async withWriteExecutor")) {
  if (!repository.includes(classAnchor)) throw new Error("Class anchor não encontrado.");
  repository = repository.replace(classAnchor, classHeader);
}

repository = repository.replaceAll(
  "await assertProposalReferences(proposal);",
  "await assertProposalReferences(proposal, this.database);",
);
repository = repository.replace(
  "const inserted = await getDatabase()\n      .insert(itineraryProposals)",
  "const inserted = await this.database\n      .insert(itineraryProposals)",
);
repository = repository.replace(
  "return getDatabase().transaction(async (transaction) => {",
  "return this.withWriteExecutor(async (database) => {",
);
repository = repository.replace("const updated = await transaction\n        .update", "const updated = await database\n        .update");
repository = repository.replace("await transaction\n        .delete", "await database\n        .delete");
repository = repository.replace("await transaction.insert(proposedActivities)", "await database.insert(proposedActivities)");
repository = repository.replaceAll("const database = getDatabase();", "const database = this.database;");

const factory = `\n\nexport function createPostgresItineraryProposalRepository(\n  executor: ItineraryProposalDatabaseExecutor,\n): DrizzleItineraryProposalRepository {\n  if (\n    !executor ||\n    typeof executor.select !== "function" ||\n    typeof executor.insert !== "function" ||\n    typeof executor.update !== "function" ||\n    typeof executor.delete !== "function"\n  ) {\n    throw new TypeError("Informe um executor Drizzle transacional válido.");\n  }\n\n  return new DrizzleItineraryProposalRepository(executor, false);\n}\n`;
if (!repository.includes("export function createPostgresItineraryProposalRepository")) {
  repository = `${repository.trimEnd()}${factory}`;
}

writeFileSync(repositoryPath, repository);

let test = readFileSync(testPath, "utf8");
test = test.replace(
  'import { DrizzleItineraryProposalRepository } from "./proposal-repository";',
  'import {\n  createPostgresItineraryProposalRepository,\n  DrizzleItineraryProposalRepository,\n} from "./proposal-repository";',
);

const scopedTest = `\n\n  it("usa o executor escopado e participa do rollback da transação externa", async () => {\n    const fixture = await createFixture("Rollback do repository transacional");\n    const requested = buildProposal(fixture, new Date("2026-08-02T09:00:00.000Z"));\n    const ready = buildReadyProposal(requested);\n    const rollback = new Error("rollback externo");\n\n    try {\n      await expect(\n        getDatabase().transaction(async (transaction) => {\n          const repository = createPostgresItineraryProposalRepository(transaction);\n          await repository.create(requested);\n          await repository.save(ready);\n\n          expect(await repository.findById(fixture.trip.id, requested.id)).toEqual(ready);\n          expect(await repository.listByTripId(fixture.trip.id)).toEqual([ready]);\n          throw rollback;\n        }),\n      ).rejects.toBe(rollback);\n\n      expect(\n        await new DrizzleItineraryProposalRepository().findById(\n          fixture.trip.id,\n          requested.id,\n        ),\n      ).toBeNull();\n    } finally {\n      await cleanup(fixture.trip.id);\n    }\n  });`;

if (!test.includes("participa do rollback da transação externa")) {
  const closing = "\n});";
  const index = test.lastIndexOf(closing);
  if (index < 0) throw new Error("Fechamento do describe não encontrado.");
  test = `${test.slice(0, index)}${scopedTest}${test.slice(index)}`;
}
writeFileSync(testPath, test);

unlinkSync(workflowPath);
unlinkSync(scriptPath);
