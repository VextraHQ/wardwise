import {
  AdminEmailChangeNoticeTemplate,
  type AdminEmailChangeNoticeEmailInput,
} from "@/lib/email/templates/admin-email-change-notice";
import { formatAuthLinkExpiresAt } from "@/lib/email/templates/auth-link";

const fixtureInput: AdminEmailChangeNoticeEmailInput = {
  name: "Ada",
  currentEmail: "admin@wardwise.ng",
  targetEmail: "ada@wardwise.ng",
  requestedAt: new Date("2026-05-14T12:30:00.000Z"),
  requestIp: "::1",
  userAgent: "Firefox on macOS",
};

/** Dev-only: `pnpm email:dev`. */
export default function AdminEmailChangeNoticePreview() {
  return (
    <AdminEmailChangeNoticeTemplate
      name={fixtureInput.name}
      currentEmail={fixtureInput.currentEmail}
      targetEmail={fixtureInput.targetEmail}
      requestedLabel={formatAuthLinkExpiresAt(fixtureInput.requestedAt)}
      requestIp={fixtureInput.requestIp}
      userAgent={fixtureInput.userAgent}
    />
  );
}
