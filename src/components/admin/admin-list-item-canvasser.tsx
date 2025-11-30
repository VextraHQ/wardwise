"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
} from "react-icons/hi";
import type { CanvasserWithCandidate } from "@/lib/api/admin";

interface AdminListItemCanvasserProps {
  canvasser: CanvasserWithCandidate;
  onEdit: (canvasser: CanvasserWithCandidate) => void;
  onDelete: (canvasserId: string) => void;
  isLoading?: boolean;
}

export function AdminListItemCanvasser({
  canvasser,
  onEdit,
  onDelete,
  isLoading = false,
}: AdminListItemCanvasserProps) {
  return (
    <div className="border-border/40 bg-card/50 hover:bg-card hover:border-primary/20 group flex flex-col gap-4 rounded-xl border p-4 transition-all hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-foreground text-base font-semibold tracking-tight">
            {canvasser.name}
          </h3>
          <Badge
            variant="secondary"
            className="bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 rounded-md px-2.5 py-0.5 text-xs font-medium"
          >
            {canvasser.code}
          </Badge>
          <Badge
            variant="outline"
            className="border-border/50 text-xs font-medium"
          >
            {canvasser.candidate.party}
          </Badge>
        </div>

        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <HiOutlinePhone className="h-3.5 w-3.5" />
          <span>{canvasser.phone}</span>
        </div>

        <div className="text-muted-foreground/80 flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5" title="Location">
            <HiOutlineLocationMarker className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>
              {canvasser.ward && canvasser.lga
                ? `${canvasser.ward}, ${canvasser.lga}`
                : canvasser.state || "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-1.5" title="Candidate">
            <HiOutlineBriefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{canvasser.candidate.name}</span>
          </div>

          <div className="flex items-center gap-1.5" title="Voters Registered">
            <HiOutlineUserGroup className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-foreground font-medium">
              {canvasser.votersCount?.toLocaleString() || 0}
            </span>
            <span>voters</span>
          </div>
        </div>
      </div>

      <div className="sm:border-border/40 flex items-center gap-2 self-start sm:self-center sm:border-l sm:pl-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(canvasser)}
          disabled={isLoading}
          className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 h-8 w-8"
          title="Edit Canvasser"
        >
          <HiOutlinePencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(canvasser.id)}
          disabled={isLoading}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
          title="Delete Canvasser"
        >
          <HiOutlineTrash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
