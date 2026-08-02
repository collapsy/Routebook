import { headers } from "next/headers";

import { auth } from "./auth";

export type AuthenticatedRouteBookUser = Readonly<{
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
}>;

export type RouteBookSessionContext = Readonly<{
  user: AuthenticatedRouteBookUser;
  session: Readonly<{
    id: string;
    token: string;
    expiresAt: Date;
  }>;
}>;

export async function getRouteBookSession(
  requestHeaders: Headers = await headers(),
): Promise<RouteBookSessionContext | null> {
  const current = await auth.api.getSession({ headers: requestHeaders });
  if (!current) return null;

  return Object.freeze({
    user: Object.freeze({
      id: current.user.id,
      name: current.user.name,
      email: current.user.email,
      emailVerified: current.user.emailVerified,
      ...(current.user.image ? { image: current.user.image } : {}),
    }),
    session: Object.freeze({
      id: current.session.id,
      token: current.session.token,
      expiresAt: new Date(current.session.expiresAt),
    }),
  });
}
