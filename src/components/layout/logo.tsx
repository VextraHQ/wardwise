"use client";

import Link from "next/link";
import { HiMap } from "react-icons/hi";
import { cn } from "@/lib/utils";
import type { IconType } from "react-icons";

export interface LogoProps {
  /** Whether logo links to home - defaults to true */
  linkToHome?: boolean;
  /** Custom href if different from "/" */
  href?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Color variant */
  variant?: "primary" | "amber";
  /** Custom icon - defaults to HiMap */
  icon?: IconType;
  /** Show tagline below name */
  showTagline?: boolean;
  /** Additional classes for the wrapper */
  className?: string;
}

const sizeConfig = {
  sm: {
    icon: "h-8 w-8",
    iconInner: "h-5 w-5",
    name: "text-base",
    tagline: "text-[9px]",
  },
  md: {
    icon: "h-10 w-10 sm:h-11 sm:w-11",
    iconInner: "h-6 w-6",
    name: "text-lg sm:text-xl",
    tagline: "text-[10px] sm:text-[10.5px]",
  },
  lg: {
    icon: "h-12 w-12",
    iconInner: "h-7 w-7",
    name: "text-xl sm:text-2xl",
    tagline: "text-[11px]",
  },
};

const variantConfig = {
  primary: {
    iconWrapper: "border-primary/20 bg-primary/5 text-primary",
    tagline: "text-muted-foreground",
  },
  amber: {
    iconWrapper: "border-amber-500/20 bg-amber-500/5 text-amber-600",
    tagline: "text-amber-600/80",
  },
};

export function Logo({
  linkToHome = true,
  href = "/",
  size = "md",
  variant = "primary",
  icon: Icon = HiMap,
  showTagline = true,
  className,
}: LogoProps) {
  const sizeStyles = sizeConfig[size];
  const variantStyles = variantConfig[variant];

  const content = (
    <>
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105",
          sizeStyles.icon,
          variantStyles.iconWrapper,
        )}
      >
        <Icon className={sizeStyles.iconInner} />
      </div>
      <div className="flex flex-col leading-tight">
        <span
          className={cn(
            "text-foreground font-black tracking-tight",
            sizeStyles.name,
          )}
        >
          WardWise
        </span>
        {showTagline && (
          <span
            className={cn(
              "truncate font-medium",
              sizeStyles.tagline,
              variantStyles.tagline,
            )}
          >
            Civic Intelligence Platform
          </span>
        )}
      </div>
    </>
  );

  if (linkToHome) {
    return (
      <Link
        href={href}
        className={cn("group flex items-center gap-3", className)}
        aria-label="WardWise home"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>{content}</div>
  );
}
