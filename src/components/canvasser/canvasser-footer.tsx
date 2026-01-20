"use client";

import Link from "next/link";
import { HiShieldCheck, HiClipboardCheck, HiUsers } from "react-icons/hi";

export function CanvasserFooter() {
  return (
    <footer className="border-border/40 bg-background relative border-t pt-12 pb-10">
      {/* Structural Amber Anchor Line */}
      <div
        className="absolute top-0 left-1/2 hidden h-full w-px -translate-x-1/2 bg-amber-500/20 lg:block"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          {/* Brand Identity */}
          <div className="space-y-5">
            <Link
              href="/canvasser"
              className="group flex items-center gap-2.5 sm:gap-3"
              aria-label="WardWise Canvasser Home"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-600 transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11">
                <HiUsers className="h-6 w-6" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-foreground text-lg font-black tracking-tight sm:text-xl">
                  WardWise
                </span>
                <span className="truncate text-[10px] font-medium text-amber-600/80 sm:text-[10.5px]">
                  Civic Intelligence Platform
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-xs text-[12px] leading-relaxed font-medium">
              Field agent platform for voter registration and campaign outreach.
              Trusted by candidates nationwide.
            </p>
          </div>

          {/* Trust Modules - Canvasser Theme */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {[
              {
                icon: HiClipboardCheck,
                label: "Verified Agent",
                id: "AGENT_ID",
              },
              { icon: HiShieldCheck, label: "Secure Data", id: "SEC_ID" },
              { icon: HiUsers, label: "Voter Privacy", id: "PRIV_ID" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3.5">
                <div className="flex size-8 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-600">
                  <item.icon className="size-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground font-mono text-[8px] font-black tracking-widest uppercase">
                    {item.id}
                  </p>
                  <p className="text-foreground text-[10px] font-black tracking-tight uppercase">
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legal & Status Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-amber-500/20 pt-8 sm:flex-row">
          <div className="flex items-center gap-5">
            <p className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
              © {new Date().getFullYear()} WardWise. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Use", href: "/terms" },
              { label: "Support", href: "/help" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase transition-colors hover:text-amber-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
