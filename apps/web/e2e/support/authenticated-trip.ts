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

type E2ETripInput = Omit<CreateAuthenticatedTripInput["trip"], "destination"> &
  Partial<Pick<CreateAuthenticatedTripInput["trip"], "destination">>;

const PIPA_E2E_DESTINATION: CreateAuthenticatedTripInput["trip"]["destination"] = {
  name: "Pipa, Tibau do Sul - RN",
  type: "district",
  countryCode: "BR",
  latitude: -6.2302,
  longitude: -35.0503,
  timeZone: "America/Fortaleza",
};

export async function getE2EWorkspaceIdentity(): Promise<E2EWorkspaceIdentity> {
  return JSON.parse(await readFile(workspaceFile, "utf8")) as E2EWorkspaceIdentity;
}

export async function createAuthenticatedE2ETrip(
  trip: E2ETripInput,
  now = new Date(),
): Promise<CreateAuthenticatedTripResult> {
  const identity = await getE2EWorkspaceIdentity();
  return createPostgresAuthenticatedTrip(
    {
      userId: identity.id,
      trip: {
        ...trip,
        destination: trip.destination ?? PIPA_E2E_DESTINATION,
      },
    },
    undefined,
    now,
  );
}
