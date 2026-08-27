import {
  isStrongExternalPlaceIdentityMatch,
  placeDistanceMeters,
  type ExternalPlaceCandidate,
  type ExternalPlaceReconciliation,
  type Place,
} from "@routebook/place-catalog";

export type PlaceDiscoveryReference = Readonly<{
  latitude: number;
  longitude: number;
}>;

export type PublishedPlaceDiscoveryItem = Readonly<{
  id: string;
  kind: "published";
  place: Place;
  distanceMeters: number;
}>;

export type EnrichedPlaceDiscoveryItem = Readonly<{
  id: string;
  kind: "enriched";
  place: Place;
  candidate: ExternalPlaceCandidate;
  matchKind: "linked" | "strong";
  distanceMeters: number;
}>;

export type ExternalPlaceDiscoveryItem = Readonly<{
  id: string;
  kind: "external";
  candidate: ExternalPlaceCandidate;
  distanceMeters: number;
}>;

export type PlaceDiscoveryItem =
  PublishedPlaceDiscoveryItem | EnrichedPlaceDiscoveryItem | ExternalPlaceDiscoveryItem;

type CandidateMatch = Readonly<{
  candidate: ExternalPlaceCandidate;
  matchKind: "linked" | "strong";
}>;

const IDENTITY_STOP_WORDS = new Set([
  "a",
  "as",
  "da",
  "das",
  "de",
  "do",
  "dos",
  "e",
  "em",
  "na",
  "nas",
  "no",
  "nos",
  "o",
  "os",
  "para",
  "por",
  "um",
  "uma",
]);

const REGIONAL_IDENTITY_TOKENS = new Set([
  "brasil",
  "brazil",
  "grande",
  "norte",
  "pipa",
  "rio",
  "rn",
  "sul",
  "tibau",
]);

const GENERIC_IDENTITY_TOKENS = new Set([
  "bar",
  "beach",
  "cafe",
  "cafeteria",
  "club",
  "clube",
  "hotel",
  "mirante",
  "pousada",
  "praia",
  "restaurant",
  "restaurante",
]);

const BEACH_IDENTITY_DESCRIPTORS = new Set(["baia", "bahia", "beach", "playa", "praia"]);
const BEACH_ALIAS_MAX_DISTANCE_METERS = 10_000;

function itemName(item: PlaceDiscoveryItem): string {
  return item.kind === "external" ? item.candidate.name : item.place.name;
}

function itemKindOrder(item: PlaceDiscoveryItem): number {
  switch (item.kind) {
    case "enriched":
      return 0;
    case "published":
      return 1;
    case "external":
      return 2;
  }
}

function compareDiscoveryItems(left: PlaceDiscoveryItem, right: PlaceDiscoveryItem): number {
  const byDistance = left.distanceMeters - right.distanceMeters;
  if (byDistance) return byDistance;

  const byKind = itemKindOrder(left) - itemKindOrder(right);
  if (byKind) return byKind;

  return itemName(left).localeCompare(itemName(right), "pt-BR") || left.id.localeCompare(right.id);
}

function externalCandidateKey(candidate: ExternalPlaceCandidate): string {
  return `${candidate.provider}:${candidate.externalId}`;
}

