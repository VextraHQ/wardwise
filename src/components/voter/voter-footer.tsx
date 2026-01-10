"use client";

import Link from "next/link";
import { HiShieldCheck, HiEye, HiLockClosed, HiMap } from "react-icons/hi";

export function VoterFooter() {
  return (
    <footer className="border-border/40 bg-background relative border-t pt-12 pb-10">
      {/* Structural Anchor Line */}
      <div
        className="bg-border/50 absolute top-0 left-1/2 hidden h-full w-px -translate-x-1/2 lg:block"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          {/* Brand Identity */}
          <div className="space-y-5">
            <Link
              href="/"
              className="group flex items-center gap-3.5"
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
            <p className="text-muted-foreground max-w-xs text-[12px] leading-relaxed font-medium">
              National infrastructure for ward-level democratic participation.
              Built for secure identity and campaign integrity.
            </p>
          </div>

          {/* Trust Modules */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {[
              { icon: HiShieldCheck, label: "Secure Vault", id: "SEC_ID" },
              { icon: HiEye, label: "Privacy First", id: "PRIV_ID" },
              { icon: HiLockClosed, label: "Verified Data", id: "DATA_ID" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3.5">
                <div className="bg-primary/5 text-primary border-primary/20 flex size-8 items-center justify-center rounded-lg border">
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
        <div className="border-border/60 mt-8 flex flex-col items-center justify-between gap-6 border-t pt-8 sm:flex-row">
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
                className="text-muted-foreground hover:text-primary font-mono text-[9px] font-bold tracking-widest uppercase transition-colors"
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
