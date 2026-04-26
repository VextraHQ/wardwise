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
import { IconCalendar, IconChevronDown } from "@tabler/icons-react";

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
    : "Custom";

  const pickerContent = (
    <div className="min-w-0">
      <div className="border-border/60 bg-muted/20 border-b px-4 py-3">
        <p className="text-foreground text-sm font-semibold">
          Custom date range
        </p>
        <p className="text-muted-foreground text-xs">
          Choose a start and end date, or leave one side open.
        </p>
      </div>
      <div className="flex justify-center px-1 pt-0 pb-1">
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
          className="p-2! [--cell-size:2rem] md:[--cell-size:1.9rem]"
        />
      </div>
      <div className="border-border/60 bg-muted/10 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-t px-3 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 rounded-sm px-2 font-mono text-[10px] font-bold tracking-widest uppercase"
          onClick={() => onChange({}, "all")}
        >
          Clear
        </Button>
        <p className="text-muted-foreground min-w-0 truncate text-center text-xs">
          {hasCustomSelection
            ? formatDateRangeLabel(value)
            : "Choose a start or end date"}
        </p>
        <Button
          type="button"
          size="sm"
          className="h-8 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase"
          onClick={() => setCustomOpen(false)}
        >
          Done
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
      <div className="text-muted-foreground flex shrink-0 items-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase">
        <IconCalendar className="h-4 w-4 shrink-0" aria-hidden />
        <span>Date range</span>
      </div>
      <div
        className={cn(
          "border-border/60 bg-muted/25 max-w-full min-w-0 rounded-sm border p-1 sm:w-fit",
          isMobile
            ? "w-full space-y-1"
            : "flex w-fit items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
        role="group"
        aria-label="Date range"
      >
        <div className={cn("flex items-center gap-1", isMobile && "w-full")}>
          {DATE_RANGE_PRESETS.map((preset) => (
            <Button
              key={preset.value}
              type="button"
              variant={activePreset === preset.value ? "default" : "ghost"}
              size="sm"
              className={cn(
                "rounded-sm font-mono text-[9px] font-bold tracking-wider uppercase",
                isMobile ? "h-8 min-w-0 flex-1 px-2" : "h-7 shrink-0 px-2.5",
              )}
              onClick={() =>
                onChange(getPresetRange(preset.value), preset.value)
              }
            >
              <span className="sm:hidden">{preset.mobileLabel}</span>
              <span className="hidden sm:inline">{preset.label}</span>
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
                className="h-8 w-full min-w-0 rounded-sm px-2 font-mono text-[9px] font-bold tracking-wider uppercase"
              >
                <span className="max-w-[80%] truncate">{customRangeLabel}</span>
                <IconChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="gap-0 overflow-y-auto rounded-t-2xl p-0"
            >
              <SheetHeader className="border-border/60 bg-background/95 sticky top-0 z-10 border-b px-4 py-3 pr-10 backdrop-blur">
                <SheetTitle className="font-mono text-sm font-bold tracking-widest uppercase">
                  Date range
                </SheetTitle>
                <SheetDescription>{customRangeLabel}</SheetDescription>
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
                className="h-7 shrink-0 rounded-sm px-2.5 font-mono text-[9px] font-bold tracking-wider uppercase"
              >
                <span className="max-w-32 truncate">{customRangeLabel}</span>
                <IconChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="max-h-[min(82dvh,38rem)] w-max max-w-[calc(100vw-2rem)] overflow-y-auto rounded-sm p-0"
              align="start"
              side="bottom"
              sideOffset={8}
              collisionPadding={{ top: 12, right: 12, bottom: 12, left: 272 }}
            >
              {pickerContent}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
