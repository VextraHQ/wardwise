"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { Candidate } from "@/types/candidate";
import type { CandidateWithUser } from "@/lib/api/admin";

const POSITIONS: Candidate["position"][] = [
  "Governor",
  "Senator",
  "House of Representatives",
  "State Assembly",
];

interface EditCandidateDialogProps {
  candidate: CandidateWithUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    id: string;
    name: string;
    email: string;
    party: string;
    position: Candidate["position"];
    constituency: string;
    description: string;
  }) => void;
  isLoading?: boolean;
}

function EditCandidateForm({
  candidate,
  onSubmit,
  isLoading,
  onCancel,
}: {
  candidate: CandidateWithUser;
  onSubmit: EditCandidateDialogProps["onSubmit"];
  isLoading: boolean;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: candidate.name,
    email: candidate.user.email,
    party: candidate.party,
    position: candidate.position,
    constituency: candidate.constituency ?? "",
    description: candidate.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.position) return;
    onSubmit({
      id: candidate.id,
      name: formData.name,
      email: formData.email,
      party: formData.party,
      position: formData.position,
      constituency: formData.constituency,
      description: formData.description,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-name" className="text-sm font-medium">
            Candidate Name *
          </Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isLoading}
            className="border-border/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-email" className="text-sm font-medium">
            Email Address *
          </Label>
          <Input
            id="edit-email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            disabled={isLoading}
            className="border-border/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-party" className="text-sm font-medium">
            Political Party *
          </Label>
          <Input
            id="edit-party"
            value={formData.party}
            onChange={(e) =>
              setFormData({ ...formData, party: e.target.value })
            }
            required
            disabled={isLoading}
            className="border-border/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-position" className="text-sm font-medium">
            Position *
          </Label>
          <Select
            value={formData.position}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                position: value as Candidate["position"],
              })
            }
            disabled={isLoading}
          >
            <SelectTrigger id="edit-position" className="border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POSITIONS.map((pos) => (
                <SelectItem key={pos} value={pos}>
                  {pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-constituency" className="text-sm font-medium">
          Constituency *
        </Label>
        <Input
          id="edit-constituency"
          value={formData.constituency}
          onChange={(e) =>
            setFormData({ ...formData, constituency: e.target.value })
          }
          required
          disabled={isLoading}
          className="border-border/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-description" className="text-sm font-medium">
          Description
        </Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          disabled={isLoading}
          className="border-border/50"
        />
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="border-border/50"
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
              Update Candidate
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditCandidateDialog({
  candidate,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: EditCandidateDialogProps) {
  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Candidate</DialogTitle>
          <DialogDescription>Update candidate information</DialogDescription>
        </DialogHeader>
        <EditCandidateForm
          key={candidate.id}
          candidate={candidate}
          onSubmit={onSubmit}
          isLoading={isLoading}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
