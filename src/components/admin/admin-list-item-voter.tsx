"use client";

import { Button } from "@/components/ui/button";
import {
  HiOutlineTrash,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineIdentification,
  HiOutlineCalendar,
} from "react-icons/hi";
import type { Voter } from "@/types/voter";

interface AdminListItemVoterProps {
  voter: Voter;
  onDelete: (voterId: string) => void;
  isLoading?: boolean;
}

export function AdminListItemVoter({
  voter,
  onDelete,
  isLoading = false,
}: AdminListItemVoterProps) {
  const fullName =
    `${voter.firstName} ${voter.middleName || ""} ${voter.lastName}`.trim();

  return (
    <div className="border-border/40 bg-card/50 hover:bg-card hover:border-primary/20 group flex flex-col gap-4 rounded-xl border p-4 transition-all hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-foreground text-base font-semibold tracking-tight">
            {fullName}
          </h3>
          <div className="bg-secondary/50 text-secondary-foreground flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium">
            <HiOutlineIdentification className="h-3 w-3" />
            <span className="font-mono">{voter.nin}</span>
          </div>
        </div>

        {voter.email && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <HiOutlineMail className="h-3.5 w-3.5" />
            <span>{voter.email}</span>
          </div>
        )}

        <div className="text-muted-foreground/80 flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5" title="Location">
            <HiOutlineLocationMarker className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>
              {voter.state} • {voter.lga} • {voter.ward}
            </span>
          </div>

          <div
            className="ml-auto flex items-center gap-1.5 sm:ml-0"
            title="Registration Date"
          >
            <HiOutlineCalendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>
              {new Date(voter.registrationDate).toLocaleDateString("en-US", {
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
          onClick={() => onDelete(voter.id)}
          disabled={isLoading}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
          title="Delete Voter"
        >
          <HiOutlineTrash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
