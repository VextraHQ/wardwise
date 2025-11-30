"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
} from "react-icons/hi";
import type { CanvasserWithCandidate } from "@/lib/api/admin";

interface AdminGridItemCanvasserProps {
  canvasser: CanvasserWithCandidate;
  onEdit: (canvasser: CanvasserWithCandidate) => void;
  onDelete: (canvasserId: string) => void;
  isLoading?: boolean;
}

export function AdminGridItemCanvasser({
  canvasser,
  onEdit,
  onDelete,
  isLoading = false,
}: AdminGridItemCanvasserProps) {
  return (
    <Card className="border-border/40 bg-card/50 hover:bg-card hover:border-primary/20 group flex h-full flex-col transition-all">
      <CardContent className="flex flex-1 flex-col">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="text-foreground line-clamp-2 text-base font-semibold tracking-tight">
              {canvasser.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="bg-secondary/50 text-secondary-foreground rounded-md px-1.5 py-0 text-[10px] font-medium sm:text-xs"
              >
                {canvasser.code}
              </Badge>
              <Badge
                variant="outline"
                className="border-border/50 text-[10px] font-medium sm:text-xs"
              >
                {canvasser.candidate.party}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-1">
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

        <div className="border-border/40 mt-auto space-y-2.5 border-t pt-3">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <HiOutlinePhone className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate" title={canvasser.phone}>
              {canvasser.phone}
            </span>
          </div>

          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <HiOutlineLocationMarker className="h-3.5 w-3.5 shrink-0" />
            <span
              className="line-clamp-1"
              title={
                canvasser.ward && canvasser.lga
                  ? `${canvasser.ward}, ${canvasser.lga}`
                  : canvasser.state || "N/A"
              }
            >
              {canvasser.ward && canvasser.lga
                ? `${canvasser.ward}, ${canvasser.lga}`
                : canvasser.state || "N/A"}
            </span>
          </div>

          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <HiOutlineBriefcase className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate" title={canvasser.candidate.name}>
              {canvasser.candidate.name}
            </span>
          </div>

          <div className="text-muted-foreground flex items-center justify-between pt-1 text-xs">
            <div
              className="flex items-center gap-1.5"
              title="Voters Registered"
            >
              <HiOutlineUserGroup className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">
                {canvasser.votersCount?.toLocaleString() || 0}
              </span>
              <span>voters</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
