"use client";

import Link from "next/link";
import { HiShieldCheck, HiEye, HiLockClosed } from "react-icons/hi";
import { HiMap } from "react-icons/hi";

export function VoterFooter() {
  return (
    <footer className="border-border/40 bg-muted/20 relative border-t">
      {/* Subtle accent */}
      <div
        className="bg-primary/5 absolute top-0 -left-20 h-40 w-40 rounded-full blur-3xl"
        aria-hidden={true}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          {/* Brand & Description */}
          <div className="max-w-sm space-y-3">
            <Link
              href="/"
              className="group flex items-center gap-3"
              aria-label="WardWise home"
            >
              <div className="border-primary/20 bg-primary/5 text-primary flex h-10 w-10 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11">
                <HiMap className="h-6 w-6" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-foreground text-lg font-black tracking-tight sm:text-xl">
                  WardWise
                </span>
                <span className="text-muted-foreground truncate text-[10px] font-medium sm:text-[10.5px]">
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
              <HiShieldCheck className="text-primary size-5" />
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
              <HiEye className="text-primary size-5" />
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
              <HiLockClosed className="text-primary size-5" />
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
