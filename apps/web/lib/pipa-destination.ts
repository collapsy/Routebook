import type { Destination } from "@routebook/trip-management";

export function isPipaDestination(destination: Pick<Destination, "name">): boolean {
  return /\bpipa\b/i.test(destination.name.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
}
