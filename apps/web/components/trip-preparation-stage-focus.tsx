"use client";

import { useEffect } from "react";

type TripPreparationStageFocusProps = Readonly<{
  active: boolean;
  stage: string;
  targetId: string;
}>;

export function TripPreparationStageFocus({
  active,
  stage,
  targetId,
}: TripPreparationStageFocusProps) {
  useEffect(() => {
    if (!active) return;

    const heading = document.getElementById(targetId);
    if (!(heading instanceof HTMLElement)) return;

    heading.focus({ preventScroll: true });
    heading.scrollIntoView?.({ block: "start", inline: "nearest", behavior: "auto" });
  }, [active, stage, targetId]);

  return null;
}
