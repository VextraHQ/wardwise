"use client";

import Link from "next/link";
import type React from "react";
import {
  HiArrowLeft,
  HiHome,
  HiQuestionMarkCircle,
  HiRefresh,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";

type StatusAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "destructive" | "outline";
};

type AppStatusScreenProps = {
  code: "404" | "500" | string;
  protocol: string;
  title: string;
  description: string;
  tone?: "primary" | "destructive";
  primaryAction: StatusAction;
  secondaryAction?: StatusAction;
  supportHref?: string;
  supportLabel?: string;
  reference?: string;
  footerCode?: string;
  footerStatus?: string;
};

function ActionButton({ action }: { action: StatusAction }) {
  const variant = action.variant ?? "outline";
  const className =
    variant === "default"
      ? "bg-primary hover:bg-primary/90 h-11 min-w-[140px] gap-2 rounded-lg text-xs font-bold tracking-widest text-white uppercase shadow-none"
      : variant === "destructive"
        ? "h-11 min-w-[140px] gap-2 rounded-lg text-xs font-bold tracking-widest uppercase shadow-none ring-offset-2"
        : "border-border hover:bg-muted/50 h-11 min-w-[140px] gap-2 rounded-lg text-xs font-bold tracking-widest uppercase shadow-none";

  if (action.href) {
    return (
      <Button asChild variant={variant} className={className}>
        <Link href={action.href}>
          {action.icon}
          {action.label}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      onClick={action.onClick}
      variant={variant}
      className={className}
      type="button"
    >
      {action.icon}
      {action.label}
    </Button>
  );
}

export function AppStatusScreen({
  code,
  protocol,
  title,
  description,
  tone = "primary",
  primaryAction,
  secondaryAction,
  supportHref = "/support",
  supportLabel = "Visit support",
  reference,
  footerCode,
  footerStatus,
}: AppStatusScreenProps) {
  const isDestructive = tone === "destructive";
  const accentClasses = isDestructive
    ? {
        borderStrong: "border-destructive/80",
        border: "border-destructive/60",
        borderDashed: "border-destructive/40",
        bg: "bg-destructive",
        bgSubtle: "bg-destructive/20",
      }
    : {
        borderStrong: "border-primary",
        border: "border-primary",
        borderDashed: "border-primary",
        bg: "bg-primary",
        bgSubtle: "bg-primary",
      };
  const codeTint = isDestructive ? "text-destructive/10" : "text-primary/20";

  return (
    <div className="bg-background relative flex min-h-screen w-full flex-col items-center justify-center p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.07]">
        <div className="relative h-[600px] w-[600px]">
          <div
            className={`${accentClasses.border} absolute inset-0 rounded-full border`}
          />
          <div
            className={`${accentClasses.borderDashed} absolute inset-12 rounded-full border border-dashed`}
          />
          <div
            className={`${accentClasses.bgSubtle} absolute top-1/2 left-0 h-px w-full`}
          />
          <div
            className={`${accentClasses.bgSubtle} absolute top-0 left-1/2 h-full w-px`}
          />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="bg-card border-border/80 relative overflow-hidden border">
          <div
            className={`${accentClasses.borderStrong} absolute top-0 left-0 size-5 border-t border-l`}
          />
          <div
            className={`${accentClasses.borderStrong} absolute top-0 right-0 size-5 border-t border-r`}
          />
          <div
            className={`${accentClasses.borderStrong} absolute bottom-0 left-0 size-5 border-b border-l`}
          />
          <div
            className={`${accentClasses.borderStrong} absolute right-0 bottom-0 size-5 border-r border-b`}
          />

          <div className="absolute top-3 right-4 flex items-center gap-2 opacity-50">
            <div className={`${accentClasses.bg} h-1 w-1 rounded-full`} />
            <span className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
              {protocol}
            </span>
          </div>

          <div className="px-6 py-12 sm:px-12 sm:py-16">
            <div className="flex flex-col items-center text-center">
              <div className="mb-8">
                <h1
                  className={`${codeTint} font-mono text-9xl leading-none font-black tracking-tighter select-none sm:text-[10rem]`}
                >
                  {code}
                </h1>
              </div>

              <div className="space-y-4">
                <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                  {title}
                </h2>
                <p className="text-muted-foreground mx-auto max-w-sm text-base leading-relaxed">
                  {description}
                </p>
              </div>

              {reference && (
                <div className="border-border/60 bg-muted/20 mt-6 rounded-sm border px-3 py-2">
                  <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                    Reference: {reference}
                  </p>
                </div>
              )}

              <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <ActionButton action={primaryAction} />
                {secondaryAction && <ActionButton action={secondaryAction} />}
              </div>

              {supportHref && (
                <p className="text-muted-foreground mt-6 text-xs">
                  Still stuck?{" "}
                  <Link
                    href={supportHref}
                    className="text-primary decoration-primary/30 inline-flex items-center gap-1 font-semibold underline underline-offset-4"
                  >
                    <HiQuestionMarkCircle className="size-3.5" />
                    {supportLabel}
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between px-1">
          <span className="text-muted-foreground font-mono text-[9px]">
            {footerCode ?? `WW-SYS-${code}`}
          </span>
          <span className="text-muted-foreground font-mono text-[9px]">
            :: {footerStatus ?? "RECOVERABLE_STATE"}
          </span>
        </div>
      </div>
    </div>
  );
}

export const statusIcons = {
  back: <HiArrowLeft className="size-4" />,
  home: <HiHome className="size-4" />,
  refresh: <HiRefresh className="size-4" />,
};
