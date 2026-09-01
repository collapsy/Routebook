"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./trip-context-nav.module.css";

type TripContextNavProps = Readonly<{
  tripId: string;
  showGuide: boolean;
}>;

type NavItem = Readonly<{
  href: string;
  label: string;
  match: (pathname: string) => boolean;
}>;

export function TripContextNav({ tripId, showGuide }: TripContextNavProps) {
  const pathname = usePathname();
  const basePath = `/viagens/${tripId}`;
  const items: NavItem[] = [
    ...(showGuide
      ? [
          {
            href: `${basePath}/guia`,
            label: "Hoje",
            match: (value: string) => value.startsWith(`${basePath}/guia`),
          },
        ]
      : []),
    {
      href: `${basePath}/lugares`,
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
      label: "Salvos",
      match: (value) => value.startsWith(`${basePath}/lugares-salvos`),
    },
    {
      href: basePath,
      label: "Viagem",
      match: (value) => value === basePath,
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
