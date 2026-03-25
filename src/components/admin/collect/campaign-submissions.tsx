"use client";

import { useState } from "react";
import {
  useCampaignSubmissions,
  useUpdateSubmission,
  useDeleteSubmission,
} from "@/hooks/use-collect";
import { adminCollectApi } from "@/lib/api/collect";
import { roleLabels } from "@/lib/helpers/collect-analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { toast } from "sonner";
import {
  IconDownload,
  IconFlag,
  IconFlagOff,
  IconSearch,
  IconShieldCheck,
  IconTrash,
} from "@tabler/icons-react";
import type { CollectSubmission } from "@/types/collect";

// Extended type to include nested polling unit from API
type SubmissionWithPU = CollectSubmission & {
  pollingUnit?: { id: number; code: string; name: string } | null;
};

function formatPU(sub: SubmissionWithPU) {
  const code = sub.pollingUnit?.code;
  if (code) return `${code.padStart(3, "0")} - ${sub.pollingUnitName}`;
  return sub.pollingUnitName;
}

export function CampaignSubmissions({ campaignId }: { campaignId: string }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selected, setSelected] = useState<SubmissionWithPU | null>(null);

  const { data, isLoading } = useCampaignSubmissions(campaignId, {
    page,
    pageSize,
    search: search || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
  });

  const updateMutation = useUpdateSubmission();
  const deleteMutation = useDeleteSubmission();
  const submissions = (data?.submissions || []) as SubmissionWithPU[];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const handleExport = async () => {
    try {
      await adminCollectApi.exportCsv(campaignId);
      toast.success("CSV exported");
    } catch {
      toast.error("Export failed");
    }
  };

  const handleToggleFlag = (sub: SubmissionWithPU) => {
    updateMutation.mutate(
      { sid: sub.id, data: { isFlagged: !sub.isFlagged } },
      {
        onSuccess: () => toast.success(sub.isFlagged ? "Unflagged" : "Flagged"),
      },
    );
  };

  const handleDelete = (sub: SubmissionWithPU) => {
    if (
      !confirm(`Delete submission from ${sub.fullName}? This cannot be undone.`)
    )
      return;
    deleteMutation.mutate(sub.id, {
      onSuccess: () => {
        toast.success("Submission deleted");
        setSelected(null);
      },
      onError: (e) => toast.error(e.message),
    });
  };

  const handleVerify = (sub: SubmissionWithPU) => {
    updateMutation.mutate(
      { sid: sub.id, data: { isVerified: !sub.isVerified } },
      {
        onSuccess: () =>
          toast.success(sub.isVerified ? "Unverified" : "Verified"),
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-sm pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40 rounded-sm">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="volunteer">Volunteer</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="canvasser">Canvasser</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="h-9 rounded-sm px-4 font-mono text-[10px] font-bold tracking-widest uppercase shadow-sm"
        >
          <IconDownload className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="border-border rounded-sm border border-dashed py-12 text-center">
          <p className="text-muted-foreground">No submissions found.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-sm border">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="text-muted-foreground h-10 w-12 text-center font-mono text-[10px] font-bold tracking-widest uppercase">
                    S/N
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Name
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Phone
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase 2xl:table-cell">
                    APC/NIN
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase 2xl:table-cell">
                    VIN
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
                {submissions.map((s, idx) => (
                   <TableRow
                     key={s.id}
                     className={`cursor-pointer transition-colors ${
                       s.isFlagged
                         ? "bg-destructive/5 hover:bg-destructive/10"
                         : s.isVerified
                           ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                           : "hover:bg-muted/30"
                     }`}
                     onClick={() => setSelected(s)}
                   >
                    <TableCell className="text-muted-foreground text-center text-xs font-medium">
                      {(page - 1) * pageSize + idx + 1}
                    </TableCell>
                    <TableCell className="font-medium">{s.fullName}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {s.phone}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs 2xl:table-cell">
                      {s.apcRegNumber || "—"}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs 2xl:table-cell">
                      {s.voterIdNumber || "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {s.lgaName}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {s.wardName}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <code className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-xs">
                        {formatPU(s)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                      >
                        {roleLabels[s.role] || s.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {s.isVerified && (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/30 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                          >
                            Verified
                          </Badge>
                        )}
                        {s.isFlagged && (
                          <Badge
                            variant="outline"
                            className="bg-destructive/10 text-destructive border-destructive/30 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                          >
                            Flagged
                          </Badge>
                        )}
                        {!s.isVerified && !s.isFlagged && (
                          <Badge
                            variant="outline"
                            className="rounded-sm border-orange-500/20 bg-orange-500/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-orange-600 uppercase"
                          >
                            Pending
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-xs lg:table-cell">
                      {new Date(s.createdAt).toLocaleString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        },
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={total}
            itemLabel="submissions"
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </>
      )}

      {/* Detail Sheet */}
      <Sheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
          <div className="bg-muted/10 border-b">
            <SheetHeader className="space-y-1">
              <SheetTitle className="text-lg font-extrabold tracking-tight sm:text-xl">
                {selected?.fullName}
              </SheetTitle>
              <div className="flex items-center gap-2">
                <code className="text-muted-foreground/80 bg-muted/60 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold">
                  {selected?.phone}
                </code>
                {selected?.role && (
                  <Badge
                    variant="outline"
                    className="bg-primary/5 border-primary/20 text-primary rounded-sm px-1.5 py-0 font-mono text-[9px] font-bold tracking-widest uppercase"
                  >
                    {roleLabels[selected.role] || selected.role}
                  </Badge>
                )}
              </div>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto">
            {selected && (
              <div className="space-y-6 p-5 pb-24">
                <Section label="Personal Identity">
                  <Field label="Email" value={selected.email || "—"} />
                  <Field label="Sex" value={selected.sex} />
                  <Field label="Age" value={String(selected.age)} />
                  <Field label="Occupation" value={selected.occupation} />
                  <Field
                    label="Marital Status"
                    value={selected.maritalStatus}
                  />
                </Section>

                <Section label="Location Data">
                  <Field label="LGA" value={selected.lgaName} />
                  <Field label="Ward" value={selected.wardName} />
                  <Field label="Polling Unit" value={formatPU(selected)} mono />
                </Section>

                <Section label="Verification Info">
                  <Field
                    label="APC/NIN Num."
                    value={selected.apcRegNumber || "—"}
                    mono
                  />
                  <Field
                    label="Voter's ID"
                    value={selected.voterIdNumber || "—"}
                    mono
                  />
                </Section>

                <Section label="Source & Context">
                  <Field
                    label="Assigned Role"
                    value={roleLabels[selected.role] || selected.role}
                  />
                  <Field
                    label="Agent/Canv."
                    value={selected.canvasserName || "—"}
                  />
                  <Field
                    label="Agent Contact"
                    value={selected.canvasserPhone || "—"}
                    mono
                  />
                </Section>

                {(selected.customAnswer1 || selected.customAnswer2) && (
                  <Section label="Submission Specifics">
                    {selected.customAnswer1 && (
                      <Field label="Q1" value={selected.customAnswer1} />
                    )}
                    {selected.customAnswer2 && (
                      <Field label="Q2" value={selected.customAnswer2} />
                    )}
                  </Section>
                )}

                <Section label="Admin Notes">
                  <p className="text-foreground border-primary/20 border-l-2 pl-4 text-[13px] leading-relaxed font-medium italic">
                    {selected.adminNotes || "No administrative notes provided."}
                  </p>
                </Section>
              </div>
            )}
          </div>

          <div className="bg-background absolute right-0 bottom-0 left-0 border-t p-5 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-2">
              <Button
                variant={selected?.isFlagged ? "outline" : "destructive"}
                size="sm"
                className="h-8 rounded-sm px-3 font-mono text-[9px] font-bold tracking-widest uppercase transition-all"
                onClick={() => selected && handleToggleFlag(selected)}
              >
                {selected?.isFlagged ? (
                  <IconFlagOff className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <IconFlag className="mr-2 h-3.5 w-3.5" />
                )}
                {selected?.isFlagged ? "Unflag" : "Flag"}
              </Button>
              <Button
                variant={selected?.isVerified ? "outline" : "default"}
                size="sm"
                className="h-8 rounded-sm px-3 font-mono text-[9px] font-bold tracking-widest uppercase transition-all"
                onClick={() => selected && handleVerify(selected)}
              >
                <IconShieldCheck className="mr-2 h-3.5 w-3.5" />
                {selected?.isVerified ? "Unverify" : "Verify"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto h-8 rounded-sm border-red-500/20 px-3 font-mono text-[9px] font-bold tracking-widest text-red-600 uppercase transition-all hover:bg-red-600 hover:text-white"
                onClick={() => selected && handleDelete(selected)}
                disabled={deleteMutation.isPending}
              >
                <IconTrash className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="text-foreground font-mono text-[10px] font-bold tracking-widest whitespace-nowrap uppercase">
          {label}
        </h4>
        <div className="bg-border/70 h-px flex-1" />
      </div>
      <div className="grid gap-2.5">{children}</div>
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
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
        {label}
      </span>
      <span
        className={`text-foreground text-right text-sm font-bold ${mono ? "font-mono text-xs tabular-nums" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
