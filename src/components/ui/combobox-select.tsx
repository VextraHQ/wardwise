"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ComboboxSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  indicator?: React.ReactNode;
}

export interface ComboboxSelectGroup {
  heading: string;
  options: ComboboxSelectOption[];
}

interface ComboboxSelectProps {
  options?: ComboboxSelectOption[];
  groups?: ComboboxSelectGroup[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  isLoading?: boolean;
}

export function ComboboxSelect({
  options = [],
  groups,
  value,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  disabled = false,
  className,
  triggerClassName,
  isLoading = false,
}: ComboboxSelectProps) {
  const [open, setOpen] = React.useState(false);

  const allOptions = React.useMemo(() => {
    if (groups) {
      return groups.flatMap((group) => group.options);
    }
    return options;
  }, [options, groups]);

  const selectedOption = React.useMemo(
    () => allOptions.find((option) => option.value === value),
    [allOptions, value],
  );

  const renderTriggerButton = () => {
    // Parse polling unit format: "001 - Polling Unit Name"
    const labelMatch = selectedOption?.label.match(/^(\d{3})\s*-\s*(.+)$/);
    const code = labelMatch ? labelMatch[1] : null;
    const name = labelMatch ? labelMatch[2] : selectedOption?.label;

    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        disabled={disabled || isLoading}
        title={selectedOption?.label}
        className={cn(
          "h-11 w-full justify-between overflow-hidden font-normal transition-all active:scale-[0.99]",
          !selectedOption && "text-muted-foreground",
          isLoading && "opacity-70",
          triggerClassName,
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 truncate text-left">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              <span className="text-muted-foreground">Loading...</span>
            </div>
          ) : selectedOption && code ? (
            <>
              <Badge
                variant="secondary"
                className="shrink-0 font-mono text-xs font-semibold"
              >
                {code}
              </Badge>
              <span className="truncate">{name}</span>
            </>
          ) : selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              {selectedOption.indicator}
              <span className="truncate">{selectedOption.label}</span>
            </div>
          ) : (
            placeholder
          )}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  };

  const renderOption = (option: ComboboxSelectOption) => {
    // Parse polling unit format: "001 - Polling Unit Name"
    const labelMatch = option.label.match(/^(\d{3})\s*-\s*(.+)$/);
    const code = labelMatch ? labelMatch[1] : null;
    const name = labelMatch ? labelMatch[2] : option.label;

    return (
      <CommandItem
        key={option.value}
        value={option.value}
        disabled={option.disabled}
        className="group flex cursor-pointer items-center justify-between py-2.5"
        onSelect={(currentValue) => {
          onValueChange(currentValue === value ? "" : currentValue);
          setOpen(false);
        }}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2 truncate">
            {code ? (
              <>
                <Badge
                  variant="secondary"
                  className="shrink-0 font-mono text-[10px] font-bold"
                >
                  {code}
                </Badge>
                <span className="truncate font-medium">{name}</span>
              </>
            ) : (
              <div className="flex items-center gap-2 truncate">
                {option.indicator}
                <span className="truncate font-medium">{option.label}</span>
              </div>
            )}
            <Check
              className={cn(
                "text-primary h-3.5 w-3.5 shrink-0 transition-colors group-hover:text-white group-data-[selected=true]:text-white",
                value === option.value ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
          {option.description && (
            <p className="line-clamp-1 text-[11px]">{option.description}</p>
          )}
        </div>
      </CommandItem>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {selectedOption ? (
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>{renderTriggerButton()}</PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="start"
            className="max-w-xs text-left wrap-break-word"
          >
            {selectedOption.label}
          </TooltipContent>
        </Tooltip>
      ) : (
        <PopoverTrigger asChild>{renderTriggerButton()}</PopoverTrigger>
      )}
      <PopoverContent
        className={cn(
          "w-(--radix-popover-trigger-width) overflow-hidden rounded-md p-0",
          className,
        )}
        align="start"
        sideOffset={4}
      >
        <Command className="overflow-hidden rounded-xl">
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-10 border-none focus:ring-0"
          />
          <CommandList className="scrollbar-thin scrollbar-thumb-muted-foreground/20 max-h-[300px]">
            <CommandEmpty className="py-6 text-center text-sm">
              <div className="text-muted-foreground flex flex-col items-center gap-2">
                <p>{emptyMessage}</p>
              </div>
            </CommandEmpty>
            {groups ? (
              groups.map((group) => (
                <CommandGroup
                  key={group.heading}
                  heading={
                    <span className="text-primary/70 px-2 text-[10px] font-bold tracking-widest uppercase">
                      {group.heading}
                    </span>
                  }
                  className="px-1"
                >
                  {group.options.map(renderOption)}
                </CommandGroup>
              ))
            ) : (
              <CommandGroup className="px-1">
                {options.map(renderOption)}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
