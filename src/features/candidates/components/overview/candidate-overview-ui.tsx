"use client";

import { IconPencil } from "@tabler/icons-react";

export function OverviewSectionHeader({
  eyebrow,
  showEdit,
  onEdit,
  editDisabled,
}: {
  eyebrow: string;
  showEdit: boolean;
  onEdit: () => void;
  editDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-foreground/70 font-mono text-[10px] font-bold tracking-widest uppercase">
        {eyebrow}
      </p>
      {showEdit ? (
        <button
          type="button"
          onClick={onEdit}
          disabled={editDisabled}
          aria-label={`Edit ${eyebrow}`}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/60 focus-visible:ring-primary/40 inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
        >
          Edit
          <IconPencil className="size-2.5" />
        </button>
      ) : null}
    </div>
  );
}

export function OverviewField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
        {label}
      </p>
      <p className="text-foreground text-xs font-medium wrap-break-word">
        {value || "—"}
      </p>
    </div>
  );
}
