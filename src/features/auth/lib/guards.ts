import { getServerSession, type Session } from "next-auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { isSessionWithinLifetime } from "@/features/auth/lib/session";
import {
  type AuthUserRecord,
  readAuthUserById,
} from "@/features/auth/lib/storage";
import { authOptions } from "@/features/auth/lib/config";
import {
  getDefaultHomePath,
  resolvePostLoginRedirect,
} from "@/features/auth/lib/redirects";
import { isPrismaConnectivityError } from "@/lib/core/prisma-errors";

export { getDefaultHomePath };

export type AppRole = "admin" | "candidate";
type AuthSession = Session;
type AuthUser = Pick<
  AuthUserRecord,
  "id" | "role" | "candidateId" | "sessionVersion"
> & {
  candidate: {
    onboardingStatus: string;
  } | null;
};

type AuthContext = {
  session: AuthSession | null;
  user: AuthUser | null;
  reason:
    | "ok"
    | "unauthenticated"
    | "session_expired"
    | "account_missing"
    | "session_stale"
    | "candidate_inactive";
};

type AuthorizedRoleResult = {
  error: null;
  session: AuthSession;
  user: AuthUser;
  context: AuthContext & {
    session: AuthSession;
    user: AuthUser;
    reason: "ok";
  };
};

type UnauthorizedRoleResult = {
  error: NextResponse;
  session: null;
  user: null;
  context: AuthContext;
};

type RequireRoleResult = AuthorizedRoleResult | UnauthorizedRoleResult;

function unauthorized(message: string, status = 401) {
  return NextResponse.json({ error: message }, { status });
}

function getSessionBackedUser(session: AuthSession): AuthUser | null {
  if (!session.user?.id || !session.user.role) {
    return null;
  }

  return {
    id: session.user.id,
    role: session.user.role,
    candidateId: session.user.candidateId ?? null,
    sessionVersion: session.user.sessionVersion ?? 0,
    candidate:
      session.user.role === "candidate"
        ? {
            onboardingStatus: session.user.onboardingStatus ?? "pending",
          }
        : null,
  };
}

function logDevAuthGuardEvent(
  event:
    | "page_redirect_to_login"
    | "page_redirect_wrong_role"
    | "api_auth_rejected"
    | "api_wrong_role",
  {
    role,
    context,
  }: {
    role?: AppRole;
    context: AuthContext;
  },
) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.warn("[auth-guard]", {
    event,
    requiredRole: role ?? null,
    reason: context.reason,
    sessionUserId: context.session?.user?.id ?? null,
    sessionRole: context.session?.user?.role ?? null,
    sessionVersion: context.session?.user?.sessionVersion ?? null,
    rememberMe: context.session?.user?.rememberMe ?? null,
    loginAt: context.session?.user?.loginAt ?? null,
    dbUserId: context.user?.id ?? null,
    dbRole: context.user?.role ?? null,
    dbSessionVersion: context.user?.sessionVersion ?? null,
  });
}

export async function getAuthContext(): Promise<AuthContext> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { session: null, user: null, reason: "unauthenticated" };
  }

  if (!isSessionWithinLifetime(session.user)) {
    return { session, user: null, reason: "session_expired" };
  }

  let dbUser;
  try {
    ({ user: dbUser } = await readAuthUserById(session.user.id));
  } catch (error) {
    if (
      process.env.NODE_ENV !== "production" &&
      isPrismaConnectivityError(error)
    ) {
      const sessionBackedUser = getSessionBackedUser(session);

      if (sessionBackedUser) {
        console.warn("[auth-guard] Using session fallback due to DB outage", {
          userId: session.user.id,
          role: session.user.role,
        });
        return { session, user: sessionBackedUser, reason: "ok" };
      }
    }

    throw error;
  }

  const user = dbUser
    ? {
        id: dbUser.id,
        role: dbUser.role,
        candidateId: dbUser.candidateId,
        sessionVersion: dbUser.sessionVersion,
        candidate: dbUser.candidate
          ? {
              onboardingStatus: dbUser.candidate.onboardingStatus,
            }
          : null,
      }
    : null;

  if (!user) {
    return { session, user: null, reason: "account_missing" };
  }

  if ((session.user.sessionVersion ?? 0) !== user.sessionVersion) {
    return { session, user, reason: "session_stale" };
  }

  if (
    user.role === "candidate" &&
    user.candidate?.onboardingStatus !== "active"
  ) {
    return { session, user, reason: "candidate_inactive" };
  }

  return { session, user, reason: "ok" };
}

function getAuthErrorResponse(reason: AuthContext["reason"]) {
  switch (reason) {
    case "candidate_inactive":
      return unauthorized("Account access is not active.", 403);
    case "session_expired":
    case "session_stale":
      return unauthorized("Your session has expired. Please sign in again.");
    case "account_missing":
    case "unauthenticated":
    default:
      return unauthorized("Unauthorized");
  }
}

export async function requireRole(role: AppRole): Promise<RequireRoleResult> {
  const context = await getAuthContext();

  if (context.reason !== "ok" || !context.user || !context.session) {
    logDevAuthGuardEvent("api_auth_rejected", { role, context });
    return {
      error: getAuthErrorResponse(context.reason),
      session: null,
      user: null,
      context,
    };
  }

  if (context.user.role !== role) {
    logDevAuthGuardEvent("api_wrong_role", { role, context });
    return {
      error: unauthorized("Forbidden", 403),
      session: null,
      user: null,
      context,
    };
  }

  return {
    error: null,
    session: context.session,
    user: context.user,
    context: {
      ...context,
      session: context.session,
      user: context.user,
      reason: "ok",
    },
  };
}

export async function requireAdmin() {
  return requireRole("admin");
}

export async function requireCandidate() {
  return requireRole("candidate");
}

export async function requirePageRole(role: AppRole) {
  const context = await getAuthContext();

  if (context.reason !== "ok" || !context.user) {
    logDevAuthGuardEvent("page_redirect_to_login", { role, context });
    redirect("/login");
  }

  if (context.user.role !== role) {
    logDevAuthGuardEvent("page_redirect_wrong_role", { role, context });
    redirect(getDefaultHomePath(context.user.role));
  }

  return context;
}

export async function redirectAuthenticatedUser(callbackUrl?: string | null) {
  const context = await getAuthContext();

  if (context.reason === "ok" && context.user) {
    redirect(resolvePostLoginRedirect(context.user.role, callbackUrl));
  }
}
