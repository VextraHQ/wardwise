import {
  AuthLinkTemplate,
  formatAuthLinkExpiresAt,
} from "@/lib/email/templates/auth-link";

const expiresAt = new Date("2026-06-01T12:00:00.000Z");

/** Dev-only: `pnpm email:dev`. */
export default function AuthPasswordResetPreview() {
  return (
    <AuthLinkTemplate
      type="password_reset"
      name="Ada"
      url="https://wardwise.ng/reset-password/preview-token"
      expiresLabel={formatAuthLinkExpiresAt(expiresAt)}
    />
  );
}
