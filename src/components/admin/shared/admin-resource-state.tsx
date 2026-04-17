"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

type AdminResourceStateAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "default" | "outline" | "destructive" | "ghost";
};

type AdminResourceStateProps = {
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string }>;
  tone?: "empty" | "missing" | "error";
  action?: AdminResourceStateAction;
  secondaryAction?: AdminResourceStateAction;
  className?: string;
};

const toneStyles = {
  empty: {
    ring: "border-primary/20 bg-primary/5 text-primary",
    corner: "border-primary/50",
  },
  missing: {
    ring: "border-orange-500/20 bg-orange-500/10 text-orange-600",
    corner: "border-orange-500/50",
  },
  error: {
    ring: "border-destructive/20 bg-destructive/10 text-destructive",
    corner: "border-destructive/50",
  },
};

function StateAction({ action }: { action: AdminResourceStateAction }) {
  const className =
    "h-9 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase";
  const content = (
    <>
      {action.icon}
      {action.label}
    </>
  );

  if (action.href) {
    return (
      <Button
        asChild
        size="sm"
        variant={action.variant ?? "outline"}
        className={className}
      >
        <Link href={action.href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant={action.variant ?? "outline"}
      className={className}
      onClick={action.onClick}
      type="button"
    >
      {content}
    </Button>
  );
}

export function AdminResourceState({
  title,
  description,
  icon: Icon = IconAlertTriangle,
  tone = "empty",
  action,
  secondaryAction,
  className = "",
}: AdminResourceStateProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={`border-border/70 bg-card relative flex flex-col items-center gap-4 overflow-hidden border border-dashed px-5 py-10 text-center shadow-none ${className}`}
    >
      <div
        className={`${styles.corner} pointer-events-none absolute top-0 left-0 size-4 border-t border-l`}
      />
      <div
        className={`${styles.corner} pointer-events-none absolute top-0 right-0 size-4 border-t border-r`}
      />
      <div
        className={`${styles.ring} flex h-11 w-11 items-center justify-center rounded-sm border`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="max-w-md space-y-1.5">
        <p className="text-foreground font-medium">{title}</p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {(action || secondaryAction) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {action && <StateAction action={action} />}
          {secondaryAction && <StateAction action={secondaryAction} />}
        </div>
      )}
    </div>
  );
}

export const adminResourceStateIcons = {
  alert: <IconAlertTriangle className="mr-1.5 h-3.5 w-3.5" />,
  back: <IconArrowLeft className="mr-1.5 h-3.5 w-3.5" />,
  plus: <IconPlus className="mr-1.5 h-3.5 w-3.5" />,
};
