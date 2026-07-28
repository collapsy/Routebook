import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-surface">
      <a className="skip-link" href="#conteudo-principal">
        Pular para o conteúdo
      </a>

      <header className="app-header">
        <div className="app-header-inner">
          <Link aria-label="RouteBook — página inicial" className="app-brand" href="/">
            <span aria-hidden="true" className="app-brand-mark">
              R
            </span>
            <span>RouteBook</span>
          </Link>

          <nav aria-label="Navegação global" className="app-navigation">
            <Link aria-current="page" className="app-nav-link app-nav-link-active" href="/viagens">
              Minhas viagens
            </Link>
            <Link className="app-nav-link" href="/#proposito">
              Sobre o projeto
            </Link>
          </nav>
        </div>
      </header>

      <main className="app-main" id="conteudo-principal">
        {children}
      </main>

      <footer className="app-footer">
        <strong>RouteBook</strong>
        <p>Seu contexto de viagem, organizado para decisões melhores.</p>
      </footer>
    </div>
  );
}
