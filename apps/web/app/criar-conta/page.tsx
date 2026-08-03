import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signUpAction } from "@/app/auth-actions";
import { AuthForm } from "@/components/auth-form";
import { AuthPage } from "@/components/auth-page";
import { getRouteBookSession } from "@/lib/auth-session";
import { resolveSafeReturnPath } from "@/lib/auth-experience";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Criar conta — RouteBook",
  description: "Crie sua conta RouteBook para organizar suas viagens com segurança.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = resolveSafeReturnPath(next);
  const session = await getRouteBookSession();
  if (session) redirect(nextPath);

  return (
    <AuthPage
      eyebrow="Sua identidade no RouteBook"
      title="Crie sua conta"
      description="Sua sessão protege o acesso às viagens e prepara os próximos fluxos personalizados."
    >
      <AuthForm action={signUpAction} mode="sign-up" nextPath={nextPath} />
    </AuthPage>
  );
}
