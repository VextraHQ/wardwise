"use client";

import { HiShieldCheck } from "react-icons/hi";
import { motion } from "motion/react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import type { IconType } from "react-icons";

export interface HeaderProps {
  badge?: string;
  badgeIcon?: IconType;
  variant?: "primary" | "amber";
  hideMobileBadge?: boolean;
  className?: string;
}

const variantStyles = {
  primary: {
    badge: "border-primary/20 bg-primary/5",
    icon: "text-primary",
    text: "text-foreground",
  },
  amber: {
    badge: "border-amber-500/20 bg-amber-500/5",
    icon: "text-amber-600",
    text: "text-foreground",
  },
};

export function Header({
  badge,
  badgeIcon: BadgeIcon = HiShieldCheck,
  variant = "primary",
  hideMobileBadge = false,
  className,
}: HeaderProps) {
  const styles = variantStyles[variant];

  return (
    <header className={cn("sticky top-0 z-50 w-full", className)}>
      <div className="bg-background/80 border-border/40 border-b backdrop-blur-md transition-all duration-300">
        <div 
          className={cn(
            "mx-auto flex max-w-7xl items-center px-6 py-3.5",
            hideMobileBadge && badge
              ? "justify-center sm:justify-between"
              : "justify-between"
          )}
        >
          <Logo />

          {badge && (
            <div className={cn("flex items-center gap-4", hideMobileBadge && "hidden sm:flex")}>
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "hidden items-center gap-1.5 rounded-xl border px-4 py-2 sm:flex",
                  styles.badge,
                )}
              >
                <BadgeIcon className={cn("size-4", styles.icon)} />
                <span
                  className={cn(
                    "text-[10px] font-black tracking-tight uppercase",
                    styles.text,
                  )}
                >
                  {badge}
                </span>
              </motion.div>

              {!hideMobileBadge && (
                <div className="sm:hidden">
                  <BadgeIcon className={cn("size-5", styles.icon)} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

