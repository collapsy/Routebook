"use client";

import { ProductErrorState } from "@/components/product-error-state";

export default function TripsError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <div className="product-state-page">
      <ProductErrorState onRetry={reset} />
    </div>
  );
}
