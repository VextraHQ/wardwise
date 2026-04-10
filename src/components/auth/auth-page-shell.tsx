"use client";

import type { ReactNode } from "react";
import { Header, type HeaderProps } from "@/components/layout/header";

interface AuthPageShellProps {
  badge: string;
  badgeIcon?: HeaderProps["badgeIcon"];
  title: ReactNode;
  description: string;
  children: ReactNode;
}

export function AuthPageShell({
  badge,
  badgeIcon,
  title,
  description,
  children,
}: AuthPageShellProps) {
  return (
    <div className="bg-background relative min-h-screen overflow-hidden">
      <Header badge={badge} badgeIcon={badgeIcon} />
      <div className="relative flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-3 text-center">
            <h1 className="text-foreground text-2xl font-bold tracking-tight text-balance sm:text-3xl md:text-4xl">
              {title}
            </h1>
            <p className="text-muted-foreground mx-auto max-w-xl text-base leading-relaxed sm:text-lg">
              {description}
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
