import { LoginScreen } from "@/components/auth/login-screen";
import { redirectAuthenticatedUser } from "@/lib/auth/guards";
import { sanitizeAuthCallbackUrl } from "@/lib/auth/redirects";
import { createAuthMetadata } from "@/lib/core/metadata";

export const metadata = createAuthMetadata({
  title: "Sign in",
  description: "Secure access for WardWise admins and candidates.",
});

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const callbackUrl = sanitizeAuthCallbackUrl(params?.callbackUrl);

  await redirectAuthenticatedUser(callbackUrl);

  return <LoginScreen callbackUrl={callbackUrl ?? undefined} />;
}
