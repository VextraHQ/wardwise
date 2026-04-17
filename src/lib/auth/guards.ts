import { getServerSession, type Session } from "next-auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { isSessionWithinLifetime } from "@/lib/auth/session";
import { type AuthUserRecord, readAuthUserById } from "@/lib/auth/storage";
import { authOptions } from "@/lib/auth/config";
import {
  getDefaultHomePath,
  resolvePostLoginRedirect,
} from "@/lib/auth/redirects";

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

export async function getAuthContext(): Promise<AuthContext> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { session: null, user: null, reason: "unauthenticated" };
  }

  if (!isSessionWithinLifetime(session.user)) {
    return { session, user: null, reason: "session_expired" };
  }

  const { user: dbUser } = await readAuthUserById(session.user.id);
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
    return {
      error: getAuthErrorResponse(context.reason),
      session: null,
      user: null,
      context,
    };
  }

  if (context.user.role !== role) {
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
    redirect("/login");
  }

  if (context.user.role !== role) {
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
