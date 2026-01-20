"use client";

import React from "react";
import { motion } from "motion/react";
import { type LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";

interface RegistrationStepHeaderProps {
  icon: LucideIcon | IconType | React.ReactNode;
  badge: string;
  title: string;
  description: string;
  className?: string;
  canvasser?: boolean;
}

function renderIcon(
  icon: LucideIcon | IconType | React.ReactNode,
): React.ReactNode {
  if (React.isValidElement(icon)) {
    return icon;
  }

  if (icon) {
    const IconComponent = icon as React.ElementType;
    return <IconComponent size={16} className="h-4 w-4" />;
  }

  return null;
}

export function RegistrationStepHeader({
  icon: Icon,
  badge,
  title,
  description,
  className,
  canvasser,
}: RegistrationStepHeaderProps) {
  return (
    <div className={cn("mb-10 space-y-5 text-center", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex justify-center"
      >
        <div className="bg-muted/30 border-border/60 flex items-center gap-3 rounded-full border py-1.5 pr-4 pl-1.5 backdrop-blur-sm">
          <div
            className={cn(
              "bg-background border-border/40 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm",
              canvasser ? "text-amber-600" : "text-primary",
            )}
          >
            {renderIcon(Icon)}
          </div>
          <div className="flex flex-col text-left">
            <p className="text-foreground text-[10px] font-black tracking-widest uppercase">
              {badge}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-2.5"
      >
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          {title.includes(" ") ? (
            <>
              {title.split(" ").slice(0, -1).join(" ")}{" "}
              <span
                className={cn(
                  "font-serif font-normal italic",
                  canvasser ? "text-amber-600" : "text-primary",
                )}
              >
                {title.split(" ").slice(-1)}
              </span>
            </>
          ) : (
            title
          )}
        </h1>
        <p className="text-muted-foreground mx-auto max-w-lg text-sm leading-relaxed font-medium sm:text-base">
          {description}
        </p>
      </motion.div>
    </div>
  );
}
