"use client";

import Image from "next/image";
import { useState } from "react";

import type {
  PlaceCategory,
  PlacePrimaryImage as PlacePrimaryImageContract,
} from "@routebook/place-catalog";

import styles from "./place-primary-image.module.css";

export function PlacePrimaryImage({
  placeName,
  primaryImage,
  category: _category,
  showProvenance = false,
  priority = false,
  compactFallback = true,
}: {
  placeName: string;
  primaryImage?: PlacePrimaryImageContract | undefined;
  category?: PlaceCategory | undefined;
  showProvenance?: boolean;
  priority?: boolean;
  compactFallback?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!primaryImage || failed) {
    return (
      <div
        aria-label={`Foto não disponível para ${placeName}`}
        className={styles.noPhoto}
        data-place-image-fallback="true"
        data-presentation={compactFallback ? "compact" : "descriptive"}
        role="img"
      >
        <span>{compactFallback ? "Sem foto" : "Foto não disponível"}</span>
      </div>
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
