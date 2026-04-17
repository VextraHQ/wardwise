import { afterEach, describe, expect, it, vi } from "vitest";
import {
  resolvePostLoginRedirect,
  sanitizeAuthCallbackUrl,
} from "@/lib/auth/redirects";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sanitizeAuthCallbackUrl", () => {
  it("keeps internal relative callback paths", () => {
    expect(sanitizeAuthCallbackUrl("/admin/geo?page=2")).toBe(
      "/admin/geo?page=2",
    );
  });

  it("keeps same-origin absolute callback paths", () => {
    vi.stubEnv("NEXTAUTH_URL", "https://app.wardwise.ng");

    expect(
      sanitizeAuthCallbackUrl("https://app.wardwise.ng/dashboard/reports#top"),
    ).toBe("/dashboard/reports#top");
  });

  it("rejects external callback urls", () => {
    vi.stubEnv("NEXTAUTH_URL", "https://app.wardwise.ng");

    expect(sanitizeAuthCallbackUrl("https://evil.example/admin")).toBeNull();
  });

  it("rejects auth callback loops", () => {
    expect(sanitizeAuthCallbackUrl("/login?callbackUrl=/admin")).toBeNull();
    expect(sanitizeAuthCallbackUrl("/reset-password/token")).toBeNull();
  });
});

describe("resolvePostLoginRedirect", () => {
  it("returns admins to admin callbacks", () => {
    expect(resolvePostLoginRedirect("admin", "/admin/geo?page=2")).toBe(
      "/admin/geo?page=2",
    );
  });

  it("returns candidates to dashboard callbacks", () => {
    expect(resolvePostLoginRedirect("candidate", "/dashboard/forms")).toBe(
      "/dashboard/forms",
    );
  });

  it("falls back when callback does not match the signed-in role", () => {
    expect(resolvePostLoginRedirect("candidate", "/admin/geo")).toBe(
      "/dashboard",
    );
    expect(resolvePostLoginRedirect("admin", "/dashboard/forms")).toBe(
      "/admin",
    );
  });
});
