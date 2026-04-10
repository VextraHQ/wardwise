import { ForgotPasswordScreen } from "@/components/auth/forgot-password-screen";
import { redirectAuthenticatedUser } from "@/lib/auth/guards";

export default async function ForgotPasswordPage() {
  await redirectAuthenticatedUser();

  return <ForgotPasswordScreen />;
}
