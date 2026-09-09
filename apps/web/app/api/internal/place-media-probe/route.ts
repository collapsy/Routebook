import type { PlaceQualityTarget } from "@routebook/place-catalog";

import { resolveConfiguredGooglePlacePhotoProvider } from "@/lib/google-place-photo";
import { resolveConfiguredPlaceQualityProvider } from "@/lib/place-quality-provider";

export const dynamic = "force-dynamic";

const BRANCH = "codex/rb-inc-190-google-place-photos-current-stack";
const RESPONSE_HEADERS = Object.freeze({
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex",
});

const scenarios = Object.freeze([
  {
    id: "antigua-guatemala",
    label: "Antigua Guatemala",
    targets: Object.freeze([
      {
        id: "antigua-cafe-sky",
        name: "Cafe Sky",
        category: "gastronomy",
        latitude: 14.555487,
        longitude: -90.729565,
      },
      {
        id: "antigua-lava-terrace",
        name: "Lava Terrace",
        category: "nightlife",
        latitude: 14.55781,
        longitude: -90.73345,
      },
    ] satisfies readonly PlaceQualityTarget[]),
  },
  {
    id: "sao-paulo",
    label: "São Paulo",
    targets: Object.freeze([
      {
        id: "sao-paulo-casa-do-porco",
        name: "A Casa do Porco Bar",
        category: "gastronomy",
        latitude: -23.544874,
        longitude: -46.64465,
      },
      {
        id: "sao-paulo-bar-dona-onca",
        name: "Bar da Dona Onça",
        category: "nightlife",
        latitude: -23.5465084,
        longitude: -46.6445317,
      },
    ] satisfies readonly PlaceQualityTarget[]),
  },
] as const);

type ProbeItem = Readonly<{
  name: string;
  category: PlaceQualityTarget["category"];
  qualityMatched: boolean;
  photoReady: boolean;
  mediaReady: boolean;
  attributionCount: number;
  contentType?: string;
}>;

function unavailable(status: string, httpStatus = 503): Response {
  return Response.json({ status }, { status: httpStatus, headers: RESPONSE_HEADERS });
}

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview" || process.env.VERCEL_GIT_COMMIT_REF !== BRANCH) {
    return unavailable("unavailable", 404);
  }

  const qualityProvider = resolveConfiguredPlaceQualityProvider();
  if (qualityProvider.status !== "configured" || qualityProvider.provider !== "google") {
    return unavailable("quality-unavailable");
  }

  const photoProvider = resolveConfiguredGooglePlacePhotoProvider();
  if (photoProvider.status !== "configured") {
    return unavailable("photo-unavailable");
  }

  try {
    const scenarioResults = [];

    for (const scenario of scenarios) {
      const matches = await qualityProvider.port.findSignals(scenario.targets);
      const matchByTarget = new Map(matches.map((match) => [match.targetId, match]));
      const items: ProbeItem[] = [];

      for (const target of scenario.targets) {
        const match = matchByTarget.get(target.id);
        const externalId = match?.signals.externalId;
        const qualityMatched =
          match?.signals.provider === "google-places" && typeof externalId === "string";

        if (!qualityMatched || !externalId) {
          items.push({
            name: target.name,
            category: target.category,
            qualityMatched: false,
            photoReady: false,
            mediaReady: false,
            attributionCount: 0,
          });
          continue;
        }

        let preview;
        try {
          preview = await photoProvider.adapter.findPreview({
            placeId: externalId,
            name: target.name,
            category: target.category,
            latitude: target.latitude,
            longitude: target.longitude,
          });
        } catch {
          preview = undefined;
        }

        if (!preview) {
          items.push({
            name: target.name,
            category: target.category,
            qualityMatched: true,
            photoReady: false,
            mediaReady: false,
            attributionCount: 0,
          });
          continue;
        }

        let media;
        try {
          media = await photoProvider.adapter.fetchMedia(preview.mediaToken);
        } catch {
          media = undefined;
        }

        items.push({
          name: target.name,
          category: target.category,
          qualityMatched: true,
          photoReady: true,
          mediaReady: Boolean(media),
          attributionCount: preview.authorAttributions.length,
          ...(media ? { contentType: media.contentType } : {}),
        });
      }

      scenarioResults.push({
        id: scenario.id,
        label: scenario.label,
        targetCount: items.length,
        qualityMatchCount: items.filter((item) => item.qualityMatched).length,
        photoReadyCount: items.filter((item) => item.photoReady).length,
        mediaReadyCount: items.filter((item) => item.mediaReady).length,
        items,
      });
    }

    return Response.json(
      {
        status: "ok",
        qualityProvider: "google",
        photoProvider: "google",
        targetCount: scenarioResults.reduce((total, scenario) => total + scenario.targetCount, 0),
        qualityMatchCount: scenarioResults.reduce(
          (total, scenario) => total + scenario.qualityMatchCount,
          0,
        ),
        photoReadyCount: scenarioResults.reduce(
          (total, scenario) => total + scenario.photoReadyCount,
          0,
        ),
        mediaReadyCount: scenarioResults.reduce(
          (total, scenario) => total + scenario.mediaReadyCount,
          0,
        ),
        scenarios: scenarioResults,
      },
      { headers: RESPONSE_HEADERS },
    );
  } catch {
    return unavailable("provider-error", 502);
  }
}
