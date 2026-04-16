import { getAuthLinkContext } from "@/lib/auth/links";
import {
  PasswordSetupScreen,
  PasswordSetupUnavailable,
} from "@/components/auth/password-setup-screen";
import { createAuthMetadata } from "@/lib/core/metadata";

export const metadata = createAuthMetadata({
  title: "Reset password",
  noArchive: true,
});

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const context = await getAuthLinkContext(token);

  if (!context || !context.isValid) {
    return (
      <PasswordSetupUnavailable
        title="This secure link is no longer valid"
        description="Request a fresh password reset link or ask your campaign admin to resend your secure account access."
      />
    );
  }

  return (
    <PasswordSetupScreen
      token={token}
      type={context.type}
      name={
        context.user.name || context.user.candidate?.name || "WardWise User"
      }
      email={context.user.email}
      expiresLabel={context.expiresAt.toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      })}
    />
  );
}
