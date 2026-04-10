/* eslint-disable @typescript-eslint/no-unused-vars */
import { type DefaultSession, type DefaultUser } from "next-auth";
import { JWT, type DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      candidateId?: string;
      onboardingStatus?: string;
      sessionVersion?: number;
      rememberMe?: boolean;
      loginAt?: number;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    candidateId?: string;
    onboardingStatus?: string;
    sessionVersion?: number;
    rememberMe?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string;
    candidateId?: string;
    onboardingStatus?: string;
    sessionVersion?: number;
    rememberMe?: boolean;
    loginAt?: number;
    lastValidatedAt?: number;
  }
}
