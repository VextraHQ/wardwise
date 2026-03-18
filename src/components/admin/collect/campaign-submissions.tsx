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
  SheetDescription,
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
            className="pl-9 rounded-sm"
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
        <Button variant="outline" size="sm" onClick={handleExport} className="rounded-sm font-mono text-[11px] tracking-widest uppercase">
          <IconDownload className="mr-1 h-4 w-4" />
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
        <div className="border-border/60 rounded-sm border border-dashed py-12 text-center">
          <p className="text-muted-foreground">
            No submissions found.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-sm border">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase w-12 text-center">S/N</TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">Name</TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">Phone</TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase hidden 2xl:table-cell">
                    APC/NIN
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase hidden 2xl:table-cell">VIN</TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase hidden md:table-cell">LGA</TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase hidden md:table-cell">Ward</TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase hidden xl:table-cell">
                    Polling Unit
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">Role</TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">Status</TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase hidden lg:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((s, idx) => (
                  <TableRow
                    key={s.id}
                    className="hover:bg-muted/30 cursor-pointer"
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
                      <Badge variant="outline" className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase">
                        {roleLabels[s.role] || s.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {s.isVerified && (
                          <Badge variant="default" className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase">
                            Verified
                          </Badge>
                        )}
                        {s.isFlagged && (
                          <Badge variant="destructive" className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase">
                            Flagged
                          </Badge>
                        )}
                        {!s.isVerified && !s.isFlagged && (
                          <Badge variant="secondary" className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-xs lg:table-cell">
                      {new Date(s.createdAt).toLocaleDateString()}
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
        <SheetContent className="overflow-y-auto sm:max-w-md rounded-sm">
          <SheetHeader>
            <SheetTitle>{selected?.fullName}</SheetTitle>
            <SheetDescription>{selected?.phone}</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="space-y-5 px-4 pb-6">
              <Section label="Personal">
                <Field label="Email" value={selected.email || "—"} />
                <Field label="Sex" value={selected.sex} />
                <Field label="Age" value={String(selected.age)} />
                <Field label="Occupation" value={selected.occupation} />
                <Field label="Marital Status" value={selected.maritalStatus} />
              </Section>
              <Section label="Location">
                <Field label="LGA" value={selected.lgaName} />
                <Field label="Ward" value={selected.wardName} />
                <Field label="Polling Unit" value={formatPU(selected)} />
              </Section>
              <Section label="Verification">
                <Field label="APC/NIN" value={selected.apcRegNumber || "—"} />
                <Field label="VIN" value={selected.voterIdNumber || "—"} />
              </Section>
              <Section label="Role & Canvasser">
                <Field
                  label="Role"
                  value={roleLabels[selected.role] || selected.role}
                />
                <Field
                  label="Canvasser"
                  value={selected.canvasserName || "—"}
                />
                <Field
                  label="Canvasser Phone"
                  value={selected.canvasserPhone || "—"}
                />
              </Section>
              {(selected.customAnswer1 || selected.customAnswer2) && (
                <Section label="Custom Answers">
                  {selected.customAnswer1 && (
                    <Field label="Q1" value={selected.customAnswer1} />
                  )}
                  {selected.customAnswer2 && (
                    <Field label="Q2" value={selected.customAnswer2} />
                  )}
                </Section>
              )}
              <Section label="Admin Notes">
                <p className="text-sm">{selected.adminNotes || "No notes."}</p>
              </Section>
              <div className="border-border/40 mx-4 mt-2 flex flex-wrap gap-2 border-t pt-4">
                <Button
                  variant={selected.isFlagged ? "outline" : "destructive"}
                  size="sm"
                  className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
                  onClick={() => handleToggleFlag(selected)}
                >
                  {selected.isFlagged ? (
                    <IconFlagOff className="mr-1 h-4 w-4" />
                  ) : (
                    <IconFlag className="mr-1 h-4 w-4" />
                  )}
                  {selected.isFlagged ? "Unflag" : "Flag"}
                </Button>
                <Button
                  variant={selected.isVerified ? "outline" : "default"}
                  size="sm"
                  className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
                  onClick={() => handleVerify(selected)}
                >
                  <IconShieldCheck className="mr-1 h-4 w-4" />
                  {selected.isVerified ? "Unverify" : "Verify"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground ml-auto rounded-sm font-mono text-[11px] tracking-widest uppercase"
                  onClick={() => handleDelete(selected)}
                  disabled={deleteMutation.isPending}
                >
                  <IconTrash className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
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
    <div className="space-y-2">
      <h4 className="text-muted-foreground border-border/40 border-b pb-2 text-xs font-semibold tracking-wider uppercase">
        {label}
      </h4>
      <div className="bg-muted/20 space-y-2 rounded-sm p-3">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="truncate text-right font-medium capitalize">
        {value}
      </span>
    </div>
  );
}
