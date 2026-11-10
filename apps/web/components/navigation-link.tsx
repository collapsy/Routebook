"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";

import styles from "./navigation-link.module.css";

function NavigationFeedback({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  return (
    <span
      role={pending ? "status" : undefined}
      aria-live="polite"
      className={pending ? styles.message : styles.silent}
    >
      {pending ? label : ""}
    </span>
  );
}

export function NavigationLink({
  children,
  pendingLabel = "Carregando…",
  ...props
}: ComponentProps<typeof Link> & { pendingLabel?: string }) {
  return (
    <Link {...props}>
      {children}
      <NavigationFeedback label={pendingLabel} />
    </Link>
  );
}
