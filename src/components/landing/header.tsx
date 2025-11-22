"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Transition } from "@headlessui/react";
import {
  HiMenu,
  HiX,
  HiChartBar,
  HiChip,
  HiGlobeAlt,
  HiLockClosed,
  HiMap,
  HiViewGrid,
  HiUserGroup,
  HiChevronDown,
} from "react-icons/hi";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      setScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn("sticky top-0 z-50 w-full", className)}>
      <div
        className={cn(
          "bg-background/80 backdrop-blur-md transition-all duration-300",
          scrolled
            ? "border-border bg-card/95 border-b"
            : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-2.5"
            aria-label="WardWise home"
          >
            <span className="relative flex size-9 items-center justify-center sm:size-10">
              <span className="border-border bg-card absolute inset-0 rounded-full border" />
              <span className="from-primary relative flex size-6 items-center justify-center rounded-full bg-linear-to-br via-[#2f7f6b] to-[#163a30] text-white sm:size-7">
                <HiMap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
            </span>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="text-foreground truncate text-sm font-semibold tracking-[0.18em] uppercase sm:text-[15px]">
                WardWise
              </span>
              <span className="text-muted-foreground truncate text-[10px] font-medium sm:text-[10.5px]">
                Civic Intelligence Platform
              </span>
            </div>
          </Link>
          <nav className="text-accent hidden items-center gap-3 text-sm font-medium lg:flex lg:gap-4">
            {navigationLinks.map((link) => (
              <a
                key={link.section}
                href={`#${link.section}`}
                className="group hover:text-foreground focus-visible:ring-primary relative inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {link.section === "how-it-works" && (
                  <HiViewGrid className="text-primary h-3.5 w-3.5" />
                )}
                {link.section === "features" && (
                  <HiChip className="text-primary h-3.5 w-3.5" />
                )}
                {link.section === "platform-pillars" && (
                  <HiGlobeAlt className="text-primary h-3.5 w-3.5" />
                )}
                {link.section === "impact" && (
                  <HiChartBar className="text-primary h-3.5 w-3.5" />
                )}
                {link.section === "security" && (
                  <HiLockClosed className="text-primary h-3.5 w-3.5" />
                )}
                <span>{link.label}</span>
                <span className="bg-primary absolute -bottom-1 left-0 h-[2px] w-0 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            {status === "authenticated" && session?.user ? (
              <Link
                href={
                  session.user.role === "candidate"
                    ? "/dashboard"
                    : session.user.role === "admin"
                      ? "/admin"
                      : "/login"
                }
                className="text-secondary-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200"
              >
                <HiUserGroup className="h-3.5 w-3.5" />
                {session.user.role === "candidate"
                  ? "Dashboard"
                  : session.user.role === "admin"
                    ? "Admin Dashboard"
                    : "Login"}
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground border-border hover:border-primary/50 hover:bg-primary/10 flex items-center gap-1.5 text-sm font-medium transition-colors"
                  >
                    <HiUserGroup className="h-3.5 w-3.5" />
                    Login
                    <HiChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-card border-border text-card-foreground"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href="/voter-login"
                      className="focus:bg-muted flex w-full cursor-pointer items-center gap-3"
                    >
                      <HiUserGroup className="text-muted-foreground h-4 w-4" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground text-sm font-medium">
                          Voter Login
                        </span>
                        <span className="text-muted-foreground text-xs">
                          Access your profile
                        </span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/login"
                      className="focus:bg-muted flex w-full cursor-pointer items-center gap-3"
                    >
                      <HiUserGroup className="text-muted-foreground h-4 w-4" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground text-sm font-medium">
                          Candidate Login
                        </span>
                        <span className="text-muted-foreground text-xs">
                          Access dashboard
                        </span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 text-sm font-semibold transition-all duration-200"
              asChild
            >
              <Link href="/register">Support a Candidate</Link>
            </Button>
          </div>
          <button
            className="border-border bg-card/90 text-foreground hover:border-primary hover:text-primary inline-flex items-center justify-center rounded-lg border p-2 transition-colors duration-200 lg:hidden"
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
          className="bg-foreground/40 fixed inset-x-0 top-[73px] bottom-0 z-40 backdrop-blur-sm sm:top-[81px] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
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
        <div className="relative z-50 lg:hidden">
          <div
            className="border-border bg-card/95 border-b px-6 pt-4 pb-6 backdrop-blur-sm"
            ref={mobileMenuRef}
          >
            <nav className="text-accent flex flex-col gap-1 text-base">
              {navigationLinks.map((link) => (
                <a
                  key={link.section}
                  href={`#${link.section}`}
                  className="hover:bg-muted hover:text-foreground focus-visible:ring-primary rounded-lg px-3 py-3 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
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
                  className="border-border text-foreground hover:bg-foreground hover:text-background rounded-lg border px-4 py-3 text-center text-sm font-semibold transition-colors duration-200 hover:border-transparent"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {session.user.role === "candidate"
                    ? "Dashboard"
                    : session.user.role === "admin"
                      ? "Admin Dashboard"
                      : "Login"}
                </Link>
              ) : (
                <>
                  <Link
                    href="/voter-login"
                    className="border-border text-foreground hover:bg-muted rounded-lg border px-4 py-2.5 text-center text-sm font-medium transition-colors duration-200"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Voter Login
                  </Link>
                  <Link
                    href="/login"
                    className="border-border text-foreground hover:bg-muted rounded-lg border px-4 py-2.5 text-center text-sm font-medium transition-colors duration-200"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Candidate Login
                  </Link>
                </>
              )}
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-1 rounded-full transition-all duration-200"
                asChild
              >
                <Link href="/register" onClick={() => setIsMobileOpen(false)}>
                  Support a Candidate
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Transition>
    </header>
  );
}
