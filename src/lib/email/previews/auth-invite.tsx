import {
  AuthLinkTemplate,
  formatAuthLinkExpiresAt,
} from "@/lib/email/templates/auth-link";

const expiresAt = new Date("2026-06-01T12:00:00.000Z");

/** Dev-only: `pnpm email:dev`. */
export default function AuthInvitePreview() {
  return (
    <AuthLinkTemplate
      type="invite"
      name="Ada"
      url="https://wardwise.ng/set-password/preview-token"
      expiresLabel={formatAuthLinkExpiresAt(expiresAt)}
    />
  );
}
