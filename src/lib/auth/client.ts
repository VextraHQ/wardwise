import { getSession, signIn } from "next-auth/react";
import { getLoginErrorMessage } from "@/lib/auth/errors";
import { resolvePostLoginRedirect } from "@/lib/auth/redirects";
import { isSessionWithinLifetime } from "@/lib/auth/session";

type LoginCredentials = {
  email: string;
  password: string;
  rememberMe: boolean;
  callbackUrl?: string | null;
};

type LoginRole = "admin" | "candidate";

type LoginSuccessResult = {
  ok: true;
  role?: LoginRole;
  redirectTo: string;
};

type LoginFailureResult = {
  ok: false;
  error: string;
};

type JsonErrorResponse = {
  error?: string;
};

const SESSION_REFRESH_DELAYS_MS = [0, 150, 300, 600, 1000, 1500, 2500];

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getLoginFallbackPath(callbackUrl?: string | null) {
  if (!callbackUrl) return "/login";

  return `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

async function resolveWorkspace(callbackUrl?: string | null): Promise<{
  role: LoginRole;
  redirectTo: string;
} | null> {
  for (const delay of SESSION_REFRESH_DELAYS_MS) {
    if (delay > 0) {
      await wait(delay);
    }

    const session = await getSession();
    const role = session?.user?.role;

    if (!session?.user || !isSessionWithinLifetime(session.user)) {
      continue;
    }

    if (role === "admin") {
      return { role, redirectTo: resolvePostLoginRedirect(role, callbackUrl) };
    }

    if (role === "candidate") {
      return { role, redirectTo: resolvePostLoginRedirect(role, callbackUrl) };
    }
  }

  return null;
}

async function extractErrorMessage(response: Response, fallback: string) {
  const body = (await response
    .json()
    .catch(() => null)) as JsonErrorResponse | null;

  return body?.error || fallback;
}

export async function loginWithCredentials({
  email,
  password,
  rememberMe,
  callbackUrl,
}: LoginCredentials): Promise<LoginSuccessResult | LoginFailureResult> {
  const result = await signIn("credentials", {
    email: email.trim().toLowerCase(),
    password,
    rememberMe: rememberMe ? "true" : "false",
    callbackUrl: getLoginFallbackPath(callbackUrl),
    redirect: false,
  });

  if (result?.error) {
    return {
      ok: false,
      error: getLoginErrorMessage(result.error),
    };
  }

  const workspace = await resolveWorkspace(callbackUrl);

  if (!workspace) {
    return {
      ok: true,
      redirectTo: getLoginFallbackPath(callbackUrl),
    };
  }

  return {
    ok: true,
    role: workspace.role,
    redirectTo: workspace.redirectTo,
  };
}

export async function requestPasswordReset(email: string) {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(
        response,
        "Password recovery is unavailable right now. Please contact your campaign admin.",
      ),
    );
  }

  return response.json().catch(() => ({ success: true }));
}

export async function completePasswordSetup({
  token,
  password,
}: {
  token: string;
  password: string;
}) {
  const response = await fetch("/api/auth/complete-password-setup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, "Unable to complete password setup."),
    );
  }

  return response.json().catch(() => ({ success: true }));
}
