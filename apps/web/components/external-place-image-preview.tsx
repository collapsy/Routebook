"use client";

import { useEffect, useRef, useState } from "react";

import type { PlaceCategory } from "@routebook/place-catalog";

import { CategoryIllustration } from "./category-illustration";
import { PlacePrimaryImage } from "./place-primary-image";
import styles from "./place-primary-image.module.css";

type WikimediaPreviewData = Readonly<{
  provider?: "wikimedia-commons";
  previewUrl: string;
  sourceUrl: string;
  sourceName: "Wikimedia Commons";
  license: string;
  licenseUrl?: string;
  attribution: string;
  altText: string;
  matchEvidence: string;
}>;

type GoogleAuthorAttribution = Readonly<{
  displayName: string;
  uri?: string;
}>;

type GooglePreviewData = Readonly<{
  provider: "google-places";
  mediaUrl: string;
  sourceUrl?: string;
  sourceName: "Google Maps";
  authorAttributions: readonly GoogleAuthorAttribution[];
  altText: string;
  matchEvidence: string;
}>;

type ExternalPlaceImagePreviewData = WikimediaPreviewData | GooglePreviewData;

type PreviewState =
  | Readonly<{ status: "idle" | "loading" }>
  | Readonly<{ status: "ready"; preview: ExternalPlaceImagePreviewData }>
  | Readonly<{ status: "fallback" }>;

function isAllowedWikimediaPreviewUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "upload.wikimedia.org" &&
      url.pathname.startsWith("/wikipedia/commons/thumb/")
    );
  } catch {
    return false;
  }
}

function isAllowedWikimediaSourceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "commons.wikimedia.org";
  } catch {
    return false;
  }
}

function isAllowedGoogleUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "maps.google.com" || url.hostname === "www.google.com")
    );
  } catch {
    return false;
  }
}

function isAllowedGoogleMediaUrl(value: string): boolean {
  try {
    const url = new URL(value, "https://routebook.local");
    return (
      url.origin === "https://routebook.local" &&
      url.pathname === "/api/place-image-preview/google" &&
      Boolean(url.searchParams.get("token"))
    );
  } catch {
    return false;
  }
}

function isGoogleAttributions(value: unknown): value is readonly GoogleAuthorAttribution[] {
  if (!Array.isArray(value)) return false;
  return value.every((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const candidate = entry as Partial<GoogleAuthorAttribution>;
    return (
      typeof candidate.displayName === "string" &&
      candidate.displayName.length > 0 &&
      (candidate.uri === undefined ||
        (typeof candidate.uri === "string" && isAllowedGoogleUrl(candidate.uri)))
    );
  });
}

function isPreviewData(value: unknown): value is ExternalPlaceImagePreviewData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;

  if (candidate.provider === "google-places") {
    return (
      candidate.sourceName === "Google Maps" &&
      typeof candidate.mediaUrl === "string" &&
      isAllowedGoogleMediaUrl(candidate.mediaUrl) &&
      isGoogleAttributions(candidate.authorAttributions) &&
      (candidate.sourceUrl === undefined ||
        (typeof candidate.sourceUrl === "string" && isAllowedGoogleUrl(candidate.sourceUrl))) &&
      typeof candidate.altText === "string" &&
      candidate.altText.length > 0 &&
      typeof candidate.matchEvidence === "string" &&
      candidate.matchEvidence.length > 0
    );
  }

  return (
    typeof candidate.previewUrl === "string" &&
    isAllowedWikimediaPreviewUrl(candidate.previewUrl) &&
    typeof candidate.sourceUrl === "string" &&
    isAllowedWikimediaSourceUrl(candidate.sourceUrl) &&
    candidate.sourceName === "Wikimedia Commons" &&
    typeof candidate.license === "string" &&
    candidate.license.length > 0 &&
    typeof candidate.attribution === "string" &&
    candidate.attribution.length > 0 &&
    typeof candidate.altText === "string" &&
    candidate.altText.length > 0 &&
    typeof candidate.matchEvidence === "string" &&
    candidate.matchEvidence.length > 0
  );
}

function buildPreviewEndpoint(
  input: Readonly<{
    destinationId: string;
    name: string;
    latitude: number;
    longitude: number;
    category?: PlaceCategory;
    googlePlaceId?: string;
  }>,
): string {
  const query = new URLSearchParams({
    destinationId: input.destinationId,
    name: input.name,
    latitude: String(input.latitude),
    longitude: String(input.longitude),
  });
  if (input.category) query.set("category", input.category);
  if (input.googlePlaceId) query.set("googlePlaceId", input.googlePlaceId);
  return `/api/place-image-preview?${query}`;
}

