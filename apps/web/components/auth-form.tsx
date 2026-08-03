"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { AuthActionState } from "@/lib/auth-experience";

const INITIAL_STATE: AuthActionState = { fieldErrors: {} };

type AuthFormProps = Readonly<{
  mode: "sign-in" | "sign-up";
  nextPath: string;
  action(state: AuthActionState, formData: FormData): Promise<AuthActionState>;
}>;

function SubmitButton({ mode }: Readonly<{ mode: AuthFormProps["mode"] }>) {
  const { pending } = useFormStatus();
  const label = mode === "sign-up" ? "Criar conta" : "Entrar";

  return (
    <button className="product-primary-action auth-submit" disabled={pending} type="submit">
      {pending ? "Processando…" : label}
    </button>
  );
}

export function AuthForm({ mode, nextPath, action }: AuthFormProps) {
  const [state, formAction] = useActionState(action, INITIAL_STATE);
  const isSignUp = mode === "sign-up";

  return (
    <form action={formAction} className="auth-form" noValidate>
      <input name="next" type="hidden" value={nextPath} />

      {isSignUp ? (
        <div className="form-field">
          <label htmlFor="name">Nome</label>
          <input
            aria-describedby={state.fieldErrors.name ? "name-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors.name)}
            autoComplete="name"
            id="name"
            maxLength={120}
            name="name"
            required
            type="text"
          />
          {state.fieldErrors.name ? (
            <p className="field-error" id="name-error">
              {state.fieldErrors.name}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          aria-describedby={state.fieldErrors.email ? "email-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors.email)}
          autoComplete="email"
          id="email"
          maxLength={320}
          name="email"
          required
          type="email"
        />
        {state.fieldErrors.email ? (
          <p className="field-error" id="email-error">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="form-field">
        <label htmlFor="password">Senha</label>
        <input
          aria-describedby={state.fieldErrors.password ? "password-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors.password)}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          id="password"
          maxLength={128}
          minLength={isSignUp ? 8 : undefined}
          name="password"
          required
          type="password"
        />
        {state.fieldErrors.password ? (
          <p className="field-error" id="password-error">
            {state.fieldErrors.password}
          </p>
        ) : isSignUp ? (
          <p className="field-hint">Use entre 8 e 128 caracteres.</p>
        ) : null}
      </div>

      {state.formError ? (
        <p className="form-error" role="alert">
          {state.formError}
        </p>
      ) : null}

      <div className="auth-actions">
        <SubmitButton mode={mode} />
        <p>
          {isSignUp ? "Já possui uma conta?" : "Ainda não possui uma conta?"}{" "}
          <Link href={isSignUp ? `/entrar?next=${encodeURIComponent(nextPath)}` : `/criar-conta?next=${encodeURIComponent(nextPath)}`}>
            {isSignUp ? "Entrar" : "Criar conta"}
          </Link>
        </p>
      </div>
    </form>
  );
}
