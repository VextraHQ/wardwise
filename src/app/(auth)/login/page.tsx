import { LoginScreen } from "@/components/auth/login-screen";
import { redirectAuthenticatedUser } from "@/lib/auth/guards";

export default async function LoginPage() {
  await redirectAuthenticatedUser();

  return <LoginScreen />;
}
