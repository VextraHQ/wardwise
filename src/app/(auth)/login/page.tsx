import { LoginScreen } from "@/components/auth/login-screen";
import { redirectAuthenticatedUser } from "@/lib/auth/guards";
import { createAuthMetadata } from "@/lib/core/metadata";

export const metadata = createAuthMetadata({
  title: "Sign in",
  description: "Secure access for WardWise admins and candidates.",
});

export default async function LoginPage() {
  await redirectAuthenticatedUser();

  return <LoginScreen />;
}
