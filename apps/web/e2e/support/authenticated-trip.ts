import path from "node:path";
import { readFile } from "node:fs/promises";

import {
  createPostgresAuthenticatedTrip,
  type CreateAuthenticatedTripInput,
  type CreateAuthenticatedTripResult,
} from "@routebook/database";

const workspaceFile = path.join(process.cwd(), "playwright/.auth/workspace.json");

type E2EWorkspaceIdentity = Readonly<{
  id: string;
  name: string;
}>;

export async function getE2EWorkspaceIdentity(): Promise<E2EWorkspaceIdentity> {
  return JSON.parse(await readFile(workspaceFile, "utf8")) as E2EWorkspaceIdentity;
}

export async function createAuthenticatedE2ETrip(
  trip: CreateAuthenticatedTripInput["trip"],
  now = new Date(),
): Promise<CreateAuthenticatedTripResult> {
  const identity = await getE2EWorkspaceIdentity();
  return createPostgresAuthenticatedTrip({ userId: identity.id, trip }, undefined, now);
}
