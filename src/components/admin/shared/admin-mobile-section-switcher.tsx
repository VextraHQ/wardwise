"use client";

import { useMemo, useState } from "react";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminMobileSectionOption = {
  value: string;
  label: string;
  description?: string;
};

export function AdminMobileSectionSwitcher({
  value,
  onValueChange,
  options,
  description,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: AdminMobileSectionOption[];
  description?: string;
}) {
  const [open, setOpen] = useState(false);
  const activeOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-fit rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase md:hidden"
        >
          {activeOption?.label ?? "Section"}
          <IconChevronDown className="size-3.5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="gap-0 p-0">
        <SheetHeader className="border-b">
          <SheetTitle className="font-mono text-xs font-bold tracking-widest uppercase">
            Section
          </SheetTitle>
          {description ? (
            <SheetDescription className="text-xs">
              {description}
            </SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="flex flex-col gap-1 px-3 pb-6">
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex w-full items-start justify-between gap-3 rounded-sm px-3 py-3 text-left transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/40",
                )}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-bold tracking-widest uppercase">
                    {option.label}
                  </p>
                  {option.description ? (
                    <p
                      className={cn(
                        "mt-1 text-xs leading-relaxed",
                        active ? "text-primary/80" : "text-muted-foreground",
                      )}
                    >
                      {option.description}
                    </p>
                  ) : null}
                </div>
                {active ? <IconCheck className="mt-0.5 size-4 shrink-0" /> : null}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
