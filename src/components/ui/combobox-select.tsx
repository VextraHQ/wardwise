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
}

interface ComboboxSelectProps {
  options: ComboboxSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

export function ComboboxSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  disabled = false,
  className,
  triggerClassName,
}: ComboboxSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
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
        disabled={disabled}
        title={selectedOption?.label}
        className={cn(
          "h-11 w-full justify-between overflow-hidden font-normal",
          !selectedOption && "text-muted-foreground",
          triggerClassName,
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 truncate text-left">
          {selectedOption && code ? (
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
            selectedOption.label
          ) : (
            placeholder
          )}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
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
        <Command className="overflow-hidden rounded-md">
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                // Parse polling unit format: "001 - Polling Unit Name"
                // Extract code if label follows this pattern
                const labelMatch = option.label.match(/^(\d{3})\s*-\s*(.+)$/);
                const code = labelMatch ? labelMatch[1] : null;
                const name = labelMatch ? labelMatch[2] : option.label;

                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {/* Hidden text for search - cmdk searches by text content */}
                    <span className="sr-only">{option.label}</span>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      {code ? (
                        <>
                          <Badge
                            variant="secondary"
                            className="shrink-0 font-mono text-xs font-semibold"
                          >
                            {code}
                          </Badge>
                          <span className="truncate">{name}</span>
                        </>
                      ) : (
                        <span className="truncate">{option.label}</span>
                      )}
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
