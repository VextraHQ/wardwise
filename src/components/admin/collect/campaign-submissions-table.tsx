"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AdminMobileRecordCard,
  AdminMobileRecordField,
  AdminMobileRecordFields,
  AdminMobileRecordHeader,
  AdminMobileRecordMeta,
  AdminMobileRecordTitle,
} from "@/components/admin/shared/admin-mobile-record-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { roleLabels } from "@/lib/collect/analytics";
import { formatPU } from "@/lib/collect/campaign-submissions";
import { formatDisplayDateTime } from "@/lib/date-format";
import { formatGeoDisplayName } from "@/lib/geo/display";
import { cn, formatPersonName } from "@/lib/utils";
import type { SubmissionWithPU } from "@/types/campaign-submissions";

type CampaignSubmissionsTableProps = {
  submissions: SubmissionWithPU[];
  page: number;
  pageSize: number;
  selectedIds: ReadonlySet<string>;
  allOnPageSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onOpenSubmission: (submission: SubmissionWithPU) => void;
};

export function CampaignSubmissionsTable({
  submissions,
  page,
  pageSize,
  selectedIds,
  allOnPageSelected,
  onToggleSelectAll,
  onToggleSelect,
  onOpenSubmission,
}: CampaignSubmissionsTableProps) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {submissions.map((submission) => (
          <AdminMobileRecordCard
            key={submission.id}
            className={cn(
              "cursor-pointer transition-colors",
              submission.isFlagged
                ? "border-destructive/30 bg-destructive/5 hover:bg-destructive/10"
                : submission.isVerified
                  ? "border-primary/20 bg-primary/5 hover:bg-primary/10"
                  : "hover:bg-muted/30",
              selectedIds.has(submission.id) &&
                "border-primary/40 ring-primary/20 ring-1",
            )}
            onClick={() => onOpenSubmission(submission)}
          >
            <div className="flex min-w-0 items-start gap-3">
              <div onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(submission.id)}
                  onCheckedChange={() => onToggleSelect(submission.id)}
                  aria-label={`Select ${formatPersonName(submission.fullName)}`}
                  className="mt-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <AdminMobileRecordHeader>
                  <div className="min-w-0 flex-1">
                    <AdminMobileRecordTitle>
                      {formatPersonName(submission.fullName)}
                    </AdminMobileRecordTitle>
                    <AdminMobileRecordMeta mono>
                      {submission.phone}
                    </AdminMobileRecordMeta>
                  </div>
                  <SubmissionStatusBadges submission={submission} />
                </AdminMobileRecordHeader>
                <AdminMobileRecordFields>
                  <AdminMobileRecordField
                    label="Location"
                    value={`${formatGeoDisplayName(submission.lgaName)} / ${formatGeoDisplayName(submission.wardName)}`}
                  />
                  <AdminMobileRecordField
                    label="PU"
                    value={formatPU(submission)}
                    mono
                  />
                  <AdminMobileRecordField label="Role">
                    <Badge
                      variant="outline"
                      className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                    >
                      {roleLabels[submission.role] || submission.role}
                    </Badge>
                  </AdminMobileRecordField>
                  <AdminMobileRecordField
                    label="Submitted"
                    value={formatDisplayDateTime(submission.createdAt)}
                    mono
                  />
                </AdminMobileRecordFields>
              </div>
            </div>
          </AdminMobileRecordCard>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-sm border md:block">
        <Table>
          <TableHeader className="bg-muted/30 sticky top-0 z-10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-10 w-10 text-center">
                <Checkbox
                  checked={allOnPageSelected}
                  onCheckedChange={onToggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="text-muted-foreground h-10 w-14 text-center font-mono text-[10px] font-bold tracking-widest uppercase">
                S/N
              </TableHead>
              <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                Name
              </TableHead>
              <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                Phone
              </TableHead>
              <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase md:table-cell">
                LGA
              </TableHead>
              <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase md:table-cell">
                Ward
              </TableHead>
              <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase xl:table-cell">
                Polling Unit
              </TableHead>
              <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                Role
              </TableHead>
              <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase lg:table-cell">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission, index) => (
              <TableRow
                key={submission.id}
                className={
                  submission.isFlagged
                    ? "bg-destructive/5 hover:bg-destructive/10 cursor-pointer transition-colors"
                    : submission.isVerified
                      ? "bg-brand-emerald/5 hover:bg-brand-emerald/10 cursor-pointer transition-colors"
                      : "hover:bg-muted/30 cursor-pointer transition-colors"
                }
                onClick={() => onOpenSubmission(submission)}
              >
                <TableCell
                  className="text-center"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedIds.has(submission.id)}
                    onCheckedChange={() => onToggleSelect(submission.id)}
                    aria-label={`Select ${formatPersonName(submission.fullName)}`}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground text-center text-xs font-medium">
                  {(page - 1) * pageSize + index + 1}
                </TableCell>
                <TableCell className="font-medium">
                  {formatPersonName(submission.fullName)}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {submission.phone}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatGeoDisplayName(submission.lgaName)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatGeoDisplayName(submission.wardName)}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <code className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-xs">
                    {formatPU(submission)}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                  >
                    {roleLabels[submission.role] || submission.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <SubmissionStatusBadges submission={submission} />
                </TableCell>
                <TableCell className="text-muted-foreground hidden text-xs lg:table-cell">
                  {formatDisplayDateTime(submission.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function SubmissionStatusBadges({
  submission,
}: {
  submission: SubmissionWithPU;
}) {
  return (
    <div className="flex min-w-0 flex-wrap justify-end gap-1">
      {submission.isVerified && (
        <Badge
          variant="outline"
          className="bg-primary/10 text-primary border-primary/30 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
        >
          Verified
        </Badge>
      )}
      {submission.isFlagged && (
        <Badge
          variant="outline"
          className="bg-destructive/10 text-destructive border-destructive/30 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
        >
          Flagged
        </Badge>
      )}
      {!submission.isVerified && !submission.isFlagged && (
        <Badge
          variant="outline"
          className="rounded-sm border-orange-500/20 bg-orange-500/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-orange-600 uppercase"
        >
          Pending Review
        </Badge>
      )}
    </div>
  );
}
