"use client";

import Link from "next/link";
import { HiMail } from "react-icons/hi";
import { HiArrowUpRight } from "react-icons/hi2";
import { FooterCookieSettingsButton } from "@/components/layout/cookie-consent";
import { COMPANY_INFO } from "@/lib/data/legal-data";

export function AppFooter() {
  return (
    <footer className="border-border/40 relative border-t">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-5">
            <div className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:flex-wrap sm:items-center sm:justify-start sm:gap-2 sm:text-left">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider">
                © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights
                reserved.
              </p>
              <span
                className="text-muted-foreground/40 hidden sm:inline"
                aria-hidden
              >
                ·
              </span>
              <p className="text-muted-foreground/70 font-mono text-[10px] leading-relaxed">
                A Product of{" "}
                <a
                  href={COMPANY_INFO.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline"
                >
                  {COMPANY_INFO.legalName}
                </a>
              </p>
            </div>

            <nav
              aria-label="Legal and privacy"
              className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-0 gap-y-1 sm:justify-start sm:gap-y-2"
            >
              <Link
                href="/privacy"
                className="hover:text-primary rounded-sm px-2 py-1.5 text-[11px] font-semibold transition-colors duration-200 sm:px-1 sm:py-0.5"
              >
                Privacy
              </Link>
              <span className="text-muted-foreground/35 px-0.5 select-none sm:px-1">
                ·
              </span>
              <Link
                href="/terms"
                className="hover:text-primary rounded-sm px-2 py-1.5 text-[11px] font-semibold transition-colors duration-200 sm:px-1 sm:py-0.5"
              >
                Terms
              </Link>
              <span className="text-muted-foreground/35 px-0.5 select-none sm:px-1">
                ·
              </span>
              <Link
                href="/cookies"
                className="hover:text-primary rounded-sm px-2 py-1.5 text-[11px] font-semibold transition-colors duration-200 sm:px-1 sm:py-0.5"
              >
                Cookies
              </Link>
              <span className="text-muted-foreground/35 hidden px-0.5 select-none sm:inline sm:px-1">
                ·
              </span>
              <FooterCookieSettingsButton />
            </nav>
          </div>

          <div className="flex shrink-0 justify-center lg:justify-end">
            <Link
              href="/contact"
              className="group border-border bg-background/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary inline-flex max-w-full flex-nowrap items-center justify-center gap-2 rounded-sm border px-4 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200 sm:px-5 sm:py-2.5"
            >
              <HiMail className="h-4 w-4 shrink-0" aria-hidden />
              <span>Contact us</span>
              <HiArrowUpRight
                className="h-3 w-3 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
