"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUsers,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineBriefcase,
} from "react-icons/hi";
import type { CandidateWithUser } from "@/lib/api/admin";

interface AdminGridItemCandidateProps {
  candidate: CandidateWithUser;
  onEdit: (candidate: CandidateWithUser) => void;
  onDelete: (candidateId: string) => void;
  isLoading?: boolean;
}

export function AdminGridItemCandidate({
  candidate,
  onEdit,
  onDelete,
  isLoading = false,
}: AdminGridItemCandidateProps) {
  return (
    <Card className="border-border/40 bg-card/50 hover:bg-card hover:border-primary/20 group flex h-full flex-col transition-all">
      <CardContent className="flex flex-1 flex-col">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="text-foreground line-clamp-2 text-base font-semibold tracking-tight">
              {candidate.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="bg-secondary/50 text-secondary-foreground rounded-md px-1.5 py-0 text-[10px] font-medium sm:text-xs"
              >
                {candidate.party}
              </Badge>
              <div className="text-muted-foreground flex items-center gap-1 text-[10px] sm:text-xs">
                <HiOutlineBriefcase className="h-3 w-3" />
                <span>{candidate.position}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(candidate)}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 h-8 w-8"
              title="Edit Candidate"
            >
              <HiOutlinePencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(candidate.id)}
              disabled={isLoading}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
              title="Delete Candidate"
            >
              <HiOutlineTrash className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="border-border/40 mt-auto space-y-2.5 border-t pt-3">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <HiOutlineMail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate" title={candidate.user.email}>
              {candidate.user.email}
            </span>
          </div>

          {candidate.constituency && (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <HiOutlineLocationMarker className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1" title={candidate.constituency}>
                {candidate.constituency}
              </span>
            </div>
          )}

          <div className="text-muted-foreground flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-1.5" title="Supporters">
              <HiOutlineUsers className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">
                {candidate.supporters.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5" title="Date Created">
              <HiOutlineCalendar className="h-3.5 w-3.5" />
              <span>
                {new Date(candidate.user.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    year: "2-digit",
                  },
                )}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