function buildWikimediaImageProxyEndpoint(previewUrl: string): string {
  const query = new URLSearchParams({ url: previewUrl });
  return `/api/place-image-preview/file?${query}`;
}

export function ExternalPlaceImagePreview({
  destinationId,
  placeName,
  latitude,
  longitude,
  category,
  googlePlaceId,
}: Readonly<{
  destinationId?: string | undefined;
  placeName: string;
  latitude: number;
  longitude: number;
  category?: PlaceCategory | undefined;
  googlePlaceId?: string | undefined;
}>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<PreviewState>({ status: "idle" });

  useEffect(() => {
    const target = containerRef.current;
    if (!target || state.status !== "idle" || !destinationId) return;

    if (typeof IntersectionObserver === "undefined") {
      const timer = setTimeout(() => setState({ status: "loading" }), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState({ status: "loading" });
          observer.disconnect();
        }
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [destinationId, state.status]);

  useEffect(() => {
    if (state.status !== "loading" || !destinationId) return;

    const controller = new AbortController();

    void fetch(
      buildPreviewEndpoint({
        destinationId,
        name: placeName,
        latitude,
        longitude,
        ...(category ? { category } : {}),
        ...(googlePlaceId ? { googlePlaceId } : {}),
      }),
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (response.status === 404) return undefined;
        if (!response.ok) throw new Error(`Prévia externa respondeu ${response.status}.`);
        return (await response.json()) as unknown;
      })
      .then((payload) => {
        if (payload && isPreviewData(payload)) {
          setState({ status: "ready", preview: payload });
          return;
        }
        setState({ status: "fallback" });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ status: "fallback" });
      });

    return () => controller.abort();
  }, [category, destinationId, googlePlaceId, latitude, longitude, placeName, state.status]);

  if (state.status === "ready") {
    const { preview } = state;

    if (preview.provider === "google-places") {
      return (
        <div
          data-external-place-image-provider="google-places"
          data-external-place-image-state="ready"
          ref={containerRef}
        >
          <figure className={styles.figure}>
            <div className={styles.frame}>
              {/* A URL é interna ao RouteBook; API key e photo name permanecem server-side. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={preview.altText}
                className={styles.image}
                decoding="async"
                loading="lazy"
                onError={() => setState({ status: "fallback" })}
                src={preview.mediaUrl}
              />
            </div>
            <figcaption className={styles.caption}>
              <span>
                Foto externa: {preview.sourceName}
                {preview.authorAttributions.length > 0
                  ? ` · Crédito: ${preview.authorAttributions
                      .map((attribution) => attribution.displayName)
                      .join(", ")}`
                  : ""}
                .
              </span>{" "}
              {preview.sourceUrl ? (
                <a href={preview.sourceUrl} rel="noreferrer" target="_blank">
                  Ver no Google Maps
                </a>
              ) : null}
            </figcaption>
          </figure>
        </div>
      );
    }

    return (
      <div
        data-external-place-image-provider="wikimedia-commons"
        data-external-place-image-state="ready"
        ref={containerRef}
      >
        <figure className={styles.figure}>
          <div className={styles.frame}>
            {/* The browser receives a RouteBook URL; the server proxy validates the Wikimedia thumbnail. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={preview.altText}
              className={styles.image}
              decoding="async"
              loading="lazy"
              onError={() => setState({ status: "fallback" })}
              src={buildWikimediaImageProxyEndpoint(preview.previewUrl)}
            />
          </div>
          <figcaption className={styles.caption}>
            <span>
              Foto externa: {preview.attribution} · {preview.license} · {preview.sourceName}.
            </span>{" "}
            <a href={preview.sourceUrl} rel="noreferrer" target="_blank">
              Ver fonte
            </a>
          </figcaption>
        </figure>
      </div>
    );
  }

  if (state.status === "idle" || state.status === "loading") {
    const isLoading = state.status === "loading";
    return (
      <div data-external-place-image-state={state.status} ref={containerRef}>
        <CategoryIllustration
          ariaLabel={
            isLoading
              ? `Buscando fotografia verificada para ${placeName}`
              : `Fotografia sob demanda para ${placeName}`
          }
          disclosure="Ilustração de categoria enquanto a foto real é verificada."
          eyebrow="Descoberta externa"
          kind={category ?? "place"}
          label={isLoading ? "Buscando fotografia…" : "Fotografia sob demanda"}
          live
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} data-external-place-image-state="fallback">
      <PlacePrimaryImage category={category} placeName={placeName} />
    </div>
  );
}
