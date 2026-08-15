import { randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";

import type { PlaceExternalReference } from "@routebook/place-catalog";

import { getDatabase } from "./client";
import { placeExternalReferences } from "./schema";

export type PersistPlaceExternalReferenceInput = Readonly<{
  placeId: string;
  provider: string;
  externalId: string;
  sourceLicense: string;
  sourceUrl?: string;
  collectedAt: Date;
  now?: Date;
}>;

export type PersistedPlaceExternalReference = PlaceExternalReference &
  Readonly<{
    id: string;
    sourceLicense: string;
    sourceUrl?: string;
    collectedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }>;

type PlaceExternalReferenceDatabase = Pick<ReturnType<typeof getDatabase>, "select" | "insert">;

function mapReference(
  row: typeof placeExternalReferences.$inferSelect,
): PersistedPlaceExternalReference {
  return {
    id: row.id,
    placeId: row.placeId,
    provider: row.provider,
    externalId: row.externalId,
    sourceLicense: row.sourceLicense,
    ...(row.sourceUrl ? { sourceUrl: row.sourceUrl } : {}),
    collectedAt: row.collectedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzlePlaceExternalReferenceRepository {
  constructor(private readonly database: PlaceExternalReferenceDatabase = getDatabase()) {}

  async findByExternalIdentity(
    provider: string,
    externalId: string,
  ): Promise<PersistedPlaceExternalReference | null> {
    const [row] = await this.database
      .select()
      .from(placeExternalReferences)
      .where(
        and(
          eq(placeExternalReferences.provider, provider),
          eq(placeExternalReferences.externalId, externalId),
        ),
      )
      .limit(1);

    return row ? mapReference(row) : null;
  }

  async create(
    input: PersistPlaceExternalReferenceInput,
  ): Promise<PersistedPlaceExternalReference> {
    const now = input.now ?? new Date();
    const [row] = await this.database
      .insert(placeExternalReferences)
      .values({
        id: randomUUID(),
        placeId: input.placeId,
        provider: input.provider.trim(),
        externalId: input.externalId.trim(),
        sourceLicense: input.sourceLicense.trim(),
        sourceUrl: input.sourceUrl?.trim() || null,
        collectedAt: input.collectedAt,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!row) throw new Error("A referência externa não foi persistida.");
    return mapReference(row);
  }
}
