export type AuthField = "name" | "email" | "password";

export type AuthActionState = Readonly<{
  fieldErrors: Partial<Record<AuthField, string>>;
  formError?: string;
}>;

export type AuthCredentials = Readonly<{
  email: string;
  password: string;
}>;

export type SignUpCredentials = AuthCredentials &
  Readonly<{
    name: string;
  }>;

export type RouteBookAuthApi = Readonly<{
  signUpEmail(input: { body: SignUpCredentials }): Promise<unknown>;
  signInEmail(input: { body: AuthCredentials }): Promise<unknown>;
  signOut(input: { headers: Headers }): Promise<unknown>;
}>;

export type AuthOperationResult =
  Readonly<{ ok: true }> | Readonly<{ ok: false; state: AuthActionState }>;

const DEFAULT_RETURN_PATH = "/viagens";
const ALLOWED_RETURN_ROOT = "/viagens";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KNOWN_SIGN_UP_CODES = new Set([
  "USER_ALREADY_EXISTS",
  "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
]);
const KNOWN_SIGN_IN_CODES = new Set(["INVALID_EMAIL_OR_PASSWORD", "INVALID_PASSWORD"]);

function normalizedText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function errorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;

  const candidate = error as {
    code?: unknown;
    body?: { code?: unknown };
    cause?: unknown;
  };
  if (typeof candidate.code === "string") return candidate.code;
  if (typeof candidate.body?.code === "string") return candidate.body.code;
  return errorCode(candidate.cause);
}

export function resolveSafeReturnPath(value: unknown): string {
  const candidate = normalizedText(value);
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return DEFAULT_RETURN_PATH;
  }
  if (candidate.includes("\\") || /[\u0000-\u001f]/.test(candidate)) {
    return DEFAULT_RETURN_PATH;
  }

  try {
    const parsed = new URL(candidate, "https://routebook.local");
    const allowed =
      parsed.pathname === ALLOWED_RETURN_ROOT ||
      parsed.pathname.startsWith(`${ALLOWED_RETURN_ROOT}/`);
    return allowed ? `${parsed.pathname}${parsed.search}${parsed.hash}` : DEFAULT_RETURN_PATH;
  } catch {
    return DEFAULT_RETURN_PATH;
  }
}

export function signUpCredentialsFromForm(
  formData: FormData,
):
  | Readonly<{ ok: true; credentials: SignUpCredentials }>
  | Readonly<{ ok: false; state: AuthActionState }> {
  const name = normalizedText(formData.get("name")).replace(/\s+/g, " ");
  const email = normalizedText(formData.get("email")).toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fieldErrors: Partial<Record<AuthField, string>> = {};

  if (name.length < 2 || name.length > 120) {
    fieldErrors.name = "Informe um nome entre 2 e 120 caracteres.";
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    fieldErrors.email = "Informe um email válido.";
  }
  if (password.length < 8 || password.length > 128) {
    fieldErrors.password = "A senha deve ter entre 8 e 128 caracteres.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, state: { fieldErrors } };
  }
  return { ok: true, credentials: { name, email, password } };
}

export function signInCredentialsFromForm(
  formData: FormData,
):
  | Readonly<{ ok: true; credentials: AuthCredentials }>
  | Readonly<{ ok: false; state: AuthActionState }> {
  const email = normalizedText(formData.get("email")).toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fieldErrors: Partial<Record<AuthField, string>> = {};

  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    fieldErrors.email = "Informe um email válido.";
  }
  if (!password) {
    fieldErrors.password = "Informe sua senha.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, state: { fieldErrors } };
  }
  return { ok: true, credentials: { email, password } };
}

export function createAuthExperience(api: RouteBookAuthApi) {
  return Object.freeze({
    async signUp(formData: FormData): Promise<AuthOperationResult> {
      const parsed = signUpCredentialsFromForm(formData);
      if (!parsed.ok) return parsed;

      try {
        await api.signUpEmail({ body: parsed.credentials });
        return { ok: true };
      } catch (error) {
        const code = errorCode(error);
        if (code && KNOWN_SIGN_UP_CODES.has(code)) {
          return {
            ok: false,
            state: {
              fieldErrors: { email: "Não foi possível criar a conta com este email." },
            },
          };
        }
        throw error;
      }
    },

    async signIn(formData: FormData): Promise<AuthOperationResult> {
      const parsed = signInCredentialsFromForm(formData);
      if (!parsed.ok) return parsed;

      try {
        await api.signInEmail({ body: parsed.credentials });
        return { ok: true };
      } catch (error) {
        const code = errorCode(error);
        if (code && KNOWN_SIGN_IN_CODES.has(code)) {
          return {
            ok: false,
            state: {
              fieldErrors: {},
              formError: "Email ou senha inválidos.",
            },
          };
        }
        throw error;
      }
    },

    async signOut(requestHeaders: Headers): Promise<void> {
      await api.signOut({ headers: requestHeaders });
    },
  });
}
