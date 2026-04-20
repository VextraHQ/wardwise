"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDownIcon,
  CheckIcon,
  ArrowRightIcon,
  CircleIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  className?: string;
  canvasser?: boolean;
  contextLabel?: string;
  /**
   * Per-step short titles (length must equal `totalSteps`). Used as accessible
   * labels and tooltips for each segment when the stepper is clickable.
   */
  stepTitles?: string[];
  /**
   * Optional per-step subtitles (e.g. summary of values entered). Length should
   * mirror `stepTitles`. Surfaced in the navigation menu/drawer so the menu
   * doubles as a mini summary of progress so far.
   */
  stepSubtitles?: (string | undefined)[];
  /**
   * If provided, completed steps (index < currentStep - 1) become clickable
   * back-jumps. Forward navigation is intentionally not allowed — users still
   * must use Continue so per-step validation runs.
   */
  onStepClick?: (stepIndex: number) => void;
  /** Increment to briefly highlight the bar after a validation failure */
  validationFlashNonce?: number;
}

interface NavListProps {
  totalSteps: number;
  currentStep: number;
  stepTitles?: string[];
  stepSubtitles?: (string | undefined)[];
  canvasser?: boolean;
  onSelect: (index: number) => void;
  variant: "menu" | "drawer";
}

function NavList({
  totalSteps,
  currentStep,
  stepTitles,
  stepSubtitles,
  canvasser,
  onSelect,
  variant,
}: NavListProps) {
  return (
    <>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepIndex = i + 1;
        const isCompleted = stepIndex < currentStep;
        const isCurrent = stepIndex === currentStep;
        const isFuture = stepIndex > currentStep;
        const title = stepTitles?.[i] ?? `Step ${stepIndex}`;
        const subtitle = stepSubtitles?.[i];

        const Icon = isCompleted
          ? CheckIcon
          : isCurrent
            ? ArrowRightIcon
            : CircleIcon;
        const iconClass = cn(
          "size-4 shrink-0",
          isCompleted
            ? canvasser
              ? "text-amber-600"
              : "text-primary"
            : isCurrent
              ? "text-foreground"
              : "text-muted-foreground/70",
        );

        const ariaCurrent = isCurrent ? ("step" as const) : undefined;
        const handle = () => {
          if (isCompleted) onSelect(i);
        };

        const titleClass = cn(
          "block text-sm font-semibold leading-tight",
          isCurrent
            ? "text-foreground"
            : isCompleted
              ? "text-foreground"
              : "text-muted-foreground",
        );
        const subtitleClass = cn(
          "block text-[11px] leading-snug truncate mt-0.5",
          isCurrent ? "text-muted-foreground" : "text-muted-foreground/70",
        );
        const stepNumber = (
          <span className="text-muted-foreground/60 font-mono text-[10px] font-bold tracking-widest uppercase">
            {String(stepIndex).padStart(2, "0")}
          </span>
        );

        if (variant === "menu") {
          return (
            <DropdownMenuItem
              key={i}
              disabled={isFuture}
              onSelect={(event) => {
                if (isFuture || isCurrent) {
                  event.preventDefault();
                  return;
                }
                handle();
              }}
              aria-current={ariaCurrent}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 py-2",
                isCurrent && "bg-muted/40 cursor-default",
                isFuture && "cursor-not-allowed opacity-50",
              )}
            >
              <Icon className={cn(iconClass, "mt-0.5")} />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className={titleClass}>{title}</span>
                  {stepNumber}
                </div>
                {subtitle && <span className={subtitleClass}>{subtitle}</span>}
              </div>
            </DropdownMenuItem>
          );
        }

        return (
          <button
            key={i}
            type="button"
            disabled={isFuture}
            onClick={handle}
            aria-current={ariaCurrent}
            className={cn(
              "flex w-full items-start gap-3 rounded-sm px-3 py-3 text-left transition-colors",
              "border border-transparent",
              isCurrent && "bg-muted/40 border-border/40",
              isCompleted && "hover:bg-muted/50 active:bg-muted/70",
              isFuture && "cursor-not-allowed opacity-50",
            )}
          >
            <Icon className={cn(iconClass, "mt-0.5")} />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className={titleClass}>{title}</span>
                {stepNumber}
              </div>
              {subtitle && <span className={subtitleClass}>{subtitle}</span>}
            </div>
          </button>
        );
      })}
    </>
  );
}

