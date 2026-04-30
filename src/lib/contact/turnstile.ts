import { readTrimmedEnv } from "@/lib/email/send";

type TurnstileVerificationResult =
  | { success: true; bypassed: boolean }
  | {
      success: false;
      reason:
        | "not_configured"
        | "missing_token"
        | "invalid"
        | "verification_failed";
    };

type TurnstileResponse = {
  success: boolean;
};

function isDevelopmentBypassAllowed() {
  return process.env.NODE_ENV === "development";
}

export async function verifyTurnstileToken({
  token,
  ip,
}: {
  token: string;
  ip?: string;
}): Promise<TurnstileVerificationResult> {
  const siteKey = readTrimmedEnv("TURNSTILE_SITE_KEY");
  const secretKey = readTrimmedEnv("TURNSTILE_SECRET_KEY");

  if (!siteKey || !secretKey) {
    if (isDevelopmentBypassAllowed()) {
      return { success: true, bypassed: true };
    }

    return { success: false, reason: "not_configured" };
  }

  if (!token) {
    return { success: false, reason: "missing_token" };
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
          ...(ip ? { remoteip: ip } : {}),
        }),
      },
    );

    if (!response.ok) {
      return { success: false, reason: "verification_failed" };
    }

    const data = (await response.json()) as TurnstileResponse;
    return data.success
      ? { success: true, bypassed: false }
      : { success: false, reason: "invalid" };
  } catch {
    return { success: false, reason: "verification_failed" };
  }
}
