import { readAdminEmailChangeTokenPreview } from "@/lib/auth/links";
import { ConfirmEmailChangeScreen } from "@/components/auth/confirm-email-change-screen";
import { PasswordSetupUnavailable } from "@/components/auth/password-setup-screen";
import { createAuthMetadata } from "@/lib/core/metadata";

export const metadata = createAuthMetadata({
  title: "Confirm email change",
  noArchive: true,
});

export default async function ConfirmEmailChangePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const preview = await readAdminEmailChangeTokenPreview(token);

  if (!preview || !preview.isValid) {
    return (
      <PasswordSetupUnavailable
        title="This confirmation link is no longer valid"
        description="Request a new email change from your admin account page, then click the link in the new confirmation email."
      />
    );
  }

  const expiresLabel = preview.expiresAt.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <ConfirmEmailChangeScreen
      token={token}
      targetEmail={preview.targetEmail}
      expiresLabel={expiresLabel}
    />
  );
}
