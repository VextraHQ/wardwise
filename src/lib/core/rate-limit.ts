import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedis();

/**
 * Rate limiter for public form submissions.
 * 10 submissions per minute per IP.
 */
export const submitRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "rl:submit",
    })
  : null;

/**
 * Rate limiter for login attempts.
 * 5 login attempts per minute per IP.
 */
export const loginRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "rl:auth-login",
    })
  : null;

/**
 * Rate limiter for recovery requests.
 * 3 attempts per 15 minutes per IP.
 */
export const recoveryRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "15 m"),
      prefix: "rl:auth-recovery",
    })
  : null;

/**
 * Rate limiter for password setup / reset completion attempts.
 * 5 attempts per 10 minutes per IP.
 */
export const passwordSetupRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      prefix: "rl:auth-password-setup",
    })
  : null;

/**
 * Rate limiter for report passcode unlock attempts.
 * 5 attempts per minute per IP.
 */
export const reportUnlockRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "rl:report-unlock",
    })
  : null;

/**
 * Extract client IP from request headers.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}
