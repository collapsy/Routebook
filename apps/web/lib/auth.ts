import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { betterAuthSchema, getDatabase } from "@routebook/database";

const DEVELOPMENT_SECRET = "routebook-development-only-secret-key-2026";
const DEVELOPMENT_URL = "http://localhost:3000";

type RouteBookAuthOptions = Readonly<{
  database?: ReturnType<typeof getDatabase>;
  secret?: string;
  baseURL?: string;
}>;

function isProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export function resolveBetterAuthSecret(environment = process.env): string {
  const configured = environment.BETTER_AUTH_SECRET?.trim();
  if (configured) return configured;

  if (environment.NODE_ENV !== "production" || isProductionBuild()) {
    return DEVELOPMENT_SECRET;
  }

  throw new Error("BETTER_AUTH_SECRET não configurado para o ambiente de produção.");
}

export function resolveBetterAuthUrl(environment = process.env): string {
  const configured = environment.BETTER_AUTH_URL?.trim();
  if (configured) return configured;

  if (environment.NODE_ENV !== "production" || isProductionBuild()) {
    return DEVELOPMENT_URL;
  }

  throw new Error("BETTER_AUTH_URL não configurada para o ambiente de produção.");
}

export function createRouteBookAuth(options: RouteBookAuthOptions = {}) {
  const database = options.database ?? getDatabase();
  const secret = options.secret ?? resolveBetterAuthSecret();
  const baseURL = options.baseURL ?? resolveBetterAuthUrl();

  return betterAuth({
    appName: "RouteBook",
    baseURL,
    secret,
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: betterAuthSchema,
    }),
    advanced: {
      database: {
        generateId: "uuid",
      },
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    plugins: [nextCookies()],
  });
}

export const auth = createRouteBookAuth();
