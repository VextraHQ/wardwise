"use client";

import posthog, { type CaptureResult, type Properties } from "posthog-js";
import type { RouteDescriptor } from "@/lib/analytics/routes";

type AnalyticsEventName =
  | "$pageview"
  | "consent_updated"
  | "login_submitted"
  | "login_succeeded"
  | "login_failed"
  | "collect_started"
  | "collect_progress_restored"
  | "collect_step_viewed"
  | "collect_submission_queued_offline"
  | "collect_sync_requested"
  | "collect_sync_completed"
  | "collect_submission_succeeded"
  | "collect_submission_failed"
  | "admin_candidate_created"
  | "admin_candidate_creation_failed"
  | "admin_campaign_created"
  | "admin_campaign_creation_failed"
  | "admin_campaign_updated"
  | "admin_campaign_deleted"
  | "admin_canvasser_added"
  | "admin_canvasser_removed"
  | "admin_submission_updated"
  | "admin_submission_deleted"
  | "admin_submission_bulk_action";

type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

const DENYLISTED_PROPERTIES = [
  "$current_url",
  "$pathname",
  "$host",
  "$referrer",
  "$referring_domain",
  "$initial_referrer",
  "$initial_referring_domain",
  "$current_url_search",
  "$current_url_pathname",
  "current_url",
  "pathname",
  "host",
  "referrer",
  "referring_domain",
] as const;

let analyticsInitialized = false;

function isBrowser() {
  return typeof window !== "undefined";
}

function getPostHogProjectKey() {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_TOKEN
  );
}

function isEnabledEnvironment() {
  const hasConfig =
    Boolean(getPostHogProjectKey()) &&
    Boolean(process.env.NEXT_PUBLIC_POSTHOG_HOST);
  const allowInCurrentEnv =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS_DEV === "true";

  return hasConfig && allowInCurrentEnv;
}

function sanitizeProperties(properties: AnalyticsProperties = {}): Properties {
  const next: Properties = {};

  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined) continue;
    if (
      (DENYLISTED_PROPERTIES as readonly string[]).includes(key) ||
      key.toLowerCase().includes("url")
    ) {
      continue;
    }

    next[key] = value;
  }

  return next;
}

function sanitizeCaptureResult(
  captureResult: CaptureResult | null,
): CaptureResult | null {
  if (!captureResult) return null;

  for (const key of DENYLISTED_PROPERTIES) {
    delete captureResult.properties[key];
  }

  return captureResult;
}

export function createAnalyticsId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `analytics_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function enableAnalytics() {
  if (!isBrowser() || !isEnabledEnvironment()) {
    return false;
  }

  const projectKey = getPostHogProjectKey();
  if (!projectKey) {
    return false;
  }

  if (!analyticsInitialized) {
    posthog.init(projectKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_exceptions: false,
      disable_session_recording: true,
      person_profiles: "identified_only",
      property_denylist: [...DENYLISTED_PROPERTIES],
      before_send: sanitizeCaptureResult,
      loaded: () => undefined,
    });
    analyticsInitialized = true;
  }

  posthog.clear_opt_in_out_capturing();
  posthog.opt_in_capturing({ captureEventName: false });

  return true;
}

export function disableAnalytics() {
  if (!analyticsInitialized) return;

  posthog.opt_out_capturing();
  posthog.reset(true);
}

export function track(
  eventName: AnalyticsEventName,
  properties: AnalyticsProperties = {},
) {
  if (!analyticsInitialized || !posthog.is_capturing()) return;

  posthog.capture(eventName, sanitizeProperties(properties));
}

export function trackPageview(
  route: RouteDescriptor,
  properties: AnalyticsProperties = {},
) {
  track("$pageview", {
    route_group: route.group,
    route_name: route.name,
    ...properties,
  });
}

export function identifyAuthenticatedUser(user: {
  id: string;
  role?: string;
  candidateId?: string;
}) {
  if (!analyticsInitialized || !posthog.is_capturing()) return;

  posthog.identify(
    user.id,
    sanitizeProperties({
      role: user.role ?? "unknown",
      candidate_id: user.candidateId ?? null,
    }),
  );
}

export function resetAnalyticsIdentity() {
  if (!analyticsInitialized) return;

  const wasCapturing = posthog.is_capturing();
  posthog.reset(true);

  if (wasCapturing) {
    posthog.clear_opt_in_out_capturing();
    posthog.opt_in_capturing({ captureEventName: false });
  }
}
