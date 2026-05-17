"use client";

import * as React from "react";
import { motion } from "motion/react";
import { HiShieldCheck } from "react-icons/hi";
import { cn } from "@/lib/utils";
import type { IconType } from "react-icons";
import type { LucideIcon } from "lucide-react";

/**
 * AuthCard - A reusable architectural-style card for authentication pages.
 * Designed for login, forgot-password, reset-password, and similar flows.
 * Features: Animated entrance, corner markers, customizable header.
 */

export interface AuthCardProps {
  /** Main title displayed in the card header */
  title: string;
  /** Subtitle text shown below the title */
  subtitle?: string;
  /** Secondary status badge (e.g., "Encrypted", "Active") */
  status?: string;
  /** Icon displayed in the top-right corner - defaults to HiShieldCheck */
  icon?: IconType | LucideIcon;
  /** Additional classes for the wrapper */
  className?: string;
  /** Children to render inside the card content area */
  children: React.ReactNode;
}

export function AuthCard({
  title,
  subtitle,
  status,
  icon: Icon = HiShieldCheck,
  className,
  children,
}: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border-border/60 bg-card relative overflow-hidden border shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      {/* Architectural Corner Markers */}
      <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
      <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

      <div className="p-7 sm:p-10">
        {/* Card Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
              {title}
            </h2>
            {(subtitle || status) && (
              <div className="flex items-center gap-2">
                <div className="bg-primary/60 size-1.5 rounded-[1px]" />
                <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
                  {subtitle}
                  {subtitle && status && (
                    <span className="text-primary/40 mx-1">|</span>
                  )}
                  {status && (
                    <span className="text-foreground font-bold">{status}</span>
                  )}
                </p>
              </div>
            )}
          </div>
          <div className="bg-primary/5 text-primary border-primary/20 flex size-9 items-center justify-center rounded-lg border">
            <Icon className="size-4.5" />
          </div>
        </div>

        {/* Card Content */}
        {children}
      </div>
    </motion.div>
  );
}
