import { ForgotPasswordScreen } from "@/features/auth/components/forgot-password-screen";
import { redirectAuthenticatedUser } from "@/features/auth/lib/guards";
import { createAuthMetadata } from "@/lib/core/metadata";

export const metadata = createAuthMetadata({
  title: "Forgot password",
  description: "Request a password reset link for your WardWise account.",
});

export default async function ForgotPasswordPage() {
  await redirectAuthenticatedUser();

  return <ForgotPasswordScreen />;
}
