import { isPipaDestination } from "./pipa-destination";

export function resolveCuratedDestinationId(input: {
  destinationName: string;
  placeDestinationIds: readonly (string | null)[];
}): string | undefined {
  const destinationIds = [
    ...new Set(input.placeDestinationIds.filter((id): id is string => id !== null)),
  ];
  if (destinationIds.length === 1) return destinationIds[0];
  if (isPipaDestination({ name: input.destinationName }) && destinationIds.includes("pipa-rn-br")) {
    return "pipa-rn-br";
  }
  return undefined;
}
