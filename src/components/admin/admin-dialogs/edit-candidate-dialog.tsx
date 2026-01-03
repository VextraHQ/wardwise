"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { HiOutlineCheckCircle } from "react-icons/hi";
import type { Candidate } from "@/types/candidate";
import type { CandidateWithUser } from "@/lib/api/admin";
import {
  updateCandidateSchema,
  type UpdateCandidateFormValues,
} from "@/lib/schemas/admin-schemas";

const POSITIONS: Candidate["position"][] = [
  "President",
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
    state?: string;
    lga?: string;
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
  const form = useForm<UpdateCandidateFormValues>({
    resolver: zodResolver(updateCandidateSchema),
    defaultValues: {
      id: candidate.id,
      name: candidate.name,
      email: candidate.user.email,
      party: candidate.party,
      position: POSITIONS.includes(candidate.position)
        ? candidate.position
        : "",
      constituency: candidate.constituency ?? "",
      state: candidate.state || "",
      lga: candidate.lga || "",
      description: candidate.description || "",
    },
  });

  // Watch position to make form dynamic
  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedPosition = form.watch("position");

  // Update form when candidate changes
  useEffect(() => {
    form.reset({
      id: candidate.id,
      name: candidate.name,
      email: candidate.user.email,
      party: candidate.party,
      position: POSITIONS.includes(candidate.position)
        ? candidate.position
        : "",
      constituency: candidate.constituency ?? "",
      state: candidate.state || "",
      lga: candidate.lga || "",
      description: candidate.description || "",
    });
  }, [candidate, form]);

  // Get placeholder and help text based on position
  const getConstituencyPlaceholder = () => {
    if (selectedPosition === "President") return "Federal Republic of Nigeria";
    if (selectedPosition === "Governor") return "e.g., Adamawa State";
    if (selectedPosition === "Senator") return "e.g., Adamawa Central";
    if (selectedPosition === "House of Representatives") return "e.g., Fufore/Song Federal Constituency";
    if (selectedPosition === "State Assembly") return "e.g., Song State Constituency";
    return "Enter constituency";
  };

  const showStateField = selectedPosition && selectedPosition !== "President";
  const showLgaField = selectedPosition && selectedPosition !== "President";

  const handleSubmit = (data: UpdateCandidateFormValues) => {
    // Ensure all required fields are provided
    if (
      !data.name ||
      !data.email ||
      !data.party ||
      !data.position ||
      !data.constituency
    ) {
      return;
    }

    onSubmit({
      id: data.id,
      name: data.name,
      email: data.email,
      party: data.party,
      position: data.position as Candidate["position"],
      constituency: data.constituency,
      state: data.state || undefined,
      lga: data.lga || undefined,
      description: data.description || "",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Candidate Name *
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    className="border-border/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Email Address *
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    disabled={isLoading}
                    className="border-border/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="party"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Political Party *
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    className="border-border/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Position *
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="border-border/50">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {POSITIONS.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {showStateField && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    State *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Adamawa State"
                      disabled={isLoading}
                      className="border-border/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showLgaField && (
              <FormField
                control={form.control}
                name="lga"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      LGA *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Song"
                        disabled={isLoading}
                        className="border-border/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="constituency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Constituency *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={getConstituencyPlaceholder()}
                  disabled={isLoading}
                  className="border-border/50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Description</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  disabled={isLoading}
                  className="border-border/50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
    </Form>
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
