"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  HiUsers,
  HiHome,
  HiClipboardList,
  HiMenu,
  HiBell,
  HiOfficeBuilding,
  HiExternalLink,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * TODO: [BACKEND] Pending verification count
 * - GET /api/canvassers/:code/pending-count
 * - Returns count of voters awaiting verification
 */

// Production mock data - matches canvasser from data file
const CANVASSER_DATA = {
  code: "FINT-A001",
  name: "Chioma Okonkwo",
  candidateName: "Ahmadu Umaru Fintiri",
  candidateParty: "APC",
  position: "Governor",
};

export function CanvasserHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Mock pending count - in production, fetch from API
  const pendingCount: number = 3;

  const navItems = [
    {
      href: "/canvasser",
      label: "Dashboard",
      icon: HiHome,
    },
    {
      href: "/canvasser/register",
      label: "Register Voter",
      icon: HiClipboardList,
    },
    {
      href: "/canvasser/voters",
      label: "My Voters",
      icon: HiUsers,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-border bg-background/95 supports-backdrop-filter:bg-background/60 border-b backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Logo */}
            <Link
              href="/canvasser"
              className="group flex items-center gap-3"
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

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative flex h-9 items-center gap-2 rounded-lg px-3 text-[10px] font-bold tracking-wide uppercase transition-colors",
                        isActive
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="canvasserActiveNav"
                          className="absolute inset-0 rounded-lg border border-amber-500/20 bg-amber-500/10"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                      <Icon className="relative size-4" />
                      <span className="relative">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell (Desktop) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hidden hover:bg-amber-700/70 size-9 sm:flex"
                >
                  <HiBell className="size-5" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {pendingCount} voter{pendingCount !== 1 ? "s" : ""} pending
                  verification
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Canvasser Code Badge (Desktop) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hidden sm:block">
                  <Badge
                    variant="outline"
                    className="cursor-default gap-1.5 border-amber-500 bg-amber-500/5 px-2 py-1 font-mono text-[10px] font-bold"
                  >
                    <div className="size-1.5 animate-pulse rounded-full bg-amber-500" />
                    {CANVASSER_DATA.code}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="text-xs font-bold">{CANVASSER_DATA.name}</p>
                  <p className="text-[10px]">
                    {CANVASSER_DATA.candidateName} (
                    {CANVASSER_DATA.candidateParty})
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Exit Demo (Desktop) */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden h-8 rounded-lg px-3 text-xs font-medium sm:flex"
            >
              <Link href="/">
                <HiExternalLink className="mr-1.5 size-3.5" />
                Exit
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative size-9 md:hidden"
                >
                  <HiMenu className="size-5" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-[320px] p-0">
                {/* Custom Header */}
                <div className="border-border/60 border-b px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg border border-amber-500 bg-amber-500/10 text-amber-600">
                      <HiUsers className="size-4" />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-bold">
                        {CANVASSER_DATA.name}
                      </p>
                      <p className="text-muted-foreground text-[10px] font-medium">
                        {CANVASSER_DATA.code}
                      </p>
                    </div>
                  </div>
                </div>

                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col p-5">
                  {/* Candidate Info Card */}
                  <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-amber-600 uppercase">
                      <HiOfficeBuilding className="size-3.5" />
                      <span>For Candidate</span>
                    </div>
                    <p className="text-foreground mt-1.5 text-sm font-bold">
                      {CANVASSER_DATA.candidateName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {CANVASSER_DATA.candidateParty} •{" "}
                      {CANVASSER_DATA.position}
                    </p>
                  </div>

                  {/* Nav Links */}
                  <div className="space-y-1">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                          )}
                        >
                          <Icon className="size-5" />
                          {item.label}
                          {isActive && (
                            <div className="ml-auto size-1.5 rounded-full bg-amber-500" />
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Pending Notifications */}
                  {pendingCount > 0 && (
                    <div className="mt-5 rounded-xl border border-amber-200/50 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                          <HiBell className="size-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                            {pendingCount} pending
                          </p>
                          <p className="text-muted-foreground text-[10px]">
                            Awaiting verification
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Exit Demo */}
                  <div className="mt-auto pt-5">
                    <Button
                      variant="outline"
                      className="w-full justify-center gap-2 rounded-xl py-5"
                      asChild
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/">
                        <HiExternalLink className="size-4" />
                        Exit Demo
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
