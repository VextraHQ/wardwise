"use client";

import Link from "next/link";
import { HiShieldCheck, HiEye, HiLockClosed } from "react-icons/hi";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

export interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "border-border/40 bg-background relative border-t pt-12 pb-10",
        className,
      )}
    >
      {/* Structural Anchor Line */}
      <div
        className="bg-border/50 absolute top-0 left-1/2 hidden h-full w-px -translate-x-1/2 lg:block"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          {/* Brand Identity */}
          <div className="space-y-5">
            <Logo />
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
          <p className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
            © {new Date().getFullYear()} WardWise. All rights reserved.
          </p>

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
