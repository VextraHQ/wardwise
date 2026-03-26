"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Transition } from "@headlessui/react";
import { HiMenu, HiX, HiLockClosed } from "react-icons/hi";
import { Logo } from "@/components/layout/logo";
import { useSession } from "next-auth/react";

import { navigationLinks } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/use-click-outside";

type SiteHeaderProps = {
  className?: string;
};

export function SiteHeader({ className }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  useClickOutside(mobileMenuRef, () => setIsMobileOpen(false), {
    active: isMobileOpen,
    ignoreRefs: [toggleRef],
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full">
      <header className={cn("relative w-full", className)}>
        <div
          className={cn(
            "relative z-50 transition-all duration-300",
            scrolled || isMobileOpen
              ? "border-border bg-card border-b backdrop-blur-md"
              : "bg-background/80 border-b border-transparent backdrop-blur-md",
          )}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <Logo />
            <nav className="hidden items-center gap-1 lg:flex">
              {navigationLinks.map((link, i) => (
                <a
                  key={link.section}
                  href={`#${link.section}`}
                  className="group relative flex flex-col items-center px-4 py-2"
                >
                  <span className="text-muted-foreground/40 group-hover:text-primary/60 font-mono text-[8px] font-black tracking-[0.3em] transition-colors">
                    0{i + 1}
                  </span>
                  <span className="text-muted-foreground group-hover:text-foreground font-mono text-[10.5px] font-black tracking-widest uppercase transition-colors">
                    {link.label}
                  </span>
                  <div className="bg-primary absolute -bottom-1 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </nav>
            <div className="hidden items-center gap-6 lg:flex">
              {status === "authenticated" && session?.user ? (
                <Link
                  href={
                    session.user.role === "candidate"
                      ? "/dashboard"
                      : session.user.role === "admin"
                        ? "/admin"
                        : "/login"
                  }
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2 font-mono text-[10px] font-black tracking-widest uppercase transition-colors"
                >
                  <div className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {session.user.role === "candidate"
                    ? "Dashboard"
                    : session.user.role === "admin"
                      ? "Admin Dashboard"
                      : "Login"}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2 font-mono text-[10px] font-black tracking-widest uppercase transition-colors"
                >
                  <HiLockClosed className="h-3.5 w-3.5" />
                  Candidate Login
                </Link>
              )}
              <Link
                href="/contact"
                className="bg-primary text-primary-foreground hover:bg-primary/95 rounded-full px-6 py-2.5 font-mono text-[10px] font-black tracking-widest uppercase transition-transform active:scale-95"
              >
                Request a Demo
              </Link>
            </div>
            <button
              className="border-border bg-card/90 text-foreground hover:border-primary hover:text-primary inline-flex items-center justify-center rounded-sm border p-2 transition-colors duration-200 lg:hidden"
              type="button"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation"
              ref={toggleRef}
            >
              {isMobileOpen ? (
                <HiX className="h-5 w-5" />
              ) : (
                <HiMenu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>
      {/* Backdrop overlay */}
      <Transition
        show={isMobileOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className="bg-foreground/40 absolute inset-x-0 top-full z-30 h-[200vh] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden={true}
        />
      </Transition>
      {/* Mobile menu */}
      <Transition
        show={isMobileOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-3"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-3"
      >
        <div className="absolute inset-x-0 top-full z-40 lg:hidden">
          <div
            className="border-border bg-card/95 border-b px-6 pt-4 pb-6"
            ref={mobileMenuRef}
          >
            <nav className="text-accent flex flex-col gap-1 text-base">
              {navigationLinks.map((link) => (
                <a
                  key={link.section}
                  href={`#${link.section}`}
                  className="hover:bg-muted hover:text-foreground focus-visible:ring-primary rounded-sm px-3 py-3 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-5 flex flex-col gap-2.5">
              {status === "authenticated" && session?.user ? (
                <Link
                  href={
                    session.user.role === "candidate"
                      ? "/dashboard"
                      : session.user.role === "admin"
                        ? "/admin"
                        : "/login"
                  }
                  className="border-border text-foreground hover:bg-foreground hover:text-background rounded-sm border px-4 py-3 text-center text-sm font-semibold transition-colors duration-200 hover:border-transparent"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {session.user.role === "candidate"
                    ? "Dashboard"
                    : session.user.role === "admin"
                      ? "Admin Dashboard"
                      : "Login"}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="border-primary/30 text-primary hover:bg-primary/5 rounded-sm border px-4 py-2.5 text-center text-sm font-medium transition-colors duration-200"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Candidate Login
                </Link>
              )}
              <Link
                href="/contact"
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-1 rounded-full px-4 py-3 text-center text-sm font-bold transition-all duration-200"
                onClick={() => setIsMobileOpen(false)}
              >
                Request a Demo
              </Link>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
}
