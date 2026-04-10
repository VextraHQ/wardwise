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

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { user } = await readAuthUserByEmail(credentials.email);

        if (!user || !user.password) {
          if (user?.role === "candidate" && user.candidate) {
            throw new Error("ACCOUNT_SETUP_REQUIRED");
          }
          return null;
        }

        if (user.role === "candidate") {
          const onboardingStatus = user.candidate?.onboardingStatus;

          if (onboardingStatus === "suspended") {
            throw new Error("ACCOUNT_SUSPENDED");
          }

          if (onboardingStatus !== "active") {
            throw new Error("ACCOUNT_SETUP_REQUIRED");
          }
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          return null;
        }

        await recordSuccessfulLogin(user.id);

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
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.candidateId = user.candidateId;
        token.onboardingStatus = user.onboardingStatus;
        token.sessionVersion = user.sessionVersion;
        token.rememberMe = user.rememberMe ?? false;
        token.loginAt = Date.now();
        token.lastValidatedAt = Date.now();
      } else if (token.sub && isSessionDueForRefresh(token.lastValidatedAt)) {
        const { user: dbUser } = await readAuthUserById(token.sub);

        if (!dbUser) {
          token.onboardingStatus = "suspended";
          token.lastValidatedAt = Date.now();
          return token;
        }

        token.role = dbUser.role;
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
