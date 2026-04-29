"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useDeleteCandidate,
  useResetCandidatePassword,
  useUpdateCandidateStatus,
} from "@/hooks/use-admin";

import type { CandidateWithUser } from "@/lib/api/admin";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  IconKey,
  IconEye,
  IconEyeOff,
  IconCopy,
  IconDeviceFloppy,
  IconTrash,
} from "@tabler/icons-react";
import { DeleteCandidateDialog } from "@/components/admin/admin-dialogs/delete-candidate-dialog";

const ONBOARDING_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "credentials_sent", label: "Credentials Sent" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

const STATUS_THEME: Record<string, { text: string; item: string }> = {
  pending: {
    text: "text-orange-600",
    item: "focus:bg-orange-500/10 focus:text-orange-600 data-[state=checked]:bg-orange-500/5 text-muted-foreground",
  },
  credentials_sent: {
    text: "text-foreground",
    item: "focus:bg-border/40 focus:text-foreground data-[state=checked]:bg-border/30 text-muted-foreground",
  },
  active: {
    text: "text-primary",
    item: "focus:bg-primary/10 focus:text-primary data-[state=checked]:bg-primary/5 text-muted-foreground",
  },
  suspended: {
    text: "text-destructive",
    item: "focus:bg-destructive/10 focus:text-destructive data-[state=checked]:bg-destructive/5 text-muted-foreground",
  },
};

interface CandidateAccountProps {
  candidate: CandidateWithUser;
}

