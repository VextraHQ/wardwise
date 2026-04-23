import { prisma } from "@/lib/core/prisma";
import { normalizeEmailInput } from "@/lib/schemas/field-schemas";

type CandidateAuthRecord = {
  id: string;
  name: string;
  onboardingStatus: string;
} | null;

export type AuthUserRecord = {
  id: string;
  name: string | null;
  email: string;
  password: string | null;
  role: string;
  candidateId: string | null;
  sessionVersion: number;
  candidate: CandidateAuthRecord;
};

const AUTH_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  password: true,
  role: true,
  candidateId: true,
  sessionVersion: true,
  candidate: {
    select: {
      id: true,
      name: true,
      onboardingStatus: true,
    },
  },
} as const;

export async function readAuthUserByEmail(email: string) {
  const normalizedEmail = normalizeEmailInput(email);

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: "insensitive",
      },
    },
    select: AUTH_USER_SELECT,
  });

  return { user };
}

export async function readAuthUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: AUTH_USER_SELECT,
  });

  return { user };
}

export async function recordSuccessfulLogin(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      lastLoginAt: new Date(),
    },
  });
}

export async function bumpUserSessionVersion(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      sessionVersion: {
        increment: 1,
      },
    },
  });
}

export async function bumpCandidateSessionVersions(candidateId: string) {
  await prisma.user.updateMany({
    where: { candidateId },
    data: {
      sessionVersion: {
        increment: 1,
      },
    },
  });
}
