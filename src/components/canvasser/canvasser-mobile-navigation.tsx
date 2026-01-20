"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { HiHome, HiPlus, HiUsers, HiChartBar, HiCog } from "react-icons/hi";
import { cn } from "@/lib/utils";

/**
 * Mobile-first bottom navigation for canvasser portal.
 * Similar to voter profile bottom navigation but with canvasser-specific routes.
 *
 * TODO: [FEATURE] Settings page
 * - Add settings/profile page for canvasser to view/edit their info
 * - For now, settings is disabled
 */

interface NavItem {
  href: string;
  label: string;
  icon: typeof HiHome;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { href: "/canvasser", label: "Home", icon: HiHome },
  { href: "/canvasser/register", label: "Register", icon: HiPlus },
  { href: "/canvasser/voters", label: "Voters", icon: HiUsers },
  {
    href: "/canvasser/stats",
    label: "Stats",
    icon: HiChartBar,
    disabled: true,
  },
  {
    href: "/canvasser/settings",
    label: "Settings",
    icon: HiCog,
    disabled: true,
  },
];

export function CanvasserNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="border-border bg-card/95 supports-backdrop-filter:bg-card/80 border-t backdrop-blur-lg">
        <div className="flex items-stretch justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <div
                  key={item.href}
                  className="text-muted-foreground/40 relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5"
                >
                  <Icon className="size-5" />
                  <span className="text-[9px] font-bold tracking-wide">
                    {item.label}
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-colors",
                  isActive ? "text-amber-600" : "text-muted-foreground",
                )}
              >
                {/* Active indicator line */}
                {isActive && (
                  <motion.div
                    layoutId="canvasserMobileActiveTab"
                    className="absolute top-0 h-0.5 w-10 rounded-full bg-amber-500"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
                {/* Icon */}
                <Icon className="size-5" />
                {/* Label */}
                <span
                  className={cn(
                    "text-[9px] font-bold tracking-wide",
                    isActive && "font-extrabold",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
