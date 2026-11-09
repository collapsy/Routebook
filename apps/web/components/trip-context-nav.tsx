"use client";

import { useState } from "react";
import { NavigationLink as Link } from "./navigation-link";
import { discoveryQuery, discoveryReturnHref } from "../lib/discovery-navigation";
import { usePathname, useSearchParams } from "next/navigation";

import styles from "./trip-context-nav.module.css";

type TripContextNavProps = Readonly<{
  tripId: string;
}>;

type NavItem = Readonly<{
  href: string;
  label: string;
  match: (pathname: string) => boolean;
}>;

export function TripContextNav({ tripId }: TripContextNavProps) {
  const pathname = usePathname();
  const basePath = `/viagens/${tripId}`;
  const searchParams = useSearchParams();
  const inDetails = pathname.startsWith(`${basePath}/lugares/`);
  const query = discoveryQuery(
    (inDetails ? searchParams.get("retorno") : null) ?? searchParams.toString(),
  );
  const [memory, setMemory] = useState({ tripId, query: "" });
  const exploring = pathname === basePath + "/lugares" || inDetails;
  if (memory.tripId !== tripId || (exploring && memory.query !== query)) {
    setMemory({ tripId, query: exploring ? query : "" });
  }
  const rememberedQuery = memory.tripId === tripId ? memory.query : "";
  const items: NavItem[] = [
    {
      href: `${basePath}/guia`,
      label: "Hoje",
      match: (value: string) => value.startsWith(`${basePath}/guia`),
    },
    {
      href: discoveryReturnHref(tripId, exploring ? query : rememberedQuery),
      label: "Lugares",
      match: (value) =>
        value.startsWith(`${basePath}/lugares`) && !value.startsWith(`${basePath}/lugares-salvos`),
    },
    {
      href: `${basePath}/roteiro`,
      label: "Roteiro",
      match: (value) => value.startsWith(`${basePath}/roteiro`),
    },
    {
      href: `${basePath}/lugares-salvos`,
      label: "Minha seleção",
      match: (value) => value.startsWith(`${basePath}/lugares-salvos`),
    },
    {
      href: basePath,
      label: "Viagem",
      match: (value) =>
        value === basePath ||
        ["etapas", "hospedagem", "contexto", "preparacao"].some(
          (area) => value === `${basePath}/${area}` || value.startsWith(`${basePath}/${area}/`),
        ),
    },
  ];

  return (
    <>
      <nav aria-label="Navegação da viagem" className={styles.nav}>
        <div className={styles.scroller}>
          {items.map((item) => {
            const active = item.match(pathname);

            return (
              <Link
                pendingLabel={`Abrindo ${item.label}…`}
                aria-current={active ? "page" : undefined}
                className={active ? styles.active : styles.link}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div aria-hidden="true" className={styles.mobileSpacer} />
    </>
  );
}
