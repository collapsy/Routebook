import type { Metadata } from "next";

import "./globals.css";
import "./itinerary.css";
import "./product-shell.css";
import "./trip-creation.css";

export const metadata: Metadata = {
  title: "RouteBook — Decisões melhores durante sua viagem",
  description:
    "Um guia visual e personalizado para descobrir lugares, comparar opções e organizar uma viagem com contexto.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
