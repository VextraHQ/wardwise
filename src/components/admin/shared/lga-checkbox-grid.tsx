"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FieldLabel, FieldError } from "@/components/collect/form-ui";
import { formatGeoDisplayName } from "@/lib/utils/geo-display";
import { IconSearch } from "@tabler/icons-react";

type Lga = { id: number; name: string };

interface LgaCheckboxGridProps {
  lgas: Lga[];
  selectedIds: number[];
  onToggle: (lgaId: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  loading?: boolean;
  stateLabel?: string;
  error?: string;
  label?: string;
  helperText?: string;
  searchPlaceholder?: string;
  emptyStateMessage?: string;
}

export function LgaCheckboxGrid({
  lgas,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearAll,
  loading,
  stateLabel,
  error,
  label = "LGAs",
  helperText,
  searchPlaceholder = "Search LGAs...",
  emptyStateMessage = "Select a state to see available LGAs",
}: LgaCheckboxGridProps) {
  const [search, setSearch] = useState("");

  const filteredLgas = lgas.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="text-muted-foreground rounded-sm border border-dashed p-6 text-center text-sm">
        Loading LGAs...
      </div>
    );
  }

  if (lgas.length === 0) {
    return (
      <div className="text-muted-foreground rounded-sm border border-dashed p-6 text-center text-sm">
        {emptyStateMessage}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <FieldLabel>{label} *</FieldLabel>

      {helperText && (
        <p className="text-muted-foreground text-xs">{helperText}</p>
      )}

      {stateLabel && (
        <p className="text-muted-foreground text-xs">
          {formatGeoDisplayName(stateLabel)} — {lgas.length} LGAs
        </p>
      )}

      <div className="relative">
        <IconSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="rounded-sm pl-9 text-sm"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          <span className="font-mono tabular-nums">{selectedIds.length}</span>{" "}
          of <span className="font-mono tabular-nums">{lgas.length}</span>{" "}
          selected
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 rounded-sm font-mono text-[11px] tracking-widest uppercase"
            onClick={onSelectAll}
          >
            Select all
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 rounded-sm font-mono text-[11px] tracking-widest uppercase"
            onClick={onClearAll}
            disabled={selectedIds.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="grid max-h-72 grid-cols-2 gap-x-4 gap-y-1.5 overflow-y-auto rounded-sm border p-3 sm:grid-cols-3">
        {filteredLgas.map((lga) => (
          <label
            key={lga.id}
            className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm transition-colors"
          >
            <Checkbox
              checked={selectedIds.includes(lga.id)}
              onCheckedChange={() => onToggle(lga.id)}
            />
            <span className="truncate">{formatGeoDisplayName(lga.name)}</span>
          </label>
        ))}
        {filteredLgas.length === 0 && (
          <p className="text-muted-foreground col-span-full py-4 text-center text-xs">
            No LGAs match &ldquo;{search}&rdquo;
          </p>
        )}
      </div>

      <FieldError error={error} />
    </div>
  );
}
