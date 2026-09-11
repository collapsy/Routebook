import Image from "next/image";

import { PLACE_CATEGORIES, type PlaceCategory } from "@routebook/place-catalog";

import styles from "./category-illustration.module.css";

export type CategoryIllustrationKind =
  PlaceCategory | "place" | "sunrise" | "sunset" | "moonrise" | "event";

const illustrationPaths: Record<CategoryIllustrationKind, string> = {
  beach: "/category-illustrations/beach.svg",
  gastronomy: "/category-illustrations/gastronomy.svg",
  nature: "/category-illustrations/nature.svg",
  nightlife: "/category-illustrations/nightlife.svg",
  attraction: "/category-illustrations/attraction.svg",
  viewpoint: "/category-illustrations/viewpoint.svg",
  place: "/category-illustrations/place.svg",
  sunrise: "/category-illustrations/sunrise.svg",
  sunset: "/category-illustrations/sunset.svg",
  moonrise: "/category-illustrations/moonrise.svg",
  event: "/category-illustrations/event.svg",
};

const illustrationLabels: Record<CategoryIllustrationKind, string> = {
  beach: "Praia",
  gastronomy: "Gastronomia",
  nature: "Natureza",
  nightlife: "Vida noturna",
  attraction: "Ponto turístico",
  viewpoint: "Mirante",
  place: "Lugar",
  sunrise: "Nascer do sol",
  sunset: "Pôr do sol",
  moonrise: "Nascer da lua",
  event: "Rolê confirmado",
};

function isPlaceCategory(kind: CategoryIllustrationKind): kind is PlaceCategory {
  return PLACE_CATEGORIES.includes(kind as PlaceCategory);
}

export function CategoryIllustration({
  kind,
  ariaLabel,
  eyebrow,
  label = "Referência visual",
  disclosure = "Ilustração de categoria — não é foto do local",
  live = false,
  placeFallback = false,
  presentation = "descriptive",
}: Readonly<{
  kind: CategoryIllustrationKind;
  ariaLabel: string;
  eyebrow?: string;
  label?: string;
  disclosure?: string;
  live?: boolean;
  placeFallback?: boolean;
  presentation?: "descriptive" | "compact";
}>) {
  return (
    <div
      aria-atomic={live ? "true" : undefined}
      aria-label={ariaLabel}
      aria-live={live ? "polite" : undefined}
      className={styles.visual}
      data-category-illustration={kind}
      data-place-category={isPlaceCategory(kind) ? kind : "unknown"}
      data-place-image-fallback={placeFallback ? "true" : undefined}
      data-presentation={presentation}
      role={live ? "status" : "img"}
    >
      <Image
        alt=""
        aria-hidden="true"
        className={styles.art}
        fill
        sizes="(max-width: 42rem) 100vw, (max-width: 70rem) 50vw, 33vw"
        src={illustrationPaths[kind]}
        unoptimized
      />
      <span aria-hidden="true" className={styles.veil} />
      {presentation === "compact" ? (
        <span aria-hidden="true" className={styles.badge}>
          Imagem ilustrativa
        </span>
      ) : (
        <span className={styles.copy}>
          <span className={styles.eyebrow}>{eyebrow ?? illustrationLabels[kind]}</span>
          <span className={styles.label}>{label}</span>
          <span className={styles.disclosure}>{disclosure}</span>
        </span>
      )}
    </div>
  );
}
