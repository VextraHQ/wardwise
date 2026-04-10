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
  IconCopy,
  IconExternalLink,
  IconMail,
  IconShieldLock,
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

  function copyCredentials() {
    const text = `WardWise Account Setup\n\nCandidate: ${candidateName}\nEmail: ${email}\nSecure setup link: ${setupUrl}\n\nThis link expires on ${new Date(expiresAt).toLocaleString("en-NG")}.`;
    navigator.clipboard.writeText(text);
    toast.success("Setup link copied to clipboard");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Setup Link</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs">
                    {showFullLink
                      ? setupUrl
                      : `${setupUrl.slice(0, 34)}...${setupUrl.slice(-12)}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFullLink((current) => !current)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <IconShieldLock className="h-3.5 w-3.5" />
                  </button>
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
            onClick={() => onOpenChange(false)}
          >
            <IconExternalLink className="mr-2 h-4 w-4" />
            Go to Candidate
          </Button>
          <Button
            className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
            onClick={copyCredentials}
          >
            {deliveryMethod === "email" ? (
              <IconMail className="mr-2 h-4 w-4" />
            ) : (
              <IconCopy className="mr-2 h-4 w-4" />
            )}
            {deliveryMethod === "email"
              ? "Copy Backup Link"
              : "Copy Setup Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
