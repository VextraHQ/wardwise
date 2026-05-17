import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyTurnstileToken } from "./turnstile";

const originalFetch = global.fetch;

beforeEach(() => {
  delete process.env.TURNSTILE_SITE_KEY;
  delete process.env.TURNSTILE_SECRET_KEY;
  vi.stubEnv("NODE_ENV", "test");
  vi.restoreAllMocks();
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.unstubAllEnvs();
});

describe("verifyTurnstileToken", () => {
  it("fails closed in non-development environments when config is missing", async () => {
    const result = await verifyTurnstileToken({ token: "token-1" });
    expect(result).toEqual({ success: false, reason: "not_configured" });
  });

  it("allows local bypass in development when config is missing", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const result = await verifyTurnstileToken({ token: "" });
    expect(result).toEqual({ success: true, bypassed: true });
  });

  it("requires a token when config exists", async () => {
    process.env.TURNSTILE_SITE_KEY = "site-key";
    process.env.TURNSTILE_SECRET_KEY = "secret-key";

    const result = await verifyTurnstileToken({ token: "" });
    expect(result).toEqual({ success: false, reason: "missing_token" });
  });

  it("returns success when Cloudflare verifies the token", async () => {
    process.env.TURNSTILE_SITE_KEY = "site-key";
    process.env.TURNSTILE_SECRET_KEY = "secret-key";
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ) as unknown as typeof fetch;

    const result = await verifyTurnstileToken({
      token: "token-1",
      ip: "127.0.0.1",
    });

    expect(result).toEqual({ success: true, bypassed: false });
  });

  it("returns invalid when Cloudflare rejects the token", async () => {
    process.env.TURNSTILE_SITE_KEY = "site-key";
    process.env.TURNSTILE_SECRET_KEY = "secret-key";
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ) as unknown as typeof fetch;

    const result = await verifyTurnstileToken({ token: "token-1" });
    expect(result).toEqual({ success: false, reason: "invalid" });
  });
});
