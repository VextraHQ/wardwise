"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  getConsentValue,
  subscribeToConsentChanges,
  type ConsentValue,
} from "@/lib/analytics/consent";
import {
  disableAnalytics,
  enableAnalytics,
  identifyAuthenticatedUser,
  resetAnalyticsIdentity,
  track,
  trackPageview,
} from "@/lib/analytics/client";
import { getAnalyticsRoute } from "@/lib/analytics/routes";

export function AnalyticsProvider() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const sessionUser = session?.user;
  const [consent, setConsent] = useState<ConsentValue>(null);
  const lastConsentRef = useRef<ConsentValue>(null);
  const lastTrackedRouteRef = useRef<string | null>(null);
  const lastIdentifiedUserRef = useRef<string | null>(null);

  useEffect(() => {
    const syncConsent = () => {
      setConsent((current) => {
        const next = getConsentValue();
        return current === next ? current : next;
      });
    };

    syncConsent();

    const unsubscribe = subscribeToConsentChanges(syncConsent);
    const handleFocus = () => syncConsent();
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncConsent();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const previousConsent = lastConsentRef.current;

    if (consent === "accepted") {
      const enabled = enableAnalytics();
      if (enabled && previousConsent && previousConsent !== "accepted") {
        track("consent_updated", { value: "accepted" });
      }
    } else if (previousConsent === "accepted") {
      disableAnalytics();
      lastTrackedRouteRef.current = null;
      lastIdentifiedUserRef.current = null;
    }

    lastConsentRef.current = consent;
  }, [consent]);

  useEffect(() => {
    if (consent !== "accepted") return;
    if (status === "loading") return;

    if (status !== "authenticated" || !sessionUser) {
      if (lastIdentifiedUserRef.current) {
        resetAnalyticsIdentity();
        lastTrackedRouteRef.current = null;
        lastIdentifiedUserRef.current = null;
      }
      return;
    }

    identifyAuthenticatedUser({
      id: sessionUser.id,
      role: sessionUser.role,
      candidateId: sessionUser.candidateId,
    });
    lastIdentifiedUserRef.current = sessionUser.id;
  }, [consent, sessionUser, status]);

  useEffect(() => {
    if (consent !== "accepted") return;
    if (!pathname || status === "loading") return;

    const route = getAnalyticsRoute(pathname);
    const authState =
      status === "authenticated" ? "authenticated" : "anonymous";
    const routeKey = `${route.name}:${authState}`;

    if (lastTrackedRouteRef.current === routeKey) return;

    trackPageview(route, { auth_state: authState });
    lastTrackedRouteRef.current = routeKey;
  }, [consent, pathname, status]);

  return null;
}
