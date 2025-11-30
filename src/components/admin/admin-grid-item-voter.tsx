"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  HiOutlineTrash,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineIdentification,
} from "react-icons/hi";
import type { Voter } from "@/types/voter";

interface AdminGridItemVoterProps {
  voter: Voter;
  onDelete: (voterId: string) => void;
  isLoading?: boolean;
}

export function AdminGridItemVoter({
  voter,
  onDelete,
  isLoading = false,
}: AdminGridItemVoterProps) {
  const fullName =
    `${voter.firstName} ${voter.middleName || ""} ${voter.lastName}`.trim();

  return (
    <Card className="border-border/40 bg-card/50 hover:bg-card hover:border-primary/20 group flex h-full flex-col transition-all">
      <CardContent className="flex flex-1 flex-col">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="text-foreground line-clamp-2 text-base font-semibold tracking-tight">
              {fullName}
            </h3>
            <div className="bg-secondary/50 text-secondary-foreground flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium">
              <HiOutlineIdentification className="h-3 w-3" />
              <span className="font-mono">{voter.nin}</span>
            </div>
          </div>

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

        <div className="border-border/40 mt-auto space-y-2.5 border-t pt-3">
          {voter.email && (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <HiOutlineMail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate" title={voter.email}>
                {voter.email}
              </span>
            </div>
          )}

          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <HiOutlineLocationMarker className="h-3.5 w-3.5 shrink-0" />
            <span
              className="line-clamp-1"
              title={`${voter.state} • ${voter.lga} • ${voter.ward}`}
            >
              {voter.state} • {voter.lga} • {voter.ward}
            </span>
          </div>

          <div className="text-muted-foreground flex items-center justify-between pt-1 text-xs">
            <div
              className="flex items-center gap-1.5"
              title="Registration Date"
            >
              <HiOutlineCalendar className="h-3.5 w-3.5" />
              <span>
                {new Date(voter.registrationDate).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
