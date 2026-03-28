"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface LogoProps {
  /** Whether logo links to home - defaults to true */
  linkToHome?: boolean;
  /** Custom href if different from "/" */
  href?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Color variant — lagoon for light backgrounds, offwhite for dark (sidebar) */
  variant?: "lagoon" | "offwhite";
  /** Additional classes for the wrapper */
  className?: string;
}

const sizeConfig = {
  sm: { h: 20, w: 112, className: "h-5 w-auto" }, // For mobile headers
  md: { h: 24, w: 134, className: "h-6 w-auto" }, // For standard navigation
  lg: { h: 32, w: 179, className: "h-8 w-auto" }, // For hero sections/footers
};

const variantConfig = {
  lagoon: { src: "/brand/logotype-lagoon.svg" },
  offwhite: { src: "/brand/logotype-offwhite.svg" },
};

export function Logo({
  linkToHome = true,
  href = "/",
  size = "md",
  variant = "lagoon",
  className,
}: LogoProps) {
  const sizeStyles = sizeConfig[size];
  const variantStyles = variantConfig[variant];

  const content = (
    <Image
      src={variantStyles.src}
      alt="WardWise"
      width={sizeStyles.w}
      height={sizeStyles.h}
      className={cn("object-contain", sizeStyles.className)}
      priority
    />
  );

  if (linkToHome) {
    return (
      <Link
        href={href}
        className={cn("group flex items-center", className)}
        aria-label="WardWise home"
      >
        {content}
      </Link>
    );
  }

  return <div className={cn("flex items-center", className)}>{content}</div>;
}
