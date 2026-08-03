import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signInAction } from "@/app/auth-actions";
import { AuthForm } from "@/components/auth-form";
import { AuthPage } from "@/components/auth-page";
import { getRouteBookSession } from "@/lib/auth-session";
import { resolveSafeReturnPath } from "@/lib/auth-experience";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar — RouteBook",
  description: "Entre na sua conta RouteBook para acessar suas viagens.",
};

export default async function SignInPage({
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
      eyebrow="Acesso seguro"
      title="Entre no RouteBook"
      description="Use sua conta para continuar organizando suas viagens e decisões."
    >
      <AuthForm action={signInAction} mode="sign-in" nextPath={nextPath} />
    </AuthPage>
  );
}
