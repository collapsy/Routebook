import { GET } from "../../api/internal/place-quality-probe/route";

export const dynamic = "force-dynamic";

export default async function PlaceQualityProbePage() {
  const response = await GET();
  const payload = (await response.json()) as unknown;

  return <pre>{JSON.stringify(payload, null, 2)}</pre>;
}
