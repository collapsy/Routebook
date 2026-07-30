"use client";

import { useSearchParams } from "next/navigation";

export function FreePeriodFeedback() {
  const searchParams = useSearchParams();
  const message =
    searchParams.get("periodoLivreEditado") === "1"
      ? "Período livre atualizado no roteiro."
      : searchParams.get("periodoLivreRemovido") === "1"
        ? "Período livre removido do roteiro."
        : null;

  if (!message) return null;

  return (
    <p className="success-banner" role="status">
      {message}
    </p>
  );
}
