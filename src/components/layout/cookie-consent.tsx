"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";

/**
 * Cookie Consent Banner
 *
 * How it works:
 * 1. On first visit, show the banner with a backdrop overlay
 * 2. User clicks "Accept" or "Decline"
 * 3. Store their preference in localStorage
 * 4. On subsequent visits, don't show the banner
 *
 * The consent value is used to conditionally load analytics.
 * Check consent with: getConsentValue()
 */

const CONSENT_KEY = "wardwise-cookie-consent";

export type ConsentValue = "accepted" | "declined" | null;

export function getConsentValue(): ConsentValue {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "accepted" || value === "declined") return value;
  return null;
}

export function setConsentValue(value: "accepted" | "declined") {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, value);
  // Dispatch event so other components can react
  window.dispatchEvent(
    new CustomEvent("cookie-consent-change", { detail: value }),
  );
}

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = getConsentValue();
    if (consent === null) {
      // Small delay to avoid flash on page load
      const timer = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setConsentValue("accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    setConsentValue("declined");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-foreground/10 fixed inset-0 z-50 backdrop-blur-sm"
            onClick={handleDecline}
          />

          {/* Banner */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed right-0 bottom-0 left-0 z-50"
          >
            <div className="border-border bg-card border-t shadow-2xl">
              {/* Architectural corners */}
              <div className="border-primary absolute top-0 left-0 size-6 border-t-2 border-l-2" />
              <div className="border-primary absolute top-0 right-0 size-6 border-t-2 border-r-2" />

              <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Content */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary size-1.5 rounded-full" />
                      <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                        Privacy Notice
                      </span>
                    </div>
                    <p className="text-foreground text-sm font-medium">
                      This website uses cookies to enhance your experience.
                    </p>
                    <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                      We use essential cookies for site functionality and
                      analytics cookies to understand how you interact with our
                      platform.{" "}
                      <Link
                        href="/cookies"
                        className="text-primary hover:underline"
                      >
                        View Cookie Policy
                      </Link>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDecline}
                      className="text-muted-foreground text-xs"
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAccept}
                      className="min-w-[100px] text-xs"
                    >
                      Accept All
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
