"use client";

import type { ReactNode } from "react";

import {
  IconAdjustmentsHorizontal,
  IconChevronDown,
} from "@tabler/icons-react";
import { HiX } from "react-icons/hi";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AdminToolbarFilterSheetProps = {
  triggerLabel: string;
  /** Shown after `refineCount` is zero (e.g. “Tap to refine”). */
  idleHint?: string;
  sheetTitle: string;
  sheetDescription: ReactNode;
  /** Count of non-default options controlled inside this sheet (not search/tabs elsewhere). */
  refineCount: number;
  /** When true, footer shows reset (typically parent `hasFilters` including search / external tabs). */
  showResetFooter: boolean;
  onReset: () => void;
  footerResetLabel?: string;
  children: React.ReactNode;
};

/** Shared bottom sheet for secondary admin list filters (&lt; md). Keeps toolbar height consistent across pages. */
export function AdminToolbarFilterSheet({
  triggerLabel,
  idleHint = "Tap to refine",
  sheetTitle,
  sheetDescription,
  refineCount,
  showResetFooter,
  onReset,
  footerResetLabel = "Reset search & filters",
  children,
}: AdminToolbarFilterSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className="border-border/60 bg-muted/25 hover:bg-muted/35 text-foreground data-[state=open]:border-primary/30 data-[state=open]:bg-primary/5 h-10 w-full justify-between gap-3 rounded-sm border px-3 font-mono text-[10px] font-bold tracking-widest uppercase shadow-none transition-colors [&_kbd]:pointer-events-none"
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <IconAdjustmentsHorizontal
              className="text-primary h-4 w-4 shrink-0 opacity-90"
              aria-hidden
            />
            <span className="truncate text-left leading-tight">
              {triggerLabel}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {refineCount > 0 ? (
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/10 text-primary rounded-sm px-2 py-0 font-mono text-[10px] font-bold tracking-wider whitespace-nowrap tabular-nums"
              >
                {refineCount} active
              </Badge>
            ) : (
              <span className="text-muted-foreground/80 max-w-38 truncate text-right whitespace-nowrap">
                {idleHint}
              </span>
            )}
            <IconChevronDown
              className="text-muted-foreground/70 h-3.5 w-3.5 shrink-0 opacity-80"
              aria-hidden
            />
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="flex max-h-[min(92dvh,92svh)] flex-col gap-0 p-0"
      >
        <SheetHeader className="border-border/60 bg-background/95 shrink-0 space-y-2 border-b p-4 text-left backdrop-blur-sm">
          <SheetTitle className="text-foreground font-mono text-xs font-bold tracking-widest uppercase">
            {sheetTitle}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground font-sans text-sm leading-snug">
            {sheetDescription}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {children}
        </div>

        {showResetFooter ? (
          <SheetFooter className="border-border/60 shrink-0 border-t pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                onReset();
              }}
              className="border-border/60 h-10 w-full gap-2 rounded-sm font-mono text-[11px] tracking-widest uppercase shadow-none"
            >
              <HiX className="h-3.5 w-3.5" />
              {footerResetLabel}
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
