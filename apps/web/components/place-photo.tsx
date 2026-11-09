"use client";

import type { ComponentProps } from "react";

import { ExternalPlaceImagePreview } from "./external-place-image-preview";
import { PlacePrimaryImage } from "./place-primary-image";

type Props = ComponentProps<typeof PlacePrimaryImage> & {
  latitude: number;
  longitude: number;
  destinationId?: string | undefined;
  googlePlaceId?: string | undefined;
};

export function PlacePhoto(props: Props) {
  const fallback = (
    <ExternalPlaceImagePreview
      placeName={props.placeName}
      latitude={props.latitude}
      longitude={props.longitude}
      category={props.category}
      destinationId={props.destinationId
        ?.normalize("NFKC")
        .replace(/[^\p{L}\p{N}\s._-]+/gu, " ")
        .replace(/\s+/g, " ")
        .trim()}
      googlePlaceId={props.googlePlaceId}
      compactFallback={props.compactFallback}
    />
  );
  return (
    <PlacePrimaryImage
      key={props.primaryImage?.assetPath ?? "external"}
      {...props}
      fallback={fallback}
    />
  );
}
