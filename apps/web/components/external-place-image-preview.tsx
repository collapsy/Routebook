"use client";

import { useEffect, useRef, useState } from "react";

import type { PlaceCategory } from "@routebook/place-catalog";

import { PlacePrimaryImage } from "./place-primary-image";
import styles from "./place-primary-image.module.css";

type ExternalPlaceImagePreviewData = Readonly<{
  previewUrl: string;
  sourceUrl: string;
  sourceName: string;
  license: string;
  licenseUrl?: string;
  attribution: string;
  altText: string;
  matchEvidence: string;
}>;

type PreviewState =
  | Readonly<{ status: "idle" | "loading" }>
  | Readonly<{ status: "ready"; preview: ExternalPlaceImagePreviewData }>
  | Readonly<{ status: "fallback" }>;

function isAllowedPreviewUrl(value: string): boolean {
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

function isAllowedSourceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "commons.wikimedia.org";
  } catch {
    return false;
  }
}

function isPreviewData(value: unknown): value is ExternalPlaceImagePreviewData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ExternalPlaceImagePreviewData>;
  return (
    typeof candidate.previewUrl === "string" &&
    isAllowedPreviewUrl(candidate.previewUrl) &&
    typeof candidate.sourceUrl === "string" &&
    isAllowedSourceUrl(candidate.sourceUrl) &&
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
  }>,
): string {
  const query = new URLSearchParams({
    destinationId: input.destinationId,
    name: input.name,
    latitude: String(input.latitude),
    longitude: String(input.longitude),
  });
  return `/api/place-image-preview?${query}`;
}

function buildImageProxyEndpoint(previewUrl: string): string {
  const query = new URLSearchParams({ url: previewUrl });
  return `/api/place-image-preview/file?${query}`;
}

export function ExternalPlaceImagePreview({
  destinationId,
  placeName,
  latitude,
  longitude,
  category,
}: Readonly<{
  destinationId?: string | undefined;
  placeName: string;
  latitude: number;
  longitude: number;
  category?: PlaceCategory | undefined;
}>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<PreviewState>({ status: "idle" });

  useEffect(() => {
    const target = containerRef.current;
    if (!target || state.status !== "idle" || !destinationId) return;

    if (!("IntersectionObserver" in window)) {
      const timer = window.setTimeout(() => setState({ status: "loading" }), 0);
      return () => window.clearTimeout(timer);
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
  }, [destinationId, latitude, longitude, placeName, state.status]);

  if (state.status === "ready") {
    const { preview } = state;
    return (
      <div ref={containerRef} data-external-place-image-state="ready">
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
              src={buildImageProxyEndpoint(preview.previewUrl)}
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
    return (
      <div
        aria-label={`Buscando fotografia licenciada para ${placeName}`}
        aria-live="polite"
        className={styles.fallback}
        data-external-place-image-state={state.status}
        ref={containerRef}
        role="status"
      >
        <span aria-hidden="true" className={styles.fallbackMark}>
          ◇
        </span>
        <span className={styles.fallbackCategory}>Descoberta externa</span>
        <span className={styles.fallbackText}>
          {state.status === "loading" ? "Buscando fotografia…" : "Fotografia sob demanda"}
        </span>
        <span className={styles.fallbackDisclosure}>
          A foto só aparece quando a identidade e a licença forem verificadas.
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} data-external-place-image-state="fallback">
      <PlacePrimaryImage category={category} placeName={placeName} />
    </div>
  );
}
