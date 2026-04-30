import { NextResponse } from "next/server";
import { sendContactNotificationEmail } from "@/lib/email/contact";
import { verifyTurnstileToken } from "@/lib/contact/turnstile";
import { logAudit } from "@/lib/core/audit";
import { contactRateLimit, getClientIp } from "@/lib/core/rate-limit";
import { contactFormSchema } from "@/lib/schemas/contact-schemas";

function getEmailDomain(email: string) {
  return email.split("@")[1] ?? "unknown";
}

export async function POST(request: Request) {
  const submissionId = crypto.randomUUID();
  const sourcePath = "/contact";
  const ip = getClientIp(request);

  try {
    if (contactRateLimit) {
      const { success } = await contactRateLimit.limit(ip);

      if (!success) {
        void logAudit(
          "contact.blocked",
          "contactSubmission",
          submissionId,
          null,
          {
            blockedReason: "rate_limited",
            sourcePath,
          },
        );

        return NextResponse.json(
          {
            error:
              "Too many messages right now. Please wait a little and try again.",
          },
          { status: 429 },
        );
      }
    }

    const body = await request.json().catch(() => null);
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please review your details and try again." },
        { status: 400 },
      );
    }

    const {
      name,
      email,
      reason,
      reasonDetails,
      message,
      website,
      turnstileToken,
    } = parsed.data;
    const auditDetails = {
      emailDomain: getEmailDomain(email),
      messageLength: message.length,
      reason,
      hasReasonDetails: reasonDetails.length > 0,
      sourcePath,
    };

    if (website) {
      void logAudit(
        "contact.blocked",
        "contactSubmission",
        submissionId,
        null,
        {
          ...auditDetails,
          blockedReason: "honeypot",
        },
      );

      return NextResponse.json({ success: true });
    }

    const verification = await verifyTurnstileToken({
      token: turnstileToken,
      ip,
    });

    if (!verification.success) {
      const isConfigIssue = verification.reason === "not_configured";

      void logAudit(
        "contact.blocked",
        "contactSubmission",
        submissionId,
        null,
        {
          ...auditDetails,
          blockedReason: verification.reason,
        },
      );

      return NextResponse.json(
        {
          error: isConfigIssue
            ? "Contact form verification is temporarily unavailable. Please email us directly for now."
            : "Verification failed. Please try again.",
        },
        { status: isConfigIssue ? 503 : 400 },
      );
    }

    const submittedAt = new Date();
    const delivery = await sendContactNotificationEmail({
      name,
      email,
      reason,
      reasonDetails,
      message,
      submittedAt,
      sourcePath,
    });

    if (!delivery.sent) {
      void logAudit(
        "contact.delivery_failed",
        "contactSubmission",
        submissionId,
        null,
        {
          ...auditDetails,
          blockedReason: "delivery_not_configured",
        },
      );

      return NextResponse.json(
        {
          error:
            "Contact is temporarily unavailable. Please use the email option on this page for now.",
        },
        { status: 503 },
      );
    }

    void logAudit("contact.submit", "contactSubmission", submissionId, null, {
      ...auditDetails,
      delivery: "email",
      turnstileBypassed: verification.bypassed,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact submission failed:", error);
    void logAudit(
      "contact.delivery_failed",
      "contactSubmission",
      submissionId,
      null,
      {
        blockedReason: "delivery_failed",
        sourcePath,
      },
    );

    return NextResponse.json(
      {
        error:
          "We couldn't send your message right now. Please try again or use the email option on this page.",
      },
      { status: 500 },
    );
  }
}
