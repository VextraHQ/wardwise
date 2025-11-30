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

const POSITIONS: Candidate["position"][] = [
  "Governor",
  "Senator",
  "House of Representatives",
  "State Assembly",
];

interface CreateCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    email: string;
    party: string;
    position: Candidate["position"];
    constituency: string;
    description: string;
  }) => void;
  isLoading?: boolean;
}

export function CreateCandidateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateCandidateDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    party: "",
    position: "" as Candidate["position"] | "",
    constituency: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.position) {
      return;
    }
    onSubmit({
      name: formData.name,
      email: formData.email,
      party: formData.party,
      position: formData.position,
      constituency: formData.constituency,
      description: formData.description,
    });
    // Reset form on successful submission
    setFormData({
      name: "",
      email: "",
      party: "",
      position: "",
      constituency: "",
      description: "",
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      // Reset form when dialog closes
      setFormData({
        name: "",
        email: "",
        party: "",
        position: "",
        constituency: "",
        description: "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Candidate</DialogTitle>
          <DialogDescription>
            Add a new candidate to the WardWise platform
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Candidate Name *
              </Label>
              <Input
                id="name"
                placeholder="Hon. John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={isLoading}
                className="border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@wardwise.ng"
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
              <Label htmlFor="party" className="text-sm font-medium">
                Political Party *
              </Label>
              <Input
                id="party"
                placeholder="APC, PDP, LP..."
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
              <Label htmlFor="position" className="text-sm font-medium">
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
                <SelectTrigger id="position" className="border-border/50">
                  <SelectValue placeholder="Select position" />
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
            <Label htmlFor="constituency" className="text-sm font-medium">
              Constituency *
            </Label>
            <Input
              id="constituency"
              placeholder="Song & Fufore Federal Constituency"
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
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of the candidate"
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
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <HiOutlineCheckCircle className="mr-2 h-4 w-4" />
                  Create Candidate
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
