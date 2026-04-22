"use client";

import { type ComponentProps, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  getConsentValue,
  openCookieSettings,
  setConsentValue,
  subscribeToConsentChanges,
  subscribeToCookieSettingsOpens,
  type ConsentValue,
} from "@/lib/analytics/consent";
import { cn } from "@/lib/utils";

/**
 * Cookie Consent Banner
 *
 * How it works:
 * 1. On first visit, show a bottom notice after a short delay
 * 2. User can accept analytics, decline analytics, or customize preferences
 * 3. Store their preference in a first-party cookie
 * 4. Users can reopen cookie settings any time from elsewhere in the app
 *
 * The consent value is used to conditionally load analytics.
 * Check consent with: getConsentValue()
 */

type CookieSettingsButtonProps = ComponentProps<typeof Button> & {
  label?: string;
};

const ANALYTICS_DESCRIPTION =
  "Optional analytics helps us understand product usage with privacy-first metrics only. We do not enable session replay or capture form contents.";

export function CookieSettingsButton({
  label = "Cookie settings",
  className,
  onClick,
  type,
  ...props
}: CookieSettingsButtonProps) {
  return (
    <Button
      type={type ?? "button"}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        openCookieSettings();
      }}
      className={cn(className)}
      {...props}
    >
      {label}
    </Button>
  );
}

export function FooterCookieSettingsButton({
  label = "Cookie settings",
  className,
  ...props
}: CookieSettingsButtonProps) {
  return (
    <CookieSettingsButton
      label={label}
      variant="ghost"
      size="sm"
      className={cn(
        "text-muted-foreground hover:text-primary h-auto rounded-sm px-2 py-1.5 text-[11px] font-semibold sm:px-1 sm:py-0.5",
        className,
      )}
      {...props}
    />
  );
}

