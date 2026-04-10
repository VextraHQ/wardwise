import crypto from "crypto";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/core/prisma";
import { readAuthUserById } from "@/lib/auth/storage";

export type AuthLinkType = "invite" | "password_reset";
type AuthDbClient = Prisma.TransactionClient | typeof prisma;

const AUTH_LINK_TTL_MS: Record<AuthLinkType, number> = {
  invite: 7 * 24 * 60 * 60 * 1000,
  password_reset: 60 * 60 * 1000,
};

type AuthUserRecord = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  candidateId: string | null;
  candidate: {
    id: string;
    name: string;
    onboardingStatus: string;
  } | null;
};

function hashAuthToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateAuthToken() {
  return crypto.randomBytes(24).toString("base64url");
}

function getBaseUrl() {
  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "http://localhost:3000"
  );
}

export function canSendAuthLinkEmail() {
  return Boolean(process.env.RESEND_API_KEY && process.env.AUTH_FROM_EMAIL);
}

export function buildAuthLinkUrl(token: string) {
  return `${getBaseUrl()}/reset-password/${token}`;
}

async function getUserForAuthLink(
  userId: string,
): Promise<AuthUserRecord | null> {
  const { user } = await readAuthUserById(userId);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    candidateId: user.candidateId,
    candidate: user.candidate,
  };
}

export async function issueAuthLink({
  userId,
  type,
  createdById,
  db = prisma,
}: {
  userId: string;
  type: AuthLinkType;
  createdById?: string;
  db?: AuthDbClient;
}) {
  const token = generateAuthToken();
  const tokenHash = hashAuthToken(token);
  const expiresAt = new Date(Date.now() + AUTH_LINK_TTL_MS[type]);

  await db.authToken.create({
    data: {
      userId,
      type,
      tokenHash,
      expiresAt,
      createdById: createdById ?? null,
    },
  });

  return {
    token,
    url: buildAuthLinkUrl(token),
    expiresAt,
  };
}

export async function revokeOutstandingAuthLinks(
  userId: string,
  type?: AuthLinkType,
  db: AuthDbClient = prisma,
) {
  await db.authToken.deleteMany({
    where: {
      userId,
      usedAt: null,
      ...(type ? { type } : {}),
    },
  });
}

export async function getAuthLinkContext(token: string) {
  const record = await prisma.authToken.findUnique({
    where: { tokenHash: hashAuthToken(token) },
    select: {
      id: true,
      type: true,
      expiresAt: true,
      usedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
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
        },
      },
    },
  });

  if (!record) {
    return null;
  }

  const isExpired = record.expiresAt.getTime() < Date.now();
  const isUsed = Boolean(record.usedAt);

  if (isExpired || isUsed) {
    return {
      ...record,
      type: record.type as AuthLinkType,
      isExpired,
      isUsed,
      isValid: false,
    };
  }

  const candidateStatus = record.user.candidate?.onboardingStatus ?? null;
  const isSuspended = candidateStatus === "suspended";

  return {
    ...record,
    type: record.type as AuthLinkType,
    candidateStatus,
    isExpired: false,
    isUsed: false,
    isSuspended,
    isValid: !isSuspended,
  };
}

export async function consumeAuthLink({
  token,
  password,
}: {
  token: string;
  password: string;
}) {
  const context = await getAuthLinkContext(token);

  if (!context || !context.isValid) {
    return { success: false as const, reason: "invalid_link" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    await tx.authToken.update({
      where: { id: context.id },
      data: { usedAt: new Date() },
    });

    await tx.authToken.deleteMany({
      where: {
        userId: context.user.id,
        usedAt: null,
      },
    });

    await tx.user.update({
      where: { id: context.user.id },
      data: {
        password: passwordHash,
        passwordChangedAt: new Date(),
        sessionVersion: { increment: 1 },
      },
    });

    if (context.user.candidateId) {
      await tx.candidate.update({
        where: { id: context.user.candidateId },
        data: { onboardingStatus: "active" },
      });
    }
  });

  return {
    success: true as const,
    user: context.user,
    type: context.type as AuthLinkType,
  };
}

