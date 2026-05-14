import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {
  REMEMBERED_SESSION_MAX_AGE_MS,
  isSessionDueForRefresh,
} from "@/lib/auth/session";
import {
  readAuthUserByEmail,
  readAuthUserById,
  recordSuccessfulLogin,
} from "@/lib/auth/storage";
import { normalizeEmailInput } from "@/lib/schemas/field-schemas";
import { getCandidateStatusLoginError } from "@/lib/auth/errors";
import { logAudit } from "@/lib/core/audit";

type AuthorizeRequestLike = {
  headers?: Record<string, string | string[] | undefined> | Headers;
};

function getHeader(
  req: AuthorizeRequestLike | undefined,
  name: string,
): string | null {
  if (!req?.headers) return null;
  if (typeof (req.headers as Headers).get === "function") {
    return (req.headers as Headers).get(name);
  }
  const raw = (req.headers as Record<string, string | string[] | undefined>)[
    name
  ];
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw ?? null;
}

function getRequestIp(req: AuthorizeRequestLike | undefined): string {
  const forwarded = getHeader(req, "x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return getHeader(req, "x-real-ip") ?? "unknown";
}

function logAdminLoginEvent(
  action: "admin.account.login" | "admin.account.login_failed",
  userId: string,
  req: AuthorizeRequestLike | undefined,
) {
  void logAudit(action, "user", userId, userId, {
    requestIp: getRequestIp(req),
    userAgent: getHeader(req, "user-agent") ?? null,
  });
}

function logCredentialsRejection({
  email,
  reason,
  startedAt,
}: {
  email?: string;
  reason: string;
  startedAt: number;
}) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.warn("[auth] Credentials sign-in rejected", {
    email: email ? normalizeEmailInput(email) : "missing",
    reason,
    elapsedMs: Date.now() - startedAt,
  });
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials, req) {
        const startedAt = Date.now();

        if (!credentials?.email || !credentials?.password) {
          logCredentialsRejection({
            email: credentials?.email,
            reason: "missing_credentials",
            startedAt,
          });
          return null;
        }

        const email = normalizeEmailInput(credentials.email);
        const { user } = await readAuthUserByEmail(email);

        if (!user || !user.password) {
          if (user?.role === "candidate" && user.candidate) {
            const errorCode = getCandidateStatusLoginError(
              user.candidate.onboardingStatus,
            );
            logCredentialsRejection({
              email,
              reason: errorCode.toLowerCase(),
              startedAt,
            });
            throw new Error(errorCode);
          }
          logCredentialsRejection({
            email,
            reason: user ? "password_missing" : "user_not_found",
            startedAt,
          });
          return null;
        }

        if (user.role === "candidate") {
          const onboardingStatus = user.candidate?.onboardingStatus;

          if (onboardingStatus !== "active") {
            const errorCode = getCandidateStatusLoginError(onboardingStatus);
            logCredentialsRejection({
              email,
              reason: errorCode.toLowerCase(),
              startedAt,
            });
            throw new Error(errorCode);
          }
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          if (user.role === "admin") {
            logAdminLoginEvent("admin.account.login_failed", user.id, req);
          }
          logCredentialsRejection({
            email,
            reason: "password_mismatch",
            startedAt,
          });
          return null;
        }

        await recordSuccessfulLogin(user.id);

        if (user.role === "admin") {
          logAdminLoginEvent("admin.account.login", user.id, req);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          candidateId: user.candidateId ?? undefined,
          onboardingStatus: user.candidate?.onboardingStatus ?? undefined,
          sessionVersion: user.sessionVersion,
          rememberMe: credentials.rememberMe === "true",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: Math.floor(REMEMBERED_SESSION_MAX_AGE_MS / 1000),
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.candidateId = user.candidateId;
        token.onboardingStatus = user.onboardingStatus;
        token.sessionVersion = user.sessionVersion;
        token.rememberMe = user.rememberMe ?? false;
        token.loginAt = Date.now();
        token.lastValidatedAt = Date.now();
      } else if (
        trigger === "update" &&
        session &&
        typeof session === "object"
      ) {
        // Client called `useSession().update({...})` — merge in editable fields.
        const update = session as { name?: unknown; email?: unknown };
        if (typeof update.name === "string") {
          token.name = update.name;
        }
        if (typeof update.email === "string") {
          token.email = update.email;
        }
      } else if (token.sub && isSessionDueForRefresh(token.lastValidatedAt)) {
        const { user: dbUser } = await readAuthUserById(token.sub);

        if (!dbUser) {
          token.onboardingStatus = "suspended";
          token.lastValidatedAt = Date.now();
          return token;
        }

        token.role = dbUser.role;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.candidateId = dbUser.candidateId ?? undefined;
        token.onboardingStatus =
          dbUser.candidate?.onboardingStatus ?? undefined;
        token.sessionVersion = dbUser.sessionVersion;
        token.lastValidatedAt = Date.now();
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.candidateId = token.candidateId as string | undefined;
        session.user.onboardingStatus = token.onboardingStatus as
          | string
          | undefined;
        session.user.sessionVersion = token.sessionVersion as
          | number
          | undefined;
        session.user.rememberMe = Boolean(token.rememberMe);
        session.user.loginAt = token.loginAt as number | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
