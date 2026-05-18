import { LoginScreen } from "@/features/auth/components/login-screen";
import { redirectAuthenticatedUser } from "@/features/auth/lib/guards";
import { sanitizeAuthCallbackUrl } from "@/features/auth/lib/redirects";
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
