import crypto from "crypto";
import { hash, compare } from "bcryptjs";
import { prisma } from "@/lib/core/prisma";

/**
 * Generate a URL-safe random token for report access.
 * Format: "rpt-" + 12 random hex chars (e.g., "rpt-a3f8c91d2e4b")
 */
export function generateReportToken(): string {
  return "rpt-" + crypto.randomBytes(6).toString("hex");
}

/** Generate a 6-digit numeric passcode. */
export function generatePasscode(): string {
  const num = crypto.randomInt(0, 1_000_000);
  return String(num).padStart(6, "0");
}

/** Hash a passcode for storage (bcrypt, 10 rounds). */
export async function hashPasscode(passcode: string): Promise<string> {
  return hash(passcode, 10);
}

/** Verify a passcode against a stored hash. */
export async function verifyPasscode(
  passcode: string,
  storedHash: string,
): Promise<boolean> {
  return compare(passcode, storedHash);
}

/**
 * Validate a report token and return the campaign if valid.
 * Does NOT update clientReportLastViewedAt — that only happens on authorized loads.
 */
export async function validateReportToken(token: string) {
  if (!token) return null;

  const campaign = await prisma.campaign.findUnique({
    where: { clientReportToken: token },
    select: {
      id: true,
      slug: true,
      candidateName: true,
      candidateTitle: true,
      brandingType: true,
      displayName: true,
      party: true,
      constituency: true,
      constituencyType: true,
      enabledLgaIds: true,
      status: true,
      clientReportEnabled: true,
      clientReportPasscodeHash: true,
      clientReportLastViewedAt: true,
    },
  });

  if (!campaign) return null;
  if (!campaign.clientReportEnabled) return null;
  if (campaign.status === "draft") return null;

  return campaign;
}

/** Update the last-viewed timestamp. Call only after successful unlock or authorized load. */
export async function touchReportLastViewed(campaignId: string): Promise<void> {
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { clientReportLastViewedAt: new Date() },
  });
}

const COOKIE_NAME = "report-access";
const COOKIE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getHmacSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret)
    throw new Error("NEXTAUTH_SECRET is required for report cookies");
  return secret;
}

function hmacSign(payload: string): string {
  return crypto
    .createHmac("sha256", getHmacSecret())
    .update(payload)
    .digest("hex");
}

/**
 * Build a signed cookie value: token|passcodeHashPrefix|issuedAt|signature
 *
 * The passcodeHashPrefix binds the cookie to the current passcode.
 * When the passcode is reset, the hash changes and all existing cookies
 * are automatically invalidated.
 */
export function signReportCookie(token: string, passcodeHash: string): string {
  const prefix = passcodeHash.slice(-8);
  const issuedAt = Date.now().toString();
  const payload = `${token}|${prefix}|${issuedAt}`;
  const sig = hmacSign(payload);
  return `${payload}|${sig}`;
}

/**
 * Verify a report cookie value matches the expected token,
 * is bound to the current passcode, and hasn't expired.
 *
 * Safe against malformed input — returns false on any error.
 */
export function verifyReportCookie(
  cookieValue: string,
  expectedToken: string,
  currentPasscodeHash: string,
): boolean {
  try {
    const parts = cookieValue.split("|");
    if (parts.length !== 4) return false;

    const [token, hashPrefix, issuedAtStr, sig] = parts;
    if (token !== expectedToken) return false;

    // Verify passcode hash binding — rejects cookies from before a reset
    const expectedPrefix = currentPasscodeHash.slice(-8);
    if (hashPrefix !== expectedPrefix) return false;

    // Verify signature (timing-safe)
    const payload = `${token}|${hashPrefix}|${issuedAtStr}`;
    const expectedSig = hmacSign(payload);
    if (sig.length !== expectedSig.length) return false;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return false;
    }

    // Check TTL
    const issuedAt = parseInt(issuedAtStr, 10);
    if (isNaN(issuedAt)) return false;
    if (Date.now() - issuedAt > COOKIE_TTL_MS) return false;

    return true;
  } catch {
    // Any unexpected error (bad encoding, buffer mismatch, etc.) → reject
    return false;
  }
}

/** The cookie name used for report access sessions. */
export { COOKIE_NAME as REPORT_COOKIE_NAME };

type ValidatedCampaign = NonNullable<
  Awaited<ReturnType<typeof validateReportToken>>
>;

type ValidationResult =
  | { campaign: ValidatedCampaign; error: null }
  | { campaign: null; error: { message: string; status: number } };

/**
 * Validate a client report API request: token + cookie.
 * Used by all /api/campaign-report/[token]/* routes.
 */
export async function validateReportRequest(
  token: string,
  request: Request,
): Promise<ValidationResult> {
  const campaign = await validateReportToken(token);
  if (!campaign) {
    return {
      campaign: null,
      error: { message: "Report not found", status: 404 },
    };
  }

  if (!campaign.clientReportPasscodeHash) {
    return {
      campaign: null,
      error: { message: "Report access not configured", status: 403 },
    };
  }

  // Parse cookie safely — malformed values fail closed as 401
  let cookieValue: string | undefined;
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...rest] = c.trim().split("=");
        return [key, rest.join("=")];
      }),
    );
    const raw = cookies[COOKIE_NAME];
    cookieValue = raw ? decodeURIComponent(raw) : undefined;
  } catch {
    // Bad % sequences in cookie → treat as missing
    cookieValue = undefined;
  }

  if (
    !cookieValue ||
    !verifyReportCookie(cookieValue, token, campaign.clientReportPasscodeHash)
  ) {
    return {
      campaign: null,
      error: { message: "Unauthorized", status: 401 },
    };
  }

  return { campaign, error: null };
}
