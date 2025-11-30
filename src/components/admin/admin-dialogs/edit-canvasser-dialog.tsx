"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HiOutlineCheckCircle } from "react-icons/hi";
import type { CanvasserWithCandidate } from "@/lib/api/admin";
import type { CandidateWithUser } from "@/lib/api/admin";

interface EditCanvasserDialogProps {
  canvasser: CanvasserWithCandidate | null;
  candidates: CandidateWithUser[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    id: string;
    code?: string;
    name?: string;
    phone?: string;
    candidateId?: string;
    ward?: string;
    lga?: string;
    state?: string;
  }) => void;
  isLoading?: boolean;
}

export function EditCanvasserDialog({
  canvasser,
  candidates,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: EditCanvasserDialogProps) {
  const [formData, setFormData] = useState(() =>
    canvasser
      ? {
          code: canvasser.code,
          name: canvasser.name,
          phone: canvasser.phone,
          candidateId: canvasser.candidateId,
          ward: canvasser.ward || "",
          lga: canvasser.lga || "",
          state: canvasser.state || "",
        }
      : {
          code: "",
          name: "",
          phone: "",
          candidateId: "",
          ward: "",
          lga: "",
          state: "",
        },
  );

  // Update form when canvasser changes
  useEffect(() => {
    if (canvasser) {
      setFormData({
        code: canvasser.code,
        name: canvasser.name,
        phone: canvasser.phone,
        candidateId: canvasser.candidateId,
        ward: canvasser.ward || "",
        lga: canvasser.lga || "",
        state: canvasser.state || "",
      });
    }
  }, [canvasser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canvasser) return;
    onSubmit({
      id: canvasser.id,
      code: formData.code,
      name: formData.name,
      phone: formData.phone,
      candidateId: formData.candidateId,
      ward: formData.ward || undefined,
      lga: formData.lga || undefined,
      state: formData.state || undefined,
    });
  };

  if (!canvasser) return null;

  return (
    <Dialog key={canvasser.id} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Canvasser</DialogTitle>
          <DialogDescription>Update canvasser information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">
                Canvasser Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="FINT-A001"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="08012345678"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="candidateId">
                Candidate <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.candidateId}
                onValueChange={(value) =>
                  setFormData({ ...formData, candidateId: value })
                }
                disabled={isLoading}
                required
              >
                <SelectTrigger id="candidateId" className="w-full">
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>
                <SelectContent
                  className="max-h-[300px] w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)]"
                  position="popper"
                >
                  {candidates.map((candidate) => (
                    <SelectItem
                      key={candidate.id}
                      value={candidate.id}
                      className="truncate"
                    >
                      <span
                        className="block truncate"
                        title={`${candidate.name} (${candidate.party}) - ${candidate.position}`}
                      >
                        {candidate.name} ({candidate.party}) -{" "}
                        {candidate.position}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                placeholder="Adamawa"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lga">LGA</Label>
              <Input
                id="lga"
                value={formData.lga}
                onChange={(e) =>
                  setFormData({ ...formData, lga: e.target.value })
                }
                placeholder="Yola North"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ward">Ward</Label>
              <Input
                id="ward"
                value={formData.ward}
                onChange={(e) =>
                  setFormData({ ...formData, ward: e.target.value })
                }
                placeholder="Karewa Ward"
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Updating...
                </>
              ) : (
                <>
                  <HiOutlineCheckCircle className="mr-2 h-4 w-4" />
                  Update Canvasser
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
