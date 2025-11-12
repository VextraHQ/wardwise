"use client";

import Link from "next/link";
import { HiShieldCheck, HiEye, HiLockClosed } from "react-icons/hi";
import { MapIcon } from "@heroicons/react/24/outline";

export function VoterFooter() {
  return (
    <footer className="border-border/40 bg-muted/20 relative border-t">
      {/* Subtle accent */}
      <div
        className="bg-primary/5 absolute top-0 -left-20 h-40 w-40 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          {/* Brand & Description */}
          <div className="max-w-sm space-y-3">
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label="WardWise home"
            >
              <span className="relative flex size-12 items-center justify-center">
                <span className="border-border bg-card absolute inset-0 rounded-full border" />
                <span className="from-primary relative flex size-9 items-center justify-center rounded-full bg-linear-to-br via-[#2f7f6b] to-[#163a30] text-white">
                  <MapIcon className="size-5" />
                </span>
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-foreground text-base font-semibold tracking-[0.18em] uppercase">
                  WardWise
                </span>
                <span className="text-muted-foreground text-[11px] font-medium">
                  Civic Intelligence Platform
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Secure voter registration with ward-level precision. Your data is
              encrypted, verified, and protected.
            </p>
          </div>

          {/* Trust badges */}
          <div className="grid gap-6 sm:grid-cols-3 lg:gap-8">
            <div className="flex items-start gap-2.5">
              <HiShieldCheck className="text-primary mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h4 className="text-foreground text-sm font-medium">
                  Privacy First
                </h4>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Your data stays secure
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <HiEye className="text-primary mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h4 className="text-foreground text-sm font-medium">
                  Transparent
                </h4>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Full control of your info
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <HiLockClosed className="text-primary mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h4 className="text-foreground text-sm font-medium">
                  Verified
                </h4>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  One person, one vote
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-border/40 mt-8 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} WardWise. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/help"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
