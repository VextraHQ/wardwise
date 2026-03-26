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
  IconEye,
  IconEyeOff,
  IconExternalLink,
} from "@tabler/icons-react";

interface CredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  email: string;
  password: string;
}

export function CredentialsDialog({
  open,
  onOpenChange,
  candidateName,
  email,
  password,
}: CredentialsDialogProps) {
  const [showPassword, setShowPassword] = useState(false);

  function copyCredentials() {
    const text = `WardWise Account Credentials\n\nCandidate: ${candidateName}\nEmail: ${email}\nPassword: ${password}\n\nLogin at: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    toast.success("Credentials copied to clipboard");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-sm">
        <DialogHeader>
          <DialogTitle>Account Created</DialogTitle>
          <DialogDescription>
            Save these credentials now — the password will not be shown again.
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
                <span className="text-muted-foreground">Password</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs">
                    {showPassword ? password : "••••••••••••"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <IconEyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <IconEye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-sm border p-2.5 text-xs">
            This password will not be shown again. Copy it now or use Reset
            Password later.
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
            <IconCopy className="mr-2 h-4 w-4" />
            Copy Credentials
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
