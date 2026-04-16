import { ForgotPasswordScreen } from "@/components/auth/forgot-password-screen";
import { redirectAuthenticatedUser } from "@/lib/auth/guards";
import { createAuthMetadata } from "@/lib/core/metadata";

export const metadata = createAuthMetadata({
  title: "Forgot password",
  description: "Request a password reset link for your WardWise account.",
});

export default async function ForgotPasswordPage() {
  await redirectAuthenticatedUser();

  return <ForgotPasswordScreen />;
}
