"use client";

import Image from "next/image";
import { useState } from "react";

import type { PlacePrimaryImage as PlacePrimaryImageContract } from "@routebook/place-catalog";

import styles from "./place-primary-image.module.css";

export function PlacePrimaryImage({
  placeName,
  primaryImage,
  showProvenance = false,
  priority = false,
}: {
  placeName: string;
  primaryImage?: PlacePrimaryImageContract | undefined;
  showProvenance?: boolean;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!primaryImage || failed) {
    return (
      <div
        aria-label={`Imagem não disponível para ${placeName}`}
        className={styles.fallback}
        data-place-image-fallback="true"
        role="img"
      >
        <span aria-hidden="true" className={styles.fallbackMark}>
          ◇
        </span>
        <span className={styles.fallbackText}>Imagem não disponível</span>
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
