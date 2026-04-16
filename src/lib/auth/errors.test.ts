import { describe, expect, it } from "vitest";
import {
  AUTH_LOGIN_ERRORS,
  getCandidateStatusLoginError,
  getLoginErrorMessage,
} from "./errors";

describe("getCandidateStatusLoginError", () => {
  it("maps pending and missing statuses to account pending", () => {
    expect(getCandidateStatusLoginError("pending")).toBe(
      AUTH_LOGIN_ERRORS.ACCOUNT_PENDING,
    );
    expect(getCandidateStatusLoginError(null)).toBe(
      AUTH_LOGIN_ERRORS.ACCOUNT_PENDING,
    );
  });

  it("maps credentials_sent to setup required", () => {
    expect(getCandidateStatusLoginError("credentials_sent")).toBe(
      AUTH_LOGIN_ERRORS.ACCOUNT_SETUP_REQUIRED,
    );
  });

  it("maps suspended to account suspended", () => {
    expect(getCandidateStatusLoginError("suspended")).toBe(
      AUTH_LOGIN_ERRORS.ACCOUNT_SUSPENDED,
    );
  });
});

describe("getLoginErrorMessage", () => {
  it("returns balanced copy for known account states", () => {
    expect(getLoginErrorMessage("ACCOUNT_PENDING")).toBe(
      "Your account is not ready yet. Please contact your campaign admin.",
    );
    expect(getLoginErrorMessage("ACCOUNT_SETUP_REQUIRED")).toBe(
      "Finish your account setup from the secure link, or request a new reset link.",
    );
    expect(getLoginErrorMessage("ACCOUNT_SUSPENDED")).toBe(
      "This account is suspended. Please contact admin.",
    );
  });

  it("keeps invalid credentials generic", () => {
    expect(getLoginErrorMessage("CredentialsSignin")).toBe(
      "Invalid email or password",
    );
  });
});
