import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

let client: ReturnType<typeof postgres> | undefined;

export function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não configurada.");
  }

  client ??= postgres(databaseUrl, { max: 5 });
  return drizzle(client, { schema });
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.end();
    client = undefined;
  }
}
