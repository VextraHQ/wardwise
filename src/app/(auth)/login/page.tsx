import { LoginScreen } from "@/components/auth/login-screen";
import { redirectAuthenticatedUser } from "@/lib/auth/guards";
import { sanitizeAuthCallbackUrl } from "@/lib/auth/redirects";
import { createAuthMetadata } from "@/lib/core/metadata";

export const metadata = createAuthMetadata({
  title: "Sign in",
  description: "Secure access for WardWise admins and candidates.",
});

type LoginNotice = "email-changed" | "password-changed";

function parseNotice(value: string | string[] | undefined): LoginNotice | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "email-changed" || raw === "password-changed") return raw;
  return null;
}

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string | string[];
    notice?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const callbackUrl = sanitizeAuthCallbackUrl(params?.callbackUrl);
  const notice = parseNotice(params?.notice);

  await redirectAuthenticatedUser(callbackUrl);

  return (
    <LoginScreen
      callbackUrl={callbackUrl ?? undefined}
      notice={notice ?? undefined}
    />
  );
}
