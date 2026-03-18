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
  "President",
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
    state?: string;
    lga?: string;
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
      state: "",
      lga: "",
      description: "",
    },
    mode: "onChange", // Validate on change for better UX
  });

  // Watch position to make form dynamic
  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedPosition = form.watch("position");

  const handleSubmit = (data: CreateCandidateFormValues) => {
    onSubmit({
      name: data.name,
      email: data.email,
      party: data.party,
      position: data.position as Candidate["position"],
      constituency: data.constituency,
      state: data.state || undefined,
      lga: data.lga || undefined,
      description: data.description || "",
    });
    // Reset form on successful submission
    form.reset();
  };

  // Get placeholder and help text based on position
  const getConstituencyPlaceholder = () => {
    if (selectedPosition === "President") return "Federal Republic of Nigeria";
    if (selectedPosition === "Governor") return "e.g., Adamawa State";
    if (selectedPosition === "Senator") return "e.g., Adamawa Central";
    if (selectedPosition === "House of Representatives")
      return "e.g., Fufore/Song Federal Constituency";
    if (selectedPosition === "State Assembly")
      return "e.g., Song State Constituency";
    return "Enter constituency";
  };

  const showStateField = selectedPosition && selectedPosition !== "President";
  const showLgaField = selectedPosition && selectedPosition !== "President";

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      // Reset form when dialog closes
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-sm">
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
                        className="border-border/60 rounded-sm"
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
                        className="border-border/60 rounded-sm"
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
                        className="border-border/60 rounded-sm"
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
                        <SelectTrigger className="border-border/60 rounded-sm">
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
                          className="border-border/60 rounded-sm"
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
                            className="border-border/60 rounded-sm"
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
                      className="border-border/60 rounded-sm"
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
                      className="border-border/60 rounded-sm"
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
                className="border-border/60 rounded-sm"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="rounded-sm font-mono text-[11px] tracking-widest uppercase">
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-sm border-2 border-current border-t-transparent" />
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
