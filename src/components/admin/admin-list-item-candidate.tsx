"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineUsers,
  HiOutlineCalendar,
} from "react-icons/hi";
import type { CandidateWithUser } from "@/lib/api/admin";

interface AdminListItemCandidateProps {
  candidate: CandidateWithUser;
  onEdit: (candidate: CandidateWithUser) => void;
  onDelete: (candidateId: string) => void;
  isLoading?: boolean;
}

export function AdminListItemCandidate({
  candidate,
  onEdit,
  onDelete,
  isLoading = false,
}: AdminListItemCandidateProps) {
  return (
    <div className="border-border/60 bg-card/50 hover:bg-card hover:border-primary/20 group flex flex-col gap-4 rounded-sm border p-4 transition-all sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-foreground text-base font-semibold tracking-tight">
            {candidate.name}
          </h3>
          <Badge
            variant="secondary"
            className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
          >
            {candidate.party}
          </Badge>
        </div>

        <p className="text-muted-foreground text-sm">{candidate.user.email}</p>

        <div className="text-muted-foreground/80 flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5" title="Position">
            <HiOutlineBriefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{candidate.position}</span>
          </div>

          {candidate.constituency && (
            <div className="flex items-center gap-1.5" title="Constituency">
              <HiOutlineLocationMarker className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{candidate.constituency}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5" title="Supporters">
            <HiOutlineUsers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-foreground font-medium font-mono tabular-nums">
              {candidate.supporters.toLocaleString()}
            </span>
            <span>supporters</span>
          </div>

          <div
            className="ml-auto flex items-center gap-1.5 sm:ml-0"
            title="Date Created"
          >
            <HiOutlineCalendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>
              {new Date(candidate.user.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="sm:border-border/40 flex items-center gap-2 self-start sm:self-center sm:border-l sm:pl-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(candidate)}
          disabled={isLoading}
          className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 h-8 w-8 rounded-sm"
          title="Edit Candidate"
        >
          <HiOutlinePencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(candidate.id)}
          disabled={isLoading}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-sm"
          title="Delete Candidate"
        >
          <HiOutlineTrash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
