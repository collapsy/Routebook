import Link from "next/link";
import type { ReactNode } from "react";

type AuthPageProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}>;

export function AuthPage({ eyebrow, title, description, children }: AuthPageProps) {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <Link aria-label="RouteBook — página inicial" className="auth-brand" href="/">
          <span aria-hidden="true" className="app-brand-mark">
            R
          </span>
          <span>RouteBook</span>
        </Link>

        <header className="auth-heading">
          <p className="product-eyebrow">{eyebrow}</p>
          <h1 id="auth-title">{title}</h1>
          <p>{description}</p>
        </header>

        {children}
      </section>
    </main>
  );
}
