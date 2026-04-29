"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  formatDateRangeLabel,
  getPresetRange,
  getReportingDatePickerEndMonth,
  getReportingDatePickerStartMonth,
  getToday,
  type DateRange,
  type DateRangePreset,
} from "@/lib/date-ranges";
import { cn } from "@/lib/utils";
import {
  IconAdjustmentsHorizontal,
  IconCalendar,
  IconChevronDown,
} from "@tabler/icons-react";

const DATE_RANGE_PRESETS = [
  { label: "7D", mobileLabel: "7D", value: "7d" },
  { label: "30D", mobileLabel: "30D", value: "30d" },
  { label: "This month", mobileLabel: "Month", value: "month" },
  { label: "All time", mobileLabel: "All", value: "all" },
] as const satisfies ReadonlyArray<{
  label: string;
  mobileLabel: string;
  value: Extract<DateRangePreset, "7d" | "30d" | "month" | "all">;
}>;

type CampaignOverviewDateFilterProps = {
  value: DateRange;
  activePreset: DateRangePreset | "custom";
  onChange: (range: DateRange, preset: DateRangePreset | "custom") => void;
};

export function CampaignOverviewDateFilter({
  value,
  activePreset,
  onChange,
}: CampaignOverviewDateFilterProps) {
  const isMobile = useIsMobile();
  const [customOpen, setCustomOpen] = useState(false);
  const today = getToday();
  const hasCustomSelection = !!value.from || !!value.to;
  const customRangeLabel = hasCustomSelection
    ? formatDateRangeLabel(value, { dateFormat: "dd MMM" })
    : "Custom Range";

  const pickerContent = (
    <div className="min-w-0">
      <div className="border-border/50 bg-muted/20 border-b px-4 py-3">
        <p className="text-foreground text-sm font-semibold tracking-tight">
          Custom date range
        </p>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          Choose a start and end date, or leave one side open.
        </p>
      </div>
      <div className="flex justify-center overflow-x-auto px-1 pt-1 pb-0">
        <Calendar
          mode="range"
          captionLayout="dropdown"
          startMonth={getReportingDatePickerStartMonth()}
          endMonth={getReportingDatePickerEndMonth(today)}
          numberOfMonths={isMobile ? 1 : 2}
          selected={{ from: value.from, to: value.to }}
          onSelect={(range) =>
            onChange({ from: range?.from, to: range?.to }, "custom")
          }
          disabled={(date) => date > today}
          className={cn(
            "p-2!",
            isMobile
              ? "[--cell-size:2.35rem]"
              : "[--cell-size:1.9rem] md:[--cell-size:2rem]",
          )}
        />
      </div>
      {isMobile ? (
        <div className="border-border/60 bg-muted/10 flex flex-col gap-3 border-t px-3 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
          <p className="text-muted-foreground min-h-10 max-w-full text-center text-xs leading-snug">
            {hasCustomSelection
              ? formatDateRangeLabel(value)
              : "Choose a start or end date"}
          </p>
          <div className="flex min-w-0 gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 min-h-10 flex-1 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
              onClick={() => onChange({}, "all")}
            >
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-10 min-h-10 flex-1 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
              onClick={() => setCustomOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-border/60 bg-muted/10 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-t px-3 py-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 justify-self-start rounded-sm px-2 font-mono text-[10px] font-bold tracking-widest uppercase"
            onClick={() => onChange({}, "all")}
          >
            Clear
          </Button>
          <p className="text-muted-foreground min-w-0 justify-self-center truncate text-center text-xs">
            {hasCustomSelection
              ? formatDateRangeLabel(value)
              : "Choose a start or end date"}
          </p>
          <Button
            type="button"
            size="sm"
            className="h-8 justify-self-end rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase"
            onClick={() => setCustomOpen(false)}
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:gap-4">
      <div className="text-muted-foreground flex shrink-0 items-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase">
        <IconCalendar
          className="text-muted-foreground/80 h-4 w-4 shrink-0"
          aria-hidden
        />
        <span>Date range</span>
      </div>
      <div
        className={cn(
          "border-border/60 bg-card max-w-full min-w-0 rounded-sm border shadow-none",
          isMobile
            ? "w-full p-1.5"
            : "flex w-full min-w-0 items-center gap-1 p-1 md:w-fit md:max-w-full",
        )}
        role="group"
        aria-label="Date range"
      >
        <div
          className={cn(
            isMobile
              ? "grid w-full grid-cols-4 gap-1"
              : "flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] md:flex-initial [&::-webkit-scrollbar]:hidden",
          )}
        >
          {DATE_RANGE_PRESETS.map((preset) => (
            <Button
              key={preset.value}
              type="button"
              variant={activePreset === preset.value ? "default" : "ghost"}
              size="sm"
              className={cn(
                "rounded-sm font-mono text-[9px] font-bold tracking-wider uppercase",
                isMobile
                  ? "h-10 min-h-10 min-w-0 px-1.5 sm:px-2"
                  : "h-8 shrink-0 px-2.5",
              )}
              onClick={() =>
                onChange(getPresetRange(preset.value), preset.value)
              }
            >
              <span className="md:hidden">{preset.mobileLabel}</span>
              <span className="hidden md:inline">{preset.label}</span>
            </Button>
          ))}
        </div>
        {isMobile ? (
          <Sheet open={customOpen} onOpenChange={setCustomOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant={activePreset === "custom" ? "default" : "outline"}
                size="sm"
                className="border-border/60 mt-1.5 h-10 w-full justify-between rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase shadow-none md:h-9 md:w-auto md:min-w-36 md:shrink-0"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <IconAdjustmentsHorizontal className="h-3.5 w-3.5 shrink-0 opacity-90" />
                  <span className="max-w-48 truncate lg:max-w-56">
                    {customRangeLabel}
                  </span>
                </span>
                <IconChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="border-border/60 gap-0 overflow-y-auto rounded-t-xl border-t p-0 sm:max-h-[min(90dvh,90svh)]"
            >
              <SheetHeader className="border-border/60 bg-background/95 sticky top-0 z-10 border-b px-4 py-3 pr-10 backdrop-blur-sm">
                <SheetTitle className="text-foreground font-mono text-xs font-bold tracking-widest uppercase sm:text-sm">
                  Custom range
                </SheetTitle>
                <SheetDescription className="text-muted-foreground text-left text-xs">
                  {hasCustomSelection
                    ? formatDateRangeLabel(value, { dateFormat: "dd MMM yyyy" })
                    : "Pick dates below"}
                </SheetDescription>
              </SheetHeader>
              {pickerContent}
            </SheetContent>
          </Sheet>
        ) : (
          <Popover open={customOpen} onOpenChange={setCustomOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={activePreset === "custom" ? "default" : "outline"}
                size="sm"
                className="border-border/60 ml-1 h-8 shrink-0 rounded-sm px-2.5 font-mono text-[9px] font-bold tracking-wider uppercase shadow-none"
              >
                <span className="max-w-42 truncate">{customRangeLabel}</span>
                <IconChevronDown className="text-muted-foreground ml-1 h-3 w-3 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="border-border/60 bg-popover max-h-[min(85dvh,40rem)] w-max max-w-[min(100vw-1.5rem,36rem)] overflow-hidden overflow-y-auto rounded-sm p-0 shadow-md"
              align="start"
              side="bottom"
              sideOffset={8}
              collisionPadding={16}
            >
              {pickerContent}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
