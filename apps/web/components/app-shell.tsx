import Link from "next/link";
import type { ReactNode } from "react";

import { signOutAction } from "@/app/auth-actions";
import { getRouteBookSession } from "@/lib/auth-session";

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

export async function AppShell({ children }: AppShellProps) {
  const session = await getRouteBookSession();

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
            {session ? (
              <div className="app-session">
                <span className="app-session-user" title={session.user.name}>
                  {session.user.name}
                </span>
                <form action={signOutAction}>
                  <button className="app-nav-link app-sign-out" type="submit">
                    Sair
                  </button>
                </form>
              </div>
            ) : (
              <Link className="app-nav-link" href="/entrar?next=%2Fviagens">
                Entrar
              </Link>
            )}
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