function normalizeIdentity(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizedNameTokens(value: string): string[] {
  return normalizeIdentity(value).split(" ").filter(Boolean);
}

function identityTokens(value: string): string[] {
  return normalizedNameTokens(value).filter(
    (token) => !IDENTITY_STOP_WORDS.has(token) && !REGIONAL_IDENTITY_TOKENS.has(token),
  );
}

function beachIdentityTokens(value: string): string[] {
  const segments = value
    .split(/[,/\-–—]+/)
    .map(normalizeIdentity)
    .filter(Boolean);
  const selectedSegment =
    segments.find((segment) =>
      normalizedNameTokens(segment).some((token) => BEACH_IDENTITY_DESCRIPTORS.has(token)),
    ) ??
    segments[0] ??
    normalizeIdentity(value);

  return normalizedNameTokens(selectedSegment).filter(
    (token) =>
      !IDENTITY_STOP_WORDS.has(token) &&
      !BEACH_IDENTITY_DESCRIPTORS.has(token) &&
      !GENERIC_IDENTITY_TOKENS.has(token) &&
      !(token.length === 2 && /^[a-z]{2}$/.test(token)),
  );
}

function tokenEditDistance(first: string, second: string): number {
  const previous = Array.from({ length: second.length + 1 }, (_, index) => index);
  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    const current = [firstIndex];
    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      current[secondIndex] = Math.min(
        (current[secondIndex - 1] ?? 0) + 1,
        (previous[secondIndex] ?? 0) + 1,
        (previous[secondIndex - 1] ?? 0) +
          (first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[second.length] ?? Number.POSITIVE_INFINITY;
}

function haveEquivalentBeachIdentityNames(first: string, second: string): boolean {
  const firstTokens = beachIdentityTokens(first);
  const secondTokens = beachIdentityTokens(second);
  if (firstTokens.length === 0 || secondTokens.length === 0) return false;

  if (
    firstTokens.length === secondTokens.length &&
    firstTokens.every((token, index) => token === secondTokens[index])
  ) {
    return true;
  }

  if (firstTokens.length === 1 && secondTokens.length === 1) {
    const [firstToken] = firstTokens;
    const [secondToken] = secondTokens;
    if (!firstToken || !secondToken || Math.min(firstToken.length, secondToken.length) < 6) {
      return false;
    }
    return tokenEditDistance(firstToken, secondToken) <= 2;
  }

  return false;
}

function candidatesRepresentSamePlace(
  first: ExternalPlaceCandidate,
  second: ExternalPlaceCandidate,
): boolean {
  if (first.provider === second.provider && first.externalId === second.externalId) return true;
  if (!first.category || first.category !== second.category) return false;

  const distanceMeters = placeDistanceMeters(first, second);
  if (
    first.category === "beach" &&
    distanceMeters <= BEACH_ALIAS_MAX_DISTANCE_METERS &&
    haveEquivalentBeachIdentityNames(first.name, second.name)
  ) {
    return true;
  }
  if (distanceMeters > 500) return false;

  if (normalizeIdentity(first.name) === normalizeIdentity(second.name)) return true;
  if (
    first.addressLabel &&
    second.addressLabel &&
    normalizeIdentity(first.addressLabel) === normalizeIdentity(second.addressLabel)
  ) {
    return true;
  }

  const firstTokens = identityTokens(first.name);
  const secondTokens = identityTokens(second.name);
  if (firstTokens.length === 0 || secondTokens.length === 0) return false;

  const secondSet = new Set(secondTokens);
  const shared = [...new Set(firstTokens.filter((token) => secondSet.has(token)))];
  const distinctiveShared = shared.filter(
    (token) => token.length >= 4 && !GENERIC_IDENTITY_TOKENS.has(token),
  );
  if (distinctiveShared.length === 0) return false;

  const minimumTokenCount = Math.min(firstTokens.length, secondTokens.length);
  const unionTokenCount = new Set([...firstTokens, ...secondTokens]).size;
  const minimumCoverage = shared.length / minimumTokenCount;
  const jaccard = shared.length / unionTokenCount;

  return (
    (shared.length >= 2 && minimumCoverage >= 0.8 && jaccard >= 0.5) ||
    (distanceMeters <= 150 && minimumTokenCount === 1 && shared.length === 1)
  );
}

function compareCandidatePreference(
  left: ExternalPlaceCandidate,
  right: ExternalPlaceCandidate,
  reference: PlaceDiscoveryReference,
): number {
  const byConfidence = (right.confidence ?? -1) - (left.confidence ?? -1);
  if (byConfidence) return byConfidence;

  const byAddress = Number(Boolean(right.addressLabel)) - Number(Boolean(left.addressLabel));
  if (byAddress) return byAddress;

  const byDistance = placeDistanceMeters(left, reference) - placeDistanceMeters(right, reference);
  if (byDistance) return byDistance;

  return externalCandidateKey(left).localeCompare(externalCandidateKey(right));
}

function comparePlaceCandidatePreference(
  left: CandidateMatch,
  right: CandidateMatch,
  place: Place,
): number {
  const byMatchKind = Number(right.matchKind === "linked") - Number(left.matchKind === "linked");
  if (byMatchKind) return byMatchKind;

  const byConfidence = (right.candidate.confidence ?? -1) - (left.candidate.confidence ?? -1);
  if (byConfidence) return byConfidence;

  const byAddress =
    Number(Boolean(right.candidate.addressLabel)) - Number(Boolean(left.candidate.addressLabel));
  if (byAddress) return byAddress;

  const byDistance =
    placeDistanceMeters(left.candidate, place) - placeDistanceMeters(right.candidate, place);
  if (byDistance) return byDistance;

  return externalCandidateKey(left.candidate).localeCompare(externalCandidateKey(right.candidate));
}

function normalizeReconciliations(
  input: Readonly<{
    externalCandidates?: readonly ExternalPlaceCandidate[];
    externalReconciliations?: readonly ExternalPlaceReconciliation[];
  }>,
): readonly ExternalPlaceReconciliation[] {
  if (input.externalReconciliations) return input.externalReconciliations;
  return (input.externalCandidates ?? []).map((candidate) => ({
    candidate,
    status: "new" as const,
    reason: "Candidato fornecido diretamente à projeção de Discovery.",
  }));
}

export function buildPlaceDiscoveryFeed(
  input: Readonly<{
    publishedPlaces: readonly Place[];
    externalCandidates?: readonly ExternalPlaceCandidate[];
    externalReconciliations?: readonly ExternalPlaceReconciliation[];
    reference: PlaceDiscoveryReference;
    externalLimit?: number;
  }>,
): PlaceDiscoveryItem[] {
  if (
    input.externalLimit !== undefined &&
    (!Number.isInteger(input.externalLimit) || input.externalLimit < 0)
  ) {
    throw new RangeError("O limite de Places externos deve ser um inteiro não negativo.");
  }

  const placesById = new Map(input.publishedPlaces.map((place) => [place.id, place]));
  const candidateMatchesByPlaceId = new Map<string, CandidateMatch[]>();
  const externalCandidates: ExternalPlaceCandidate[] = [];

  const addPlaceMatch = (place: Place, match: CandidateMatch) => {
    const matches = candidateMatchesByPlaceId.get(place.id) ?? [];
    matches.push(match);
    candidateMatchesByPlaceId.set(place.id, matches);
  };

  for (const reconciliation of normalizeReconciliations(input)) {
    if (reconciliation.status === "rejected") continue;

    if (reconciliation.status === "linked" && reconciliation.matchedPlaceId) {
      const linkedPlace = placesById.get(reconciliation.matchedPlaceId);
      if (linkedPlace) {
        addPlaceMatch(linkedPlace, {
          candidate: reconciliation.candidate,
          matchKind: "linked",
        });
      }
      continue;
    }

    if (reconciliation.status === "possible_match") {
      const possiblePlace = reconciliation.matchedPlaceId
        ? placesById.get(reconciliation.matchedPlaceId)
        : undefined;
      if (
        possiblePlace &&
        isStrongExternalPlaceIdentityMatch(reconciliation.candidate, possiblePlace)
      ) {
        addPlaceMatch(possiblePlace, {
          candidate: reconciliation.candidate,
          matchKind: "strong",
        });
      }
      // Possible matches without strong identity remain withheld rather than becoming duplicate cards.
      continue;
    }

    const strongPlace = input.publishedPlaces
      .filter((place) => isStrongExternalPlaceIdentityMatch(reconciliation.candidate, place))
      .sort(
        (left, right) =>
          placeDistanceMeters(reconciliation.candidate, left) -
          placeDistanceMeters(reconciliation.candidate, right),
      )[0];

    if (strongPlace) {
      addPlaceMatch(strongPlace, {
        candidate: reconciliation.candidate,
        matchKind: "strong",
      });
    } else {
      externalCandidates.push(reconciliation.candidate);
    }
  }

  const canonicalItems: Array<PublishedPlaceDiscoveryItem | EnrichedPlaceDiscoveryItem> =
    input.publishedPlaces.map((place) => {
      const matches = candidateMatchesByPlaceId.get(place.id);
      if (!matches || matches.length === 0) {
        return {
          id: `published:${place.id}`,
          kind: "published" as const,
          place,
          distanceMeters: placeDistanceMeters(place, input.reference),
        };
      }

      const selected = [...matches].sort((left, right) =>
        comparePlaceCandidatePreference(left, right, place),
      )[0]!;
      return {
        id: `published:${place.id}`,
        kind: "enriched" as const,
        place,
        candidate: selected.candidate,
        matchKind: selected.matchKind,
        distanceMeters: placeDistanceMeters(selected.candidate, input.reference),
      };
    });

  const externalRepresentatives: ExternalPlaceCandidate[] = [];
  for (const candidate of [...externalCandidates].sort((left, right) =>
    compareCandidatePreference(left, right, input.reference),
  )) {
    const duplicateIndex = externalRepresentatives.findIndex((representative) =>
      candidatesRepresentSamePlace(candidate, representative),
    );
    if (duplicateIndex < 0) {
      externalRepresentatives.push(candidate);
      continue;
    }

    const current = externalRepresentatives[duplicateIndex]!;
    if (compareCandidatePreference(candidate, current, input.reference) < 0) {
      externalRepresentatives[duplicateIndex] = candidate;
    }
  }

  const allExternalItems = externalRepresentatives
    .map<ExternalPlaceDiscoveryItem>((candidate) => ({
      id: `external:${candidate.provider}:${candidate.externalId}`,
      kind: "external",
      candidate,
      distanceMeters: placeDistanceMeters(candidate, input.reference),
    }))
    .sort(compareDiscoveryItems);
  const externalItems =
    input.externalLimit === undefined
      ? allExternalItems
      : allExternalItems.slice(0, input.externalLimit);

  return [...canonicalItems, ...externalItems].sort(compareDiscoveryItems);
}
