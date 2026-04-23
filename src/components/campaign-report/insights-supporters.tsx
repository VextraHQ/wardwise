"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";
import { IconCopy, IconSearch } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { StepCard, CardSectionHeader } from "@/components/collect/form-ui";
import { formatRole } from "@/lib/collect/reporting";
import { InsightsExportMenu } from "./insights-export-menu";
import { formatGeoDisplayName } from "@/lib/geo/display";
import { formatPersonName } from "@/lib/utils";
import { useCampaignReportSubmissions } from "@/hooks/use-campaign-report";
import { useIsPortraitMobile } from "@/hooks/use-mobile";
import { SubmissionStatusBadge } from "./insights-helpers";
import type { CampaignReportSubmission } from "@/types/campaign-report";

const EMPTY_SUPPORTERS: CampaignReportSubmission[] = [];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatPU(submission: CampaignReportSubmission) {
  if (submission.pollingUnitCode) {
    return `${submission.pollingUnitCode.padStart(3, "0")} - ${formatGeoDisplayName(submission.pollingUnitName)}`;
  }
  return formatGeoDisplayName(submission.pollingUnitName);
}

function buildContactSheet(rows: CampaignReportSubmission[]) {
  return rows
    .map(
      (row) =>
        `${formatPersonName(row.fullName)} — ${row.phone} — ${formatGeoDisplayName(row.lgaName)} / ${formatGeoDisplayName(row.wardName)} — ${formatPU(row)}`,
    )
    .join("\n");
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex min-w-0 items-center gap-2">
        <h4 className="text-foreground max-w-[85%] font-mono text-[10px] font-bold tracking-widest uppercase sm:max-w-none sm:whitespace-nowrap">
          {label}
        </h4>
        <div className="bg-border/70 h-px min-w-0 flex-1" />
      </div>
      <div className="grid min-w-0 gap-2.5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <span className="text-muted-foreground max-w-[46%] shrink-0 text-[10px] font-bold tracking-widest uppercase sm:max-w-[40%]">
        {label}
      </span>
      <span
        className={`text-foreground min-w-0 flex-1 text-right text-sm font-bold wrap-anywhere ${mono ? "font-mono text-xs break-all tabular-nums" : "wrap-break-word"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function InsightsSupporters({ token }: { token: string }) {
  const isPortraitMobile = useIsPortraitMobile();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedSubmission, setSelectedSubmission] =
    useState<CampaignReportSubmission | null>(null);
  const {
    data,
    isLoading: loading,
    error,
  } = useCampaignReportSubmissions(token, {
    page,
    pageSize,
    search: deferredSearch.trim() || undefined,
    status: statusFilter,
  });

  const submissions = data?.submissions ?? EMPTY_SUPPORTERS;
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const allOnPageSelected =
    submissions.length > 0 && submissions.every((s) => selectedIds.has(s.id));

  const selectedRows = useMemo(
    () => submissions.filter((submission) => selectedIds.has(submission.id)),
    [selectedIds, submissions],
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(submissions.map((submission) => submission.id)));
  };

  const copySelectedContacts = async () => {
    if (selectedRows.length === 0) return;
    try {
      await navigator.clipboard.writeText(buildContactSheet(selectedRows));
      toast.success("Selected contacts copied");
    } catch {
      toast.error("Failed to copy selected contacts");
    }
  };

  return (
    <StepCard>
      <CardSectionHeader
        title="Supporter Records"
        subtitle="Captured Supporters"
        statusLabel={
          total > 0
            ? `${total.toLocaleString()} saved`
            : "Awaiting first submission"
        }
        icon={<IconSearch className="size-4.5" />}
      />

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          <div className="relative min-w-0 sm:flex-1">
            <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by name or phone..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
                setSelectedIds(new Set());
              }}
              className="rounded-sm pl-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
                setSelectedIds(new Set());
              }}
            >
              <SelectTrigger className="w-full rounded-sm sm:w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>

            <InsightsExportMenu
              token={token}
              disabled={total === 0}
              query={{
                search: deferredSearch,
                status: statusFilter,
              }}
              className="h-9 w-full justify-center rounded-sm px-4 font-mono text-[10px] font-bold tracking-widest uppercase shadow-sm sm:w-auto"
            />
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="bg-primary/5 border-primary/20 flex flex-wrap items-center gap-2 rounded-sm border px-3 py-2">
            <span className="text-primary w-full text-xs font-bold sm:w-auto">
              {selectedIds.size} selected for follow-up
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-8 flex-1 rounded-sm px-2 text-[10px] font-bold tracking-wider uppercase sm:h-7 sm:flex-none"
              onClick={copySelectedContacts}
            >
              <IconCopy className="mr-1 h-3 w-3" />
              Copy Contacts
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-full px-2 text-[10px] font-bold tracking-wider uppercase sm:ml-auto sm:h-7 sm:w-auto"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-sm" />
            ))}
          </div>
        ) : error ? (
          <div className="border-destructive/30 bg-destructive/10 rounded-sm border p-4 text-center">
            <p className="text-destructive text-sm font-medium">
              {error instanceof Error
                ? error.message
                : "Failed to load supporter records"}
            </p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="border-border rounded-sm border border-dashed py-12 text-center">
            <p className="text-muted-foreground">No submissions found.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-sm border md:block">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-10 w-10 text-center">
                      <Checkbox
                        checked={allOnPageSelected}
                        onCheckedChange={toggleSelectAll}
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
                  {submissions.map((submission, idx) => (
                    <TableRow
                      key={submission.id}
                      className={`cursor-pointer transition-colors ${
                        submission.isFlagged
                          ? "bg-destructive/5 hover:bg-destructive/10"
                          : submission.isVerified
                            ? "bg-primary/5 hover:bg-primary/10"
                            : "hover:bg-muted/30"
                      }`}
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <TableCell
                        className="text-center"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedIds.has(submission.id)}
                          onCheckedChange={() => toggleSelect(submission.id)}
                          aria-label={`Select ${formatPersonName(submission.fullName)}`}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-center text-xs font-medium">
                        {(page - 1) * pageSize + idx + 1}
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
                          {formatRole(submission.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <SubmissionStatusBadge
                          isVerified={submission.isVerified}
                          isFlagged={submission.isFlagged}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden text-xs lg:table-cell">
                        {formatDate(submission.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-3 md:hidden">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className={`rounded-sm border p-3 ${
                    submission.isFlagged
                      ? "border-destructive/30 bg-destructive/5"
                      : submission.isVerified
                        ? "border-primary/20 bg-primary/5"
                        : "border-border/60"
                  }`}
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex items-start gap-3">
                    <div onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(submission.id)}
                        onCheckedChange={() => toggleSelect(submission.id)}
                        aria-label={`Select ${formatPersonName(submission.fullName)}`}
                        className="mt-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {formatPersonName(submission.fullName)}
                          </p>
                          <p className="text-muted-foreground font-mono text-[10px]">
                            {submission.phone}
                          </p>
                        </div>
                        <SubmissionStatusBadge
                          isVerified={submission.isVerified}
                          isFlagged={submission.isFlagged}
                        />
                      </div>
                      <div className="text-muted-foreground grid gap-1 text-xs">
                        <p>
                          {formatGeoDisplayName(submission.lgaName)} •{" "}
                          {formatGeoDisplayName(submission.wardName)}
                        </p>
                        <p>{formatPU(submission)}</p>
                        <p>{formatRole(submission.role)}</p>
                        <p className="font-mono">
                          {formatDate(submission.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <AdminPagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={total}
              itemLabel="supporters"
              onPageChange={(nextPage) => {
                setPage(nextPage);
                setSelectedIds(new Set());
              }}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
                setSelectedIds(new Set());
              }}
              pageSizeOptions={[10, 20, 30, 50]}
            />
          </>
        )}
      </div>

      <Sheet
        open={!!selectedSubmission}
        onOpenChange={(open) => !open && setSelectedSubmission(null)}
      >
        <SheetContent
          side={isPortraitMobile ? "bottom" : "right"}
          className="flex min-w-0 flex-col gap-0 overflow-x-hidden p-0 sm:max-w-md"
        >
          <div className="bg-muted/10 border-b">
            <SheetHeader className="min-w-0 space-y-1">
              <SheetTitle className="min-w-0 text-lg font-extrabold tracking-tight wrap-break-word sm:text-xl">
                {formatPersonName(selectedSubmission?.fullName)}
              </SheetTitle>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <code className="text-muted-foreground/80 bg-muted/60 max-w-full rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold break-all">
                  {selectedSubmission?.phone}
                </code>
                {selectedSubmission?.role && (
                  <Badge
                    variant="outline"
                    className="bg-primary/5 border-primary/20 text-primary shrink-0 rounded-sm px-1.5 py-0 font-mono text-[9px] font-bold tracking-widest uppercase"
                  >
                    {formatRole(selectedSubmission.role)}
                  </Badge>
                )}
              </div>
            </SheetHeader>
          </div>

          <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-5">
            {selectedSubmission && (
              <div className="min-w-0 space-y-6">
                <Section label="Personal Details">
                  <Field
                    label="Email"
                    value={selectedSubmission.email || "—"}
                  />
                  <Field label="Sex" value={selectedSubmission.sex} />
                  <Field
                    label="Age"
                    value={String(selectedSubmission.age)}
                    mono
                  />
                  <Field
                    label="Occupation"
                    value={selectedSubmission.occupation}
                  />
                  <Field
                    label="Marital Status"
                    value={selectedSubmission.maritalStatus}
                  />
                </Section>

                <Section label="Location Data">
                  <Field
                    label="LGA"
                    value={formatGeoDisplayName(selectedSubmission.lgaName)}
                  />
                  <Field
                    label="Ward"
                    value={formatGeoDisplayName(selectedSubmission.wardName)}
                  />
                  <Field
                    label="Polling Unit"
                    value={formatPU(selectedSubmission)}
                    mono
                  />
                </Section>

                <Section label="Submission Context">
                  <Field
                    label="Role"
                    value={formatRole(selectedSubmission.role)}
                  />
                  <Field
                    label="Status"
                    value={
                      selectedSubmission.isFlagged
                        ? "Flagged"
                        : selectedSubmission.isVerified
                          ? "Verified"
                          : "Pending"
                    }
                  />
                  <Field
                    label="Submitted"
                    value={formatDate(selectedSubmission.createdAt)}
                    mono
                  />
                </Section>

                <Section label="Source">
                  <Field
                    label="Canvasser"
                    value={selectedSubmission.canvasserName || "Direct / Self"}
                  />
                  <Field
                    label="Contact"
                    value={selectedSubmission.canvasserPhone || "—"}
                    mono
                  />
                </Section>
              </div>
            )}
          </div>

          {selectedSubmission && (
            <div className="bg-background shrink-0 border-t p-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
              <Button
                size="sm"
                variant="outline"
                className="h-9 w-full rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
                onClick={async () => {
                  const s = selectedSubmission;
                  const text = `${formatPersonName(s.fullName)} — ${s.phone} — ${formatGeoDisplayName(s.lgaName)} / ${formatGeoDisplayName(s.wardName)} — ${formatPU(s)}`;
                  try {
                    await navigator.clipboard.writeText(text);
                    toast.success("Contact copied");
                  } catch {
                    toast.error("Failed to copy contact");
                  }
                }}
              >
                <IconCopy className="mr-2 h-3.5 w-3.5" />
                Copy Contact
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </StepCard>
  );
}
