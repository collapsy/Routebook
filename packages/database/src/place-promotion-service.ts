import { createHash, randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";

import {
  createPlace,
  reconcileExternalPlaceCandidate,
  type ExternalPlaceCandidate,
  type Place,
} from "@routebook/place-catalog";

import { getDatabase } from "./client";
import { placeExternalReferences, places } from "./schema";

export class PlacePromotionServiceError extends Error {
  constructor(
    message: string,
    readonly code:
      "candidate-rejected" | "possible-match" | "linked-place-not-found" | "destination-conflict",
    readonly matchedPlaceId?: string,
  ) {
    super(message);
    this.name = "PlacePromotionServiceError";
  }
}

export type PromoteExternalPlaceCandidateInput = Readonly<{
  destinationId: string;
  candidate: ExternalPlaceCandidate;
  promotedAt?: Date;
}>;

export type PromoteExternalPlaceCandidateResult = Readonly<{
  status: "created" | "existing";
  placeId: string;
  slug: string;
  publicationStatus: Place["publicationStatus"];
}>;

type PlaceRow = typeof places.$inferSelect;

function rowForReconciliation(row: PlaceRow): Place {
  return {
    id: row.id,
    destinationId: row.destinationId,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    category: row.category as Place["category"],
    latitude: row.latitude,
    longitude: row.longitude,
    ...(row.addressLabel ? { addressLabel: row.addressLabel } : {}),
    ...(row.priceRange ? { priceRange: row.priceRange as NonNullable<Place["priceRange"]> } : {}),
    publicationStatus: row.publicationStatus as Place["publicationStatus"],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function slugBase(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

function externalIdentitySuffix(candidate: ExternalPlaceCandidate): string {
  return createHash("sha256")
    .update(`${candidate.provider}:${candidate.externalId}`)
    .digest("hex")
    .slice(0, 8);
}

function promotionSlug(
  candidate: ExternalPlaceCandidate,
  existingSlugs: ReadonlySet<string>,
): string {
  const base = slugBase(candidate.name) || "lugar";
  if (!existingSlugs.has(base)) return base;
  return `${base.slice(0, 150)}-${externalIdentitySuffix(candidate)}`;
}

function technicalSummary(candidate: ExternalPlaceCandidate): string {
  return `Lugar descoberto via ${candidate.provider}; informações editoriais ainda não foram curadas pelo RouteBook.`;
}

export async function promoteExternalPlaceCandidate(
  input: PromoteExternalPlaceCandidateInput,
): Promise<PromoteExternalPlaceCandidateResult> {
  const destinationId = input.destinationId.trim();
  const promotedAt = input.promotedAt ?? new Date();

  if (!destinationId) {
    throw new PlacePromotionServiceError(
      "O destino da promoção é obrigatório.",
      "candidate-rejected",
    );
  }

  return getDatabase().transaction(async (transaction) => {
    const [linkedReference] = await transaction
      .select()
      .from(placeExternalReferences)
      .where(
        and(
          eq(placeExternalReferences.provider, input.candidate.provider),
          eq(placeExternalReferences.externalId, input.candidate.externalId),
        ),
      )
      .limit(1);

    if (linkedReference) {
      const [linkedPlace] = await transaction
        .select()
        .from(places)
        .where(eq(places.id, linkedReference.placeId))
        .limit(1);
      if (!linkedPlace) {
        throw new PlacePromotionServiceError(
          "A referência externa aponta para um Place inexistente.",
          "linked-place-not-found",
          linkedReference.placeId,
        );
      }
      if (linkedPlace.destinationId !== destinationId) {
        throw new PlacePromotionServiceError(
          "A identidade externa já pertence a outro Destination.",
          "destination-conflict",
          linkedPlace.id,
        );
      }
      return {
        status: "existing",
        placeId: linkedPlace.id,
        slug: linkedPlace.slug,
        publicationStatus: linkedPlace.publicationStatus as Place["publicationStatus"],
      };
    }

    const destinationRows = await transaction
      .select()
      .from(places)
      .where(eq(places.destinationId, destinationId));
    const reconciliation = reconcileExternalPlaceCandidate(
      input.candidate,
      destinationRows.map(rowForReconciliation),
    );

    if (reconciliation.status === "rejected") {
      throw new PlacePromotionServiceError(reconciliation.reason, "candidate-rejected");
    }
    if (reconciliation.status === "possible_match") {
      throw new PlacePromotionServiceError(
        reconciliation.reason,
        "possible-match",
        reconciliation.matchedPlaceId,
      );
    }
    if (reconciliation.status === "linked") {
      throw new PlacePromotionServiceError(
        "A reconciliação retornou vínculo sem referência persistida.",
        "linked-place-not-found",
        reconciliation.matchedPlaceId,
      );
    }

    const category = input.candidate.category;
    if (!category) {
      throw new PlacePromotionServiceError(
        "O candidato não possui categoria canônica para promoção.",
        "candidate-rejected",
      );
    }

    const slug = promotionSlug(input.candidate, new Set(destinationRows.map((row) => row.slug)));
    const place = createPlace(
      {
        destinationId,
        slug,
        name: input.candidate.name,
        summary: technicalSummary(input.candidate),
        category,
        latitude: input.candidate.latitude,
        longitude: input.candidate.longitude,
        ...(input.candidate.addressLabel ? { addressLabel: input.candidate.addressLabel } : {}),
        publicationStatus: "draft",
      },
      promotedAt,
    );

    await transaction.insert(places).values({
      id: place.id,
      destinationId: place.destinationId,
      slug: place.slug,
      name: place.name,
      summary: place.summary,
      category: place.category,
      latitude: place.latitude,
      longitude: place.longitude,
      addressLabel: place.addressLabel ?? null,
      priceRange: null,
      primaryImage: null,
      publicationStatus: place.publicationStatus,
      createdAt: place.createdAt,
      updatedAt: place.updatedAt,
    });

    await transaction.insert(placeExternalReferences).values({
      id: randomUUID(),
      placeId: place.id,
      provider: input.candidate.provider.trim(),
      externalId: input.candidate.externalId.trim(),
      sourceLicense: input.candidate.sourceLicense.trim(),
      sourceUrl: input.candidate.sourceUrl?.trim() || null,
      collectedAt: input.candidate.collectedAt,
      createdAt: promotedAt,
      updatedAt: promotedAt,
    });

    return {
      status: "created",
      placeId: place.id,
      slug: place.slug,
      publicationStatus: place.publicationStatus,
    };
  });
}
