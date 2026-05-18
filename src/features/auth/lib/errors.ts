export const AUTH_LOGIN_ERRORS = {
  ACCOUNT_PENDING: "ACCOUNT_PENDING",
  ACCOUNT_SETUP_REQUIRED: "ACCOUNT_SETUP_REQUIRED",
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
} as const;

export type AuthLoginErrorCode =
  (typeof AUTH_LOGIN_ERRORS)[keyof typeof AUTH_LOGIN_ERRORS];

export function getCandidateStatusLoginError(
  onboardingStatus?: string | null,
): AuthLoginErrorCode {
  if (onboardingStatus === "suspended") {
    return AUTH_LOGIN_ERRORS.ACCOUNT_SUSPENDED;
  }

  if (onboardingStatus === "credentials_sent") {
    return AUTH_LOGIN_ERRORS.ACCOUNT_SETUP_REQUIRED;
  }

  return AUTH_LOGIN_ERRORS.ACCOUNT_PENDING;
}

export function getLoginErrorMessage(error: string) {
  const normalized = error.toLowerCase();

  if (normalized.includes(AUTH_LOGIN_ERRORS.ACCOUNT_PENDING.toLowerCase())) {
    return "Your account is not ready yet. Please contact your campaign admin.";
  }

  if (
    normalized.includes(AUTH_LOGIN_ERRORS.ACCOUNT_SETUP_REQUIRED.toLowerCase())
  ) {
    return "Finish your account setup from the secure link, or request a new reset link.";
  }

  if (normalized.includes(AUTH_LOGIN_ERRORS.ACCOUNT_SUSPENDED.toLowerCase())) {
    return "This account is suspended. Please contact admin.";
  }

  if (
    normalized.includes("credentialssignin") ||
    normalized.includes("invalid")
  ) {
    return "Invalid email or password";
  }

  return "Sign-in could not be completed. Please refresh and try again.";
}
