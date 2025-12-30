"use client";

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
import {
  createCandidateSchema,
  type CreateCandidateFormValues,
} from "@/lib/schemas/admin-schemas";

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
  const form = useForm<CreateCandidateFormValues>({
    resolver: zodResolver(createCandidateSchema),
    defaultValues: {
      name: "",
      email: "",
      party: "",
      position: "",
      constituency: "",
      description: "",
    },
    mode: "onChange", // Validate on change for better UX
  });

  const handleSubmit = (data: CreateCandidateFormValues) => {
    onSubmit({
      name: data.name,
      email: data.email,
      party: data.party,
      position: data.position as Candidate["position"],
      constituency: data.constituency,
      description: data.description || "",
    });
    // Reset form on successful submission
    form.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      // Reset form when dialog closes
      form.reset();
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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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
                        placeholder="Hon. John Doe"
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
                        placeholder="john.doe@wardwise.ng"
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
                        placeholder="APC, PDP, LP..."
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
                      value={field.value}
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
                      placeholder="Song & Fufore Federal Constituency"
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
                  <FormLabel className="text-sm font-medium">
                    Description (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the candidate"
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
