import { getSession, signIn } from "next-auth/react";

type LoginCredentials = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type LoginRole = "admin" | "candidate";

type LoginSuccessResult = {
  ok: true;
  role: LoginRole;
  redirectTo: string;
};

type LoginFailureResult = {
  ok: false;
  error: string;
};

type JsonErrorResponse = {
  error?: string;
};

const SESSION_REFRESH_DELAYS_MS = [0, 120, 240, 400];

function getLoginErrorMessage(error: string) {
  const normalized = error.toLowerCase();

  if (normalized.includes("account_setup_required")) {
    return "Finish your account setup from the secure link sent to you before signing in.";
  }

  if (normalized.includes("account_suspended")) {
    return "This account is suspended. Please contact admin.";
  }

  return "Invalid email or password";
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function resolveWorkspace(): Promise<{
  role: LoginRole;
  redirectTo: string;
} | null> {
  for (const delay of SESSION_REFRESH_DELAYS_MS) {
    if (delay > 0) {
      await wait(delay);
    }

    const session = await getSession();
    const role = session?.user?.role;

    if (role === "admin") {
      return { role, redirectTo: "/admin" };
    }

    if (role === "candidate") {
      return { role, redirectTo: "/dashboard" };
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
}: LoginCredentials): Promise<LoginSuccessResult | LoginFailureResult> {
  const result = await signIn("credentials", {
    email,
    password,
    rememberMe: rememberMe ? "true" : "false",
    redirect: false,
  });

  if (result?.error) {
    return {
      ok: false,
      error: getLoginErrorMessage(result.error),
    };
  }

  const workspace = await resolveWorkspace();

  if (!workspace) {
    return {
      ok: false,
      error: "We couldn’t determine your workspace. Please try again.",
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
