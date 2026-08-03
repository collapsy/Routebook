import {
  authorizeTripAction,
  TripAuthorizationError,
  type AuthorizedTripContext,
  type TripAction,
  type TripAuthorizationReader,
} from "@routebook/identity-access";
import { createPostgresTripAuthorizationReader } from "@routebook/database";

import {
  getRouteBookSession,
  type RouteBookSessionReader,
} from "./auth-session";

export type TripRouteAccessResult =
  | Readonly<{ status: "unauthenticated" }>
  | Readonly<{ status: "not-found" }>
  | Readonly<{ status: "authorized"; context: AuthorizedTripContext }>;

type ResolveTripRouteAccessInput = Readonly<{
  tripId: string;
  action: TripAction;
  requestHeaders?: Headers;
}>;

type ResolveTripRouteAccessDependencies = Readonly<{
  sessionReader?: RouteBookSessionReader;
  authorizationReader?: TripAuthorizationReader;
}>;

export async function resolveTripRouteAccess(
  input: ResolveTripRouteAccessInput,
  dependencies: ResolveTripRouteAccessDependencies = {},
): Promise<TripRouteAccessResult> {
  const session = await getRouteBookSession(input.requestHeaders, dependencies.sessionReader);
  if (!session) return { status: "unauthenticated" };

  try {
    const context = await authorizeTripAction(
      {
        userId: session.user.id,
        tripId: input.tripId,
        action: input.action,
      },
      dependencies.authorizationReader ?? createPostgresTripAuthorizationReader(),
    );

    return { status: "authorized", context };
  } catch (error) {
    if (error instanceof TripAuthorizationError) {
      return { status: "not-found" };
    }
    throw error;
  }
}
