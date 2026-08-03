"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  createAuthExperience,
  resolveSafeReturnPath,
  type AuthActionState,
} from "@/lib/auth-experience";
import { auth } from "@/lib/auth";

const experience = createAuthExperience(auth.api);

function genericFailure(): AuthActionState {
  return {
    fieldErrors: {},
    formError: "Não foi possível concluir esta operação agora. Tente novamente.",
  };
}

export async function signUpAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const destination = resolveSafeReturnPath(formData.get("next"));

  try {
    const result = await experience.signUp(formData);
    if (!result.ok) return result.state;
  } catch (error) {
    console.error("Falha técnica ao criar conta", error);
    return genericFailure();
  }

  redirect(destination);
}

export async function signInAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const destination = resolveSafeReturnPath(formData.get("next"));

  try {
    const result = await experience.signIn(formData);
    if (!result.ok) return result.state;
  } catch (error) {
    console.error("Falha técnica ao entrar", error);
    return genericFailure();
  }

  redirect(destination);
}

export async function signOutAction(): Promise<void> {
  try {
    await experience.signOut(await headers());
  } catch (error) {
    console.error("Falha técnica ao sair", error);
  }

  redirect("/");
}
