"use client";

import { useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export function DiscoveryFilterForm({
  action,
  className,
  children,
}: {
  action: string;
  className: string | undefined;
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <form
      action={action}
      className={className}
      method="get"
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        if (pending) return;
        const query = new URLSearchParams();
        for (const [key, value] of new FormData(event.currentTarget)) {
          if (typeof value === "string" && value) query.set(key, value);
        }
        startTransition(() => router.push(`${action}?${query.toString()}`, { scroll: false }));
      }}
    >
      {children}
      <button className="product-primary-action" disabled={pending} type="submit">
        {pending ? "Aplicando filtros…" : "Aplicar filtros"}
      </button>
      <span role={pending ? "status" : undefined} aria-live="polite">
        {pending ? "Atualizando a lista de lugares…" : ""}
      </span>
    </form>
  );
}
