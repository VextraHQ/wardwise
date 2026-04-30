"use client";

import Link from "next/link";
import { HiMail } from "react-icons/hi";
import { HiArrowUpRight } from "react-icons/hi2";
import { Logo } from "@/components/layout/logo";
import { FooterCookieSettingsButton } from "@/components/layout/cookie-consent";
import { COMPANY_INFO, legalNavigation } from "@/lib/data/legal-data";
import { supportNavigation } from "@/lib/data/support-data";
import { cn } from "@/lib/utils";

interface LegalFooterProps {
  pathname: string;
}

export function LegalFooter({ pathname }: LegalFooterProps) {
  return (
    <footer className="border-border/40 mt-12 border-t py-10 print:hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xs space-y-3">
            <Logo size="md" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nigeria&apos;s leading civic intelligence platform for ward-level
              accuracy.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div className="space-y-3">
              <h4 className="text-foreground text-[11px] font-black tracking-[0.15em] uppercase">
                Legal
              </h4>
              <ul className="space-y-2">
                {legalNavigation.slice(0, 3).map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "text-muted-foreground hover:text-primary font-medium transition-colors",
                        pathname === item.href && "text-primary",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-foreground text-[11px] font-black tracking-[0.15em] uppercase">
                Support
              </h4>
              <ul className="space-y-2">
                {supportNavigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "text-muted-foreground hover:text-primary font-medium transition-colors",
                        pathname === item.href && "text-primary",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-foreground text-[11px] font-black tracking-[0.15em] uppercase">
                Navigate
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-muted-foreground hover:text-primary font-medium transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-primary font-medium transition-colors"
                  >
                    Contact us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-border/40 mt-8 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-3">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide">
              © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights
              reserved.
            </p>
            <span className="text-muted-foreground/40 hidden sm:inline">·</span>
            <p className="text-muted-foreground/70 font-mono text-[10px]">
              A Product of{" "}
              <Link
                href={COMPANY_INFO.companyWebsite}
                className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {COMPANY_INFO.legalName}
              </Link>
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <FooterCookieSettingsButton />
            <Link
              href="/contact"
              className="group border-border/60 bg-background/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary flex items-center gap-2 rounded-sm border px-4 py-2 transition-all"
            >
              <HiMail className="size-4" />
              <span className="text-xs font-medium">Contact us</span>
              <HiArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
