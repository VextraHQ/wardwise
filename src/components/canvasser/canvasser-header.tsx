"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiMap,
  HiUsers,
  HiHome,
  HiClipboardList,
  HiMenu,
  HiX,
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
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CanvasserHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
      <div className="border-border bg-background/60 border-b backdrop-blur transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <Link
              href="/canvasser"
              className="flex items-center gap-3"
              aria-label="WardWise Canvasser Home"
            >
              <span className="relative flex size-12 items-center justify-center">
                <span className="border-border bg-card absolute inset-0 rounded-full border" />
                <span className="relative flex size-9 items-center justify-center rounded-full bg-linear-to-br from-amber-500 via-amber-600 to-amber-700 text-white">
                  <HiUsers className="size-5" />
                </span>
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-foreground text-base font-semibold tracking-[0.18em] uppercase">
                  WardWise
                </span>
                <span className="text-muted-foreground text-[11px] font-medium">
                  Canvasser Portal
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                    className={cn(
                      "gap-2",
                      isActive &&
                        "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20",
                    )}
                  >
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 sm:flex">
              <Badge variant="outline" className="gap-2 px-3 py-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                FINT-A001
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">Exit Demo</Link>
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <HiMenu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader className="text-left">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.href}
                          variant={isActive ? "secondary" : "ghost"}
                          className="justify-start gap-2"
                          asChild
                          onClick={() => setIsOpen(false)}
                        >
                          <Link href={item.href}>
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                  <div className="border-t pt-4">
                    <div className="mb-4 flex items-center justify-between px-2">
                      <span className="text-muted-foreground text-sm">
                        Canvasser ID
                      </span>
                      <Badge variant="outline">FINT-A001</Badge>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/">Exit Demo</Link>
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
