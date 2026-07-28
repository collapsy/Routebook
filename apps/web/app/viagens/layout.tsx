import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";

import "./trip-overview.css";

export default function TripsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
