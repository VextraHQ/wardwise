"use client";

import type { ReactNode } from "react";

import {
  IconCopy,
  IconFlag,
  IconFlagOff,
  IconShieldCheck,
  IconTrash,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { roleLabels } from "@/lib/collect/analytics";
import {
  formatPU,
  getSubmissionRefCode,
} from "@/lib/collect/campaign-submissions";
import { formatDisplayDateTime } from "@/lib/date-format";
import { formatGeoDisplayName } from "@/lib/geo/display";
import { formatPersonName } from "@/lib/utils";
import type {
  SubmissionAuditEntry,
  SubmissionWithPU,
} from "@/types/campaign-submissions";

type CampaignSubmissionDetailSheetProps = {
  selected: SubmissionWithPU | null;
  isPortraitMobile: boolean;
  adminNotes: string;
  onAdminNotesChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onCopyReference: (refCode: string) => void;
  onSaveNotes: () => void;
  onToggleFlag: () => void;
  onVerify: () => void;
  onDelete: () => void;
  updatePending: boolean;
  deletePending: boolean;
  auditEntries: SubmissionAuditEntry[];
};

export function CampaignSubmissionDetailSheet({
  selected,
  isPortraitMobile,
  adminNotes,
  onAdminNotesChange,
  onOpenChange,
  onCopyReference,
  onSaveNotes,
  onToggleFlag,
  onVerify,
  onDelete,
  updatePending,
  deletePending,
  auditEntries,
}: CampaignSubmissionDetailSheetProps) {
  const submissionRefCode = selected ? getSubmissionRefCode(selected) : "";

  return (
    <Sheet open={!!selected} onOpenChange={onOpenChange}>
      <SheetContent
        side={isPortraitMobile ? "bottom" : "right"}
        className="flex min-w-0 flex-col gap-0 overflow-x-hidden p-0 sm:max-w-md"
      >
        <div className="bg-muted/10 border-b">
          <SheetHeader className="min-w-0 space-y-1">
            <SheetTitle className="min-w-0 text-lg font-extrabold tracking-tight wrap-break-word sm:text-xl">
              {selected ? formatPersonName(selected.fullName) : ""}
            </SheetTitle>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <code className="text-muted-foreground/80 bg-muted/60 max-w-full rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold break-all">
                {selected?.phone}
              </code>
              {selected?.role && (
                <Badge
                  variant="outline"
                  className="bg-primary/5 border-primary/20 text-primary shrink-0 rounded-sm px-1.5 py-0 font-mono text-[10px] font-bold tracking-widest uppercase"
                >
                  {roleLabels[selected.role] || selected.role}
                </Badge>
              )}
            </div>
            {selected && (
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                <span className="text-muted-foreground shrink-0 font-medium">
                  Ref
                </span>
                <code className="text-muted-foreground min-w-0 flex-1 font-mono tracking-[0.18em] break-all uppercase sm:flex-initial">
                  {submissionRefCode}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-6 shrink-0 rounded-sm px-1.5"
                  onClick={() => onCopyReference(submissionRefCode)}
                  aria-label="Copy registration reference"
                >
                  <IconCopy className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </SheetHeader>
        </div>

        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
          {selected && (
            <div className="min-w-0 space-y-6 p-5">
              <Section label="Personal Identity">
                <Field label="Email" value={selected.email || "—"} />
                <Field label="Sex" value={selected.sex} />
                <Field label="Age" value={String(selected.age)} />
                <Field label="Occupation" value={selected.occupation} />
                <Field label="Marital Status" value={selected.maritalStatus} />
              </Section>

              <Section label="Location Data">
                <Field
                  label="LGA"
                  value={formatGeoDisplayName(selected.lgaName)}
                />
                <Field
                  label="Ward"
                  value={formatGeoDisplayName(selected.wardName)}
                />
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
                {selected.role !== "canvasser" && (
                  <>
                    <Field
                      label="Agent/Canv."
                      value={selected.canvasserName || "—"}
                    />
                    <Field
                      label="Agent Contact"
                      value={selected.canvasserPhone || "—"}
                      mono
                    />
                  </>
                )}
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
                <Textarea
                  value={adminNotes}
                  onChange={(event) => onAdminNotesChange(event.target.value)}
                  placeholder="Add administrative notes..."
                  className="border-border/60 min-h-[80px] w-full min-w-0 rounded-sm text-sm"
                />
                {adminNotes !== (selected.adminNotes || "") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase"
                    disabled={updatePending}
                    onClick={onSaveNotes}
                  >
                    Save Notes
                  </Button>
                )}
              </Section>

              {auditEntries.length > 0 && (
                <Section label="History">
                  <div className="max-h-40 space-y-2 overflow-y-auto">
                    {auditEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="border-border/60 flex min-w-0 items-start gap-2 border-l-2 pl-3 text-xs"
                      >
                        <div className="min-w-0 flex-1 wrap-break-word">
                          <span className="font-medium">{entry.userName}</span>{" "}
                          <span className="text-muted-foreground">
                            {entry.action}
                          </span>
                        </div>
                        <span className="text-muted-foreground shrink-0 text-[10px]">
                          {formatDisplayDateTime(entry.createdAt, {
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}
        </div>

        <div className="bg-background min-w-0 shrink-0 border-t p-4 pb-[max(env(safe-area-inset-bottom),1rem)] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] sm:p-5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="flex min-w-0 flex-1 flex-wrap gap-2 sm:flex-initial">
              <Button
                variant={selected?.isFlagged ? "outline" : "destructive"}
                size="sm"
                className="h-8 flex-1 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase transition-all sm:flex-initial"
                onClick={onToggleFlag}
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
                className="h-8 flex-1 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase transition-all sm:flex-initial"
                onClick={onVerify}
              >
                <IconShieldCheck className="mr-2 h-3.5 w-3.5" />
                {selected?.isVerified ? "Unverify" : "Verify"}
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full rounded-sm border-red-500/20 px-3 font-mono text-[10px] font-bold tracking-widest text-red-600 uppercase transition-all hover:bg-red-600 hover:text-white sm:ml-auto sm:w-auto"
              onClick={onDelete}
              disabled={deletePending}
            >
              <IconTrash className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
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
