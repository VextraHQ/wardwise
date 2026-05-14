import {
  AdminEmailChangeTemplate,
  type AdminEmailChangeEmailInput,
} from "@/lib/email/templates/admin-email-change";
import { formatAuthLinkExpiresAt } from "@/lib/email/templates/auth-link";

const fixtureInput: AdminEmailChangeEmailInput = {
  name: "Ada",
  url: "https://wardwise.ng/confirm-email-change/preview-token",
  targetEmail: "ada@wardwise.ng",
  expiresAt: new Date("2026-06-01T12:00:00.000Z"),
  requestedAt: new Date("2026-05-14T12:30:00.000Z"),
  requestIp: "::1",
  userAgent: "Firefox on macOS",
};

/** Dev-only: `pnpm email:dev`. */
export default function AdminEmailChangePreview() {
  return (
    <AdminEmailChangeTemplate
      name={fixtureInput.name}
      url={fixtureInput.url}
      targetEmail={fixtureInput.targetEmail}
      expiresLabel={formatAuthLinkExpiresAt(fixtureInput.expiresAt)}
      requestedLabel={formatAuthLinkExpiresAt(fixtureInput.requestedAt)}
      requestIp={fixtureInput.requestIp}
      userAgent={fixtureInput.userAgent}
    />
  );
}