export function CookieConsentBanner() {
  const [consent, setConsent] = useState<ConsentValue>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  const syncConsentState = () => {
    const nextConsent = getConsentValue();
    setConsent(nextConsent);
    setAnalyticsEnabled(nextConsent === "accepted");
    return nextConsent;
  };

  useEffect(() => {
    let timer: number | null = null;

    const syncBannerState = () => {
      const nextConsent = syncConsentState();
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }

      if (nextConsent === null) {
        timer = window.setTimeout(() => setShowBanner(true), 800);
      } else {
        setShowBanner(false);
      }
    };

    syncBannerState();

    const unsubscribe = subscribeToConsentChanges(() => {
      syncBannerState();
    });

    return () => {
      unsubscribe();
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToCookieSettingsOpens(() => {
      syncConsentState();
      setShowPreferences(true);
    });

    return unsubscribe;
  }, []);

  const applyConsent = (value: Exclude<ConsentValue, null>) => {
    setConsentValue(value);
    setConsent(value);
    setAnalyticsEnabled(value === "accepted");
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleOpenPreferences = () => {
    syncConsentState();
    setShowPreferences(true);
  };

  const handleSavePreferences = () => {
    applyConsent(analyticsEnabled ? "accepted" : "declined");
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-background/55 fixed inset-0 z-40 backdrop-blur-[3px]"
            >
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                }}
              />
            </motion.div>

            <motion.section
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed right-0 bottom-0 left-0 z-50 max-h-[calc(100dvh-0.75rem)] overflow-y-auto overscroll-contain px-3 pb-3 sm:max-h-[calc(100dvh-1rem)] sm:px-4 sm:pb-4"
              aria-label="Cookie consent"
            >
              <div className="border-border/60 bg-card relative mx-auto w-full max-w-5xl overflow-hidden border shadow-none">
                <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
                <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

                <div className="border-border/50 bg-muted/20 border-b px-4 py-3 sm:px-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="border-primary/40 flex items-center gap-3 border-l-2 pl-3">
                      <span className="text-primary font-mono text-[10px] font-bold tracking-widest uppercase">
                        Privacy Notice
                      </span>
                    </div>
                    <Link
                      href="/cookies"
                      className="text-muted-foreground hover:text-primary font-mono text-[10px] font-bold tracking-widest uppercase transition-colors"
                    >
                      Cookie Policy
                    </Link>
                  </div>
                </div>

                <div className="grid gap-4 p-4 sm:gap-5 sm:p-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <h2 className="text-foreground text-sm font-bold tracking-tight uppercase sm:text-base">
                        Keep essential cookies on. Analytics is your choice.
                      </h2>
                      <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
                        Essential cookies keep sign-in and security working.
                        Optional analytics helps us improve WardWise without
                        capturing form contents.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                          Essential Cookies
                        </span>
                        <span className="bg-primary/10 text-primary rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase">
                          Always On
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                          Analytics Cookies
                        </span>
                        <span className="text-muted-foreground rounded-sm border px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase">
                          Optional
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:self-center">
                    <Button
                      size="sm"
                      onClick={() => applyConsent("accepted")}
                      className="h-10 w-full rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
                    >
                      Accept all
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenPreferences}
                      className="h-10 w-full rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
                    >
                      Customize
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applyConsent("declined")}
                      className="h-10 w-full rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
                    >
                      Reject all
                    </Button>
                  </div>
                </div>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="border-border/60 max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-2xl gap-0 overflow-hidden rounded-none p-0 shadow-none sm:w-full">
          <div className="bg-card relative flex max-h-[calc(100dvh-1rem)] flex-col">
            <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
            <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

            <DialogHeader className="border-border/50 bg-muted/20 space-y-3 border-b px-4 py-4 text-left sm:px-5">
              <div className="border-primary/40 flex items-center gap-3 border-l-2 pl-3">
                <span className="text-primary font-mono text-[10px] font-bold tracking-widest uppercase">
                  Cookie Settings
                </span>
                <div className="bg-primary/60 size-1.5 rounded-[1px]" />
                <span className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
                  Adjustable Anytime
                </span>
              </div>
              <DialogTitle className="text-foreground text-lg font-bold tracking-tight uppercase">
                Choose how WardWise uses optional cookies
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                Essential cookies keep the platform secure and usable. Optional
                analytics helps us improve product flows with aggregate usage
                signals only.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              <div className="border-border/50 bg-muted/10 rounded-sm border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                        Essential Cookies
                      </p>
                      <span className="bg-primary/10 text-primary rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase">
                        Always On
                      </span>
                    </div>
                    <p className="text-foreground text-sm font-semibold">
                      Core access, security, and field reliability
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Required for authentication, security protections, and
                      operational campaign workflows.
                    </p>
                  </div>
                  <Switch
                    checked
                    disabled
                    aria-label="Essential cookies always on"
                  />
                </div>
              </div>

              <div className="border-border/50 bg-muted/10 rounded-sm border border-dashed p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                        Analytics Cookies
                      </p>
                      <span className="text-muted-foreground rounded-sm border px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase">
                        Optional
                      </span>
                    </div>
                    <p className="text-foreground text-sm font-semibold">
                      Product improvement only
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {ANALYTICS_DESCRIPTION}
                    </p>
                  </div>
                  <Switch
                    checked={analyticsEnabled}
                    onCheckedChange={setAnalyticsEnabled}
                    aria-label="Enable analytics cookies"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                  Saved Choice
                </p>
                <p className="text-foreground text-sm font-semibold">
                  {consent === "accepted"
                    ? "Analytics allowed"
                    : consent === "declined"
                      ? "Analytics declined"
                      : "No choice saved yet"}
                </p>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  You can revisit this setting any time from the footer, legal
                  pages, or app navigation.
                </p>
              </div>
            </div>

            <DialogFooter className="border-border/50 bg-muted/20 flex-col gap-2 border-t px-4 py-4 sm:flex-row sm:justify-between sm:px-5">
              <Button
                variant="ghost"
                onClick={() => applyConsent("declined")}
                className="w-full rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
              >
                Reject all
              </Button>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => applyConsent("accepted")}
                  className="w-full rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                >
                  Accept all
                </Button>
                <Button
                  onClick={handleSavePreferences}
                  className="w-full rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                >
                  Save Preferences
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
