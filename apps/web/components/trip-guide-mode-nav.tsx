import Link from "next/link";

import styles from "./trip-guide-mode-nav.module.css";

export function TripGuideModeNav({
  tripId,
  selectedDate,
  active,
}: Readonly<{
  tripId: string;
  selectedDate?: string;
  active: "today" | "days";
}>) {
  const dateQuery = selectedDate ? `?dia=${selectedDate}` : "";

  return (
    <nav aria-label="Modo do Guia" className={styles.nav}>
      <Link
        aria-current={active === "today" ? "page" : undefined}
        className={active === "today" ? styles.active : styles.link}
        href={`/viagens/${tripId}/guia${dateQuery}`}
      >
        Hoje
      </Link>
      <Link
        aria-current={active === "days" ? "page" : undefined}
        className={active === "days" ? styles.active : styles.link}
        href={`/viagens/${tripId}/guia/dias${dateQuery}`}
      >
        Guia por dia
      </Link>
    </nav>
  );
}
