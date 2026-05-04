"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconArrowRight,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconMail,
} from "@tabler/icons-react";

interface CredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  email: string;
  setupUrl: string;
  expiresAt: string;
  deliveryMethod: "email" | "manual";
}

export function CredentialsDialog({
  open,
  onOpenChange,
  candidateName,
  email,
  setupUrl,
  expiresAt,
  deliveryMethod,
}: CredentialsDialogProps) {
  const [showFullLink, setShowFullLink] = useState(false);

  function handleOpenChange(next: boolean) {
    if (!next) setShowFullLink(false);
    onOpenChange(next);
  }

  async function copySetupUrl() {
    try {
      await navigator.clipboard.writeText(setupUrl);
      toast.success("Setup URL copied");
    } catch {
      toast.error("Couldn't copy — try again or copy manually");
    }
  }

  async function copyCredentials() {
    const text = `WardWise Account Setup\n\nCandidate: ${candidateName}\nEmail: ${email}\nSecure setup link: ${setupUrl}\n\nThis link expires on ${new Date(expiresAt).toLocaleString("en-NG")}.`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Setup details copied");
    } catch {
      toast.error("Couldn't copy — try again or copy manually");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-sm">
        <DialogHeader>
          <DialogTitle>Account Created</DialogTitle>
          <DialogDescription>
            {deliveryMethod === "email"
              ? "A secure setup link has been emailed and is also available here for manual sharing."
              : "A secure setup link is ready. Share it with the candidate to finish account activation."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="bg-muted/50 rounded-sm p-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Candidate</span>
                <span className="font-medium">{candidateName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-mono text-xs">{email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium capitalize">{deliveryMethod}</span>
              </div>
              <div className="border-border/60 space-y-1.5 border-t pt-2">
                <span className="text-muted-foreground text-xs">
                  Setup link
                </span>
                <div className="bg-background/80 border-border/60 flex items-start justify-between gap-2 rounded-sm border p-2.5">
                  <span className="min-w-0 flex-1 font-mono text-xs break-all">
                    {showFullLink
                      ? setupUrl
                      : `${setupUrl.slice(0, 34)}...${setupUrl.slice(-12)}`}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label={
                            showFullLink ? "Hide full link" : "Show full link"
                          }
                          onClick={() => setShowFullLink((current) => !current)}
                        >
                          {showFullLink ? (
                            <IconEyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <IconEye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {showFullLink ? "Hide full link" : "Show full link"}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label="Copy setup URL"
                          onClick={() => void copySetupUrl()}
                        >
                          <IconCopy className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Copy setup URL</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Expires</span>
                <span className="font-mono text-xs">
                  {new Date(expiresAt).toLocaleString("en-NG")}
                </span>
              </div>
            </div>
          </div>

          <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-sm border p-2.5 text-xs">
            This secure link can only be used once and expires automatically. If
            it becomes invalid, send a fresh reset link from the candidate
            account page.
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-sm"
            onClick={() => handleOpenChange(false)}
          >
            <IconArrowRight className="mr-2 h-4 w-4" />
            Go to Candidate
          </Button>
          <Button
            className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
            onClick={() => void copyCredentials()}
          >
            {deliveryMethod === "email" ? (
              <IconMail className="mr-2 h-4 w-4" />
            ) : (
              <IconCopy className="mr-2 h-4 w-4" />
            )}
            {deliveryMethod === "email"
              ? "Copy Backup Details"
              : "Copy Setup Details"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