export function StepProgress({
  currentStep,
  totalSteps,
  stepTitle,
  className,
  canvasser,
  contextLabel = "Registration Progress",
  stepTitles,
  stepSubtitles,
  onStepClick,
  validationFlashNonce = 0,
}: StepProgressProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  const navigable = Boolean(onStepClick) && Boolean(stepTitles);
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const [flashBar, setFlashBar] = useState(false);

  useEffect(() => {
    setLiveMessage(
      `Now on step ${currentStep} of ${totalSteps}: ${stepTitle}.`,
    );
  }, [currentStep, totalSteps, stepTitle]);

  useEffect(() => {
    if (!validationFlashNonce) return;
    setFlashBar(true);
    const t = window.setTimeout(() => setFlashBar(false), 700);
    return () => window.clearTimeout(t);
  }, [validationFlashNonce]);

  const handleSelect = (index: number) => {
    onStepClick?.(index);
    setDrawerOpen(false);
  };

  // Shared trigger button so it looks identical in both dropdown and drawer modes.
  const triggerClass = cn(
    "inline-flex min-h-[32px] items-center gap-1 rounded-sm px-2 -ml-2 text-[11px] font-extrabold tracking-widest uppercase whitespace-nowrap sm:text-xs hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    canvasser
      ? "text-amber-600 focus-visible:ring-amber-600/40"
      : "text-primary focus-visible:ring-primary/40",
  );
  const triggerLabel = (
    <>
      Step {currentStep} of {totalSteps}
      <ChevronDownIcon className="size-3.5" aria-hidden />
    </>
  );

  return (
    <div
      className={cn(
        "mx-auto w-full space-y-4 rounded-sm transition-shadow duration-300",
        flashBar && "ring-destructive/40 ring-2",
        className,
      )}
    >
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </span>
      <div className="flex items-end justify-between px-0.5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            {navigable && totalSteps > 1 ? (
              isMobile ? (
                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                  <DrawerTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Step ${currentStep} of ${totalSteps}. Open navigation menu`}
                      className={triggerClass}
                    >
                      {triggerLabel}
                    </button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle className="font-mono text-xs font-bold tracking-widest uppercase">
                        Wizard Steps
                      </DrawerTitle>
                      <DrawerDescription className="text-xs">
                        Tap a completed step to jump back. Future steps unlock
                        as you continue.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="flex flex-col gap-1 px-3 pb-6">
                      <NavList
                        totalSteps={totalSteps}
                        currentStep={currentStep}
                        stepTitles={stepTitles}
                        stepSubtitles={stepSubtitles}
                        canvasser={canvasser}
                        onSelect={handleSelect}
                        variant="drawer"
                      />
                    </div>
                  </DrawerContent>
                </Drawer>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Step ${currentStep} of ${totalSteps}. Open navigation menu`}
                      className={triggerClass}
                    >
                      {triggerLabel}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72 p-1">
                    <DropdownMenuLabel className="text-muted-foreground flex items-center justify-between gap-2 font-mono text-[10px] font-bold tracking-widest uppercase">
                      <span>Wizard Steps</span>
                      <span>
                        {currentStep - 1} done · {totalSteps - currentStep} left
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <NavList
                      totalSteps={totalSteps}
                      currentStep={currentStep}
                      stepTitles={stepTitles}
                      stepSubtitles={stepSubtitles}
                      canvasser={canvasser}
                      onSelect={handleSelect}
                      variant="menu"
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            ) : (
              <span
                className={cn(
                  "text-[11px] font-extrabold tracking-widest whitespace-nowrap uppercase sm:text-xs",
                  canvasser ? "text-amber-600" : "text-primary",
                )}
              >
                Step {currentStep} of {totalSteps}
              </span>
            )}
            <div className="bg-border h-3 w-px" />
            <span className="text-muted-foreground text-[11px] font-bold tracking-widest whitespace-nowrap sm:text-xs">
              {contextLabel}
            </span>
          </div>

          <h3 className="text-foreground text-sm font-bold tracking-widest uppercase">
            {stepTitle}
          </h3>
        </div>

        <div className="ml-2 shrink-0 text-right sm:ml-4">
          <div className="flex items-center gap-1 opacity-70 grayscale sm:gap-1.5">
            <div className="bg-primary size-1 rounded-full" />
            <span className="text-muted-foreground font-mono text-xs font-bold tracking-tighter whitespace-nowrap uppercase italic">
              <span className="hidden sm:inline">Progress: </span>
              {percentage}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex h-2 items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepIndex = i + 1;
          const isActive = stepIndex <= currentStep;
          const isCurrent = stepIndex === currentStep;
          const isCompleted = stepIndex < currentStep;
          const clickable = Boolean(onStepClick) && isCompleted;
          const title = stepTitles?.[i];

          const segmentClass = cn(
            "relative flex-1 transition-all duration-300",
            isCompleted ? "h-1.5 rounded-full" : "h-1 rounded-[1px]",
            !isActive
              ? "bg-muted-foreground/15"
              : canvasser
                ? "bg-amber-600"
                : "bg-primary",
          );

          const overlay = isCurrent && (
            <div
              className={cn(
                "absolute inset-0 animate-pulse rounded-[1px]",
                canvasser ? "bg-amber-600" : "bg-primary/30",
              )}
            />
          );

          if (clickable) {
            const inner = (
              <div className={cn(segmentClass, "pointer-events-none w-full")}>
                {overlay}
              </div>
            );
            const button = (
              <button
                key={i}
                type="button"
                onClick={() => onStepClick?.(i)}
                aria-label={
                  title ? `Go back to ${title}` : `Go back to step ${stepIndex}`
                }
                className={cn(
                  "focus-visible:ring-primary/40 flex flex-1 cursor-pointer items-center justify-center py-4 hover:brightness-110 hover:saturate-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:py-0",
                )}
              >
                {inner}
              </button>
            );

            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="top" sideOffset={6}>
                  <span className="font-mono text-[10px] font-bold tracking-widest uppercase">
                    ↶ {title ?? `Step ${stepIndex}`}
                  </span>
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <div
              key={i}
              className={segmentClass}
              aria-label={
                title ? `Step ${stepIndex}: ${title}` : `Step ${stepIndex}`
              }
            >
              {overlay}
            </div>
          );
        })}
      </div>
    </div>
  );
}
