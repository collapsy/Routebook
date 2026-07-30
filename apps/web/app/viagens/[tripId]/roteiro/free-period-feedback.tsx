"use client";

import { useSearchParams } from "next/navigation";

export function FreePeriodFeedback() {
  const searchParams = useSearchParams();

  if (searchParams.get("periodoLivreEditado") !== "1") return null;

  return (
    <p className="success-banner" role="status">
      Período livre atualizado no roteiro.
    </p>
  );
}
