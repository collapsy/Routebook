"use client";

import Image from "next/image";
import { useState } from "react";

import type {
  PlaceCategory,
  PlacePrimaryImage as PlacePrimaryImageContract,
} from "@routebook/place-catalog";

import { CategoryIllustration } from "./category-illustration";
import styles from "./place-primary-image.module.css";

const categoryLabels: Record<PlaceCategory, string> = {
  beach: "Praia",
  gastronomy: "Gastronomia",
  nature: "Natureza",
  nightlife: "Vida noturna",
};

export function PlacePrimaryImage({
  placeName,
  primaryImage,
  category,
  showProvenance = false,
  priority = false,
}: {
  placeName: string;
  primaryImage?: PlacePrimaryImageContract | undefined;
  category?: PlaceCategory | undefined;
  showProvenance?: boolean;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!primaryImage || failed) {
    const fallbackLabel = category ? categoryLabels[category] : "Lugar";
    return (
      <CategoryIllustration
        ariaLabel={`Ilustração de ${fallbackLabel} para ${placeName} — não é foto do local`}
        eyebrow={fallbackLabel}
        kind={category ?? "place"}
        placeFallback
      />
    );
  }

  return (
    <figure className={styles.figure}>
      <div className={styles.frame}>
        <Image
          alt={primaryImage.altText}
          className={styles.image}
          fill
          onError={() => setFailed(true)}
          priority={priority}
          sizes="(max-width: 42rem) 100vw, (max-width: 70rem) 50vw, 33vw"
          src={primaryImage.assetPath}
        />
      </div>

      {showProvenance ? (
        <figcaption className={styles.caption}>
          <span>
            {primaryImage.attribution ?? `Imagem: ${primaryImage.sourceName}`}. Licença/base de uso:{" "}
            {primaryImage.license}.
          </span>{" "}
          {primaryImage.sourceUrl ? (
            <a href={primaryImage.sourceUrl} rel="noreferrer" target="_blank">
              Ver fonte
            </a>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
