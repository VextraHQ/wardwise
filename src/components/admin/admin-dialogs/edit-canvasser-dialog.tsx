"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { CanvasserWithCandidate } from "@/lib/api/admin";
import type { CandidateWithUser } from "@/lib/api/admin";
import {
  updateCanvasserSchema,
  type UpdateCanvasserFormValues,
} from "@/lib/schemas/admin-schemas";

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
  const form = useForm<UpdateCanvasserFormValues>({
    resolver: zodResolver(updateCanvasserSchema),
    defaultValues: canvasser
      ? {
          id: canvasser.id,
          code: canvasser.code,
          name: canvasser.name,
          phone: canvasser.phone,
          candidateId: canvasser.candidateId,
          ward: canvasser.ward || "",
          lga: canvasser.lga || "",
          state: canvasser.state || "",
        }
      : {
          id: "",
          code: "",
          name: "",
          phone: "",
          candidateId: "",
          ward: "",
          lga: "",
          state: "",
        },
  });

  // Update form when canvasser changes
  useEffect(() => {
    if (canvasser) {
      form.reset({
        id: canvasser.id,
        code: canvasser.code,
        name: canvasser.name,
        phone: canvasser.phone,
        candidateId: canvasser.candidateId,
        ward: canvasser.ward || "",
        lga: canvasser.lga || "",
        state: canvasser.state || "",
      });
    }
  }, [canvasser, form]);

  const handleSubmit = (data: UpdateCanvasserFormValues) => {
    if (!canvasser) return;
    onSubmit({
      id: data.id,
      code: data.code,
      name: data.name,
      phone: data.phone,
      candidateId: data.candidateId,
      ward: data.ward || undefined,
      lga: data.lga || undefined,
      state: data.state || undefined,
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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Canvasser Code <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="FINT-A001"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone Number <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="08012345678"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="candidateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Candidate <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select candidate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        className="max-h-[300px] w-(--radix-select-trigger-width) max-w-[calc(100vw-2rem)]"
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Adamawa"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lga"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LGA</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Yola North"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Karewa Ward"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