export async function sendAuthLinkEmail({
  to,
  name,
  url,
  type,
  expiresAt,
}: {
  to: string;
  name: string;
  url: string;
  type: AuthLinkType;
  expiresAt: Date;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_FROM_EMAIL;

  if (!canSendAuthLinkEmail() || !apiKey || !from) {
    return { sent: false as const, reason: "not_configured" };
  }

  const subject =
    type === "invite"
      ? "Set up your WardWise account"
      : "Reset your WardWise password";
  const title =
    type === "invite" ? "Set up your WardWise access" : "Reset your password";
  const description =
    type === "invite"
      ? "Your campaign admin has created your WardWise access. Use the secure link below to set your password."
      : "We received a request to reset your WardWise password. Use the secure link below to choose a new one.";

  const expiresLabel = expiresAt.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html: `
        <div style="font-family: Geist, Arial, sans-serif; background:#f7f7f4; padding:32px;">
          <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid rgba(22,101,91,0.14); padding:32px;">
            <p style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#16655b; font-weight:700; margin:0 0 16px;">
              WardWise Secure Access
            </p>
            <h1 style="font-size:28px; line-height:1.1; margin:0 0 12px; color:#101414;">
              ${title}
            </h1>
            <p style="font-size:15px; line-height:1.7; color:#475569; margin:0 0 20px;">
              Hello ${name || "there"}, ${description}
            </p>
            <p style="margin:0 0 24px;">
              <a href="${url}" style="display:inline-block; background:#16655b; color:#ffffff; text-decoration:none; padding:14px 18px; font-size:12px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;">
                Continue securely
              </a>
            </p>
            <p style="font-size:13px; line-height:1.7; color:#64748b; margin:0 0 8px;">
              This link expires on ${expiresLabel}.
            </p>
            <p style="font-size:13px; line-height:1.7; color:#64748b; margin:0;">
              If you did not expect this email, you can safely ignore it.
            </p>
          </div>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Unable to send authentication email");
  }

  return { sent: true as const };
}

export async function createInviteForUser({
  userId,
  createdById,
  db = prisma,
}: {
  userId: string;
  createdById?: string;
  db?: AuthDbClient;
}) {
  const user = await getUserForAuthLink(userId);

  if (!user) {
    throw new Error("User not found");
  }

  await revokeOutstandingAuthLinks(userId, undefined, db);
  const link = await issueAuthLink({
    userId,
    type: "invite",
    createdById,
    db,
  });

  try {
    const emailResult = await sendAuthLinkEmail({
      to: user.email,
      name: user.name || user.candidate?.name || "Candidate",
      url: link.url,
      type: "invite",
      expiresAt: link.expiresAt,
    });

    return {
      ...link,
      deliveryMethod: emailResult.sent
        ? ("email" as const)
        : ("manual" as const),
    };
  } catch {
    return {
      ...link,
      deliveryMethod: "manual" as const,
    };
  }
}

export async function createPasswordResetForUser({
  userId,
  createdById,
  db = prisma,
}: {
  userId: string;
  createdById?: string;
  db?: AuthDbClient;
}) {
  const user = await getUserForAuthLink(userId);

  if (!user) {
    throw new Error("User not found");
  }

  await revokeOutstandingAuthLinks(userId, undefined, db);
  const link = await issueAuthLink({
    userId,
    type: "password_reset",
    createdById,
    db,
  });

  try {
    const emailResult = await sendAuthLinkEmail({
      to: user.email,
      name: user.name || user.candidate?.name || "Candidate",
      url: link.url,
      type: "password_reset",
      expiresAt: link.expiresAt,
    });

    return {
      ...link,
      deliveryMethod: emailResult.sent
        ? ("email" as const)
        : ("manual" as const),
    };
  } catch {
    return {
      ...link,
      deliveryMethod: "manual" as const,
    };
  }
}
