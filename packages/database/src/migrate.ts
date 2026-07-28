import { fileURLToPath } from "node:url";

import { migrate } from "drizzle-orm/postgres-js/migrator";

import { closeDatabase, getDatabase } from "./client";

const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));

try {
  await migrate(getDatabase(), { migrationsFolder });
  console.log("Migrations aplicadas com sucesso.");
} finally {
  await closeDatabase();
}