export function CandidateAccount({ candidate }: CandidateAccountProps) {
  const router = useRouter();
  const [resetLinkData, setResetLinkData] = useState<{
    url: string;
    expiresAt: string;
    deliveryMethod: "email" | "manual";
  } | null>(null);
  const [showFullLink, setShowFullLink] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    candidate.onboardingStatus,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteMutation = useDeleteCandidate();

  const resetPasswordMutation = useResetCandidatePassword();

  const updateStatusMutation = useUpdateCandidateStatus();

  function copyResetLink() {
    if (!resetLinkData) return;
    navigator.clipboard.writeText(resetLinkData.url);
    toast.success("Reset link copied to clipboard");
  }

  function handleStatusSave() {
    if (selectedStatus !== candidate.onboardingStatus) {
      updateStatusMutation.mutate(
        { id: candidate.id, status: selectedStatus },
        {
          onSuccess: () => toast.success("Status updated"),
          onError: (error: Error) =>
            toast.error(error.message || "Failed to update status"),
        },
      );
    }
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Account Info */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader className="border-border/60 border-b">
          <CardTitle className="text-foreground font-mono text-[11px] font-bold tracking-widest uppercase">
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                Email
              </p>
              <p className="mt-0.5 text-sm font-medium">
                {candidate.user?.email}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                Phone
              </p>
              <p className="mt-0.5 text-sm font-medium">
                {candidate.phone || "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                Account Created
              </p>
              <p className="mt-0.5 text-sm font-medium">
                {new Date(candidate.user?.createdAt).toLocaleDateString(
                  "en-NG",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                Role
              </p>
              <p className="mt-0.5 text-sm font-medium capitalize">
                {candidate.user?.role}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Status */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader className="border-border/60 border-b">
          <CardTitle className="text-foreground font-mono text-[11px] font-bold tracking-widest uppercase">
            Onboarding Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                Current status
              </p>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger
                  className={cn(
                    "border-border/60 h-9 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase sm:w-[220px]",
                    STATUS_THEME[selectedStatus]?.text,
                  )}
                >
                  <span>
                    {
                      ONBOARDING_STATUSES.find(
                        (s) => s.value === selectedStatus,
                      )?.label
                    }
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {ONBOARDING_STATUSES.map((s) => (
                    <SelectItem
                      key={s.value}
                      value={s.value}
                      className={cn(
                        "my-0.5 cursor-pointer font-mono text-[10px] font-bold tracking-widest uppercase transition-all",
                        STATUS_THEME[s.value]?.item,
                      )}
                    >
                      <span>{s.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
              disabled={
                selectedStatus === candidate.onboardingStatus ||
                updateStatusMutation.isPending
              }
              onClick={handleStatusSave}
            >
              <IconDeviceFloppy className="mr-1.5 h-3.5 w-3.5" />
              {updateStatusMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Password */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader className="border-border/60 border-b">
          <CardTitle className="text-foreground font-mono text-[11px] font-bold tracking-widest uppercase">
            Password Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-xs">
            Issue a fresh secure reset link for this candidate. The link can be
            emailed automatically when configured, or copied manually for ops
            handoff.
          </p>

          {resetLinkData && (
            <div className="bg-muted/50 border-border/60 flex items-center justify-between rounded-sm border p-3">
              <span className="font-mono text-sm">
                {showFullLink
                  ? resetLinkData.url
                  : `${resetLinkData.url.slice(0, 34)}...${resetLinkData.url.slice(-12)}`}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowFullLink((current) => !current)}
                >
                  {showFullLink ? (
                    <IconEyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <IconEye className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={copyResetLink}
                >
                  <IconCopy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {resetLinkData && (
            <div className="border-border/50 bg-muted/15 rounded-sm border px-3 py-2 text-xs">
              <p className="text-foreground font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
                Delivery status
              </p>
              <p className="text-muted-foreground mt-1 leading-relaxed">
                {resetLinkData.deliveryMethod === "email"
                  ? "The reset link was emailed and is also available here as a backup."
                  : "Email delivery is not configured, so share this link manually."}
              </p>
              <p className="text-muted-foreground mt-1">
                Expires{" "}
                <span className="font-medium">
                  {new Date(resetLinkData.expiresAt).toLocaleString("en-NG")}
                </span>
              </p>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
            disabled={resetPasswordMutation.isPending}
            onClick={() =>
              resetPasswordMutation.mutate(candidate.id, {
                onSuccess: (data) => {
                  setResetLinkData({
                    url: data.resetUrl,
                    expiresAt: data.expiresAt,
                    deliveryMethod: data.deliveryMethod,
                  });
                  setShowFullLink(true);
                  toast.success(
                    data.deliveryMethod === "email"
                      ? "Reset email sent"
                      : "Reset link created",
                  );
                },
                onError: (error: Error) =>
                  toast.error(error.message || "Failed to create reset link"),
              })
            }
          >
            <IconKey className="mr-1.5 h-3.5 w-3.5" />
            {resetPasswordMutation.isPending
              ? "Creating..."
              : "Send Reset Link"}
          </Button>
        </CardContent>
      </Card>
      {/* Danger Zone */}
      <div className="border-destructive/30 rounded-sm border">
        <div className="border-destructive/20 bg-destructive/5 flex items-center gap-3 border-b px-5 py-4">
          <IconTrash className="text-destructive h-4 w-4 shrink-0" />
          <div>
            <p className="text-destructive text-sm font-semibold">
              Danger Zone
            </p>
            <p className="text-destructive/70 text-xs">
              Actions here are permanent and cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Delete this candidate account</p>
            <p className="text-muted-foreground text-xs">
              Permanently removes {candidate.name}&apos;s account, all their
              campaigns, supporter data, and canvasser records. This cannot be
              reversed.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/40 text-destructive hover:bg-destructive shrink-0 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase transition-colors hover:text-white"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <IconTrash className="mr-1.5 h-3.5 w-3.5" />
            Delete Account
          </Button>
        </div>
      </div>

      <DeleteCandidateDialog
        candidateId={candidate.id}
        candidateName={candidate.name}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() =>
          deleteMutation.mutate(candidate.id, {
            onSuccess: () => {
              toast.success("Candidate account permanently deleted");
              router.push("/admin/candidates");
            },
            onError: (error: Error) =>
              toast.error(error.message || "Failed to delete candidate"),
          })
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
