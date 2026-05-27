"use client";

import { useMemo, useState } from "react";
import type {
  useAddCanvasser,
  useRemoveCanvasser,
  useUpdateCanvasser,
} from "@/features/collect/hooks/use-collect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { addCampaignCanvasserSchema } from "@/features/collect/schemas/collect-schemas";
import type { CampaignCanvasserRecord } from "@/features/collect/types/collect.types";
import { formatPersonName } from "@/lib/utils";
import {
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUsers,
  IconX,
} from "@tabler/icons-react";

export function CampaignCanvassersPublicList({
  preloaded,
  addMutation,
  updateMutation,
  removeMutation,
  onRemoveClick,
}: {
  preloaded: CampaignCanvasserRecord[];
  addMutation: ReturnType<typeof useAddCanvasser>;
  updateMutation: ReturnType<typeof useUpdateCanvasser>;
  removeMutation: ReturnType<typeof useRemoveCanvasser>;
  onRemoveClick: (id: string, name: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"add" | "edit">("add");
  const [editingEntry, setEditingEntry] =
    useState<CampaignCanvasserRecord | null>(null);
  const [editorName, setEditorName] = useState("");
  const [editorPhone, setEditorPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const filteredPreloaded = useMemo(() => {
    if (!search.trim()) return preloaded;
    const q = search.toLowerCase();
    return preloaded.filter(
      (entry) =>
        entry.name.toLowerCase().includes(q) ||
        entry.phone.toLowerCase().includes(q),
    );
  }, [preloaded, search]);

  const isEditing = editorMode === "edit";
  const isAddSubmitting = addMutation.isPending;
  const isEditSubmitting = updateMutation.isPending;
  const isSubmitting = isAddSubmitting || isEditSubmitting;
  const areRowActionsDisabled = isEditSubmitting;
  const editingEntryMissing = editingEntry
    ? !preloaded.some((entry) => entry.id === editingEntry.id)
    : false;

  const resetEditorState = () => {
    setEditorMode("add");
    setEditingEntry(null);
    setEditorName("");
    setEditorPhone("");
    setFieldErrors({});
    setFormError(null);
  };

  const closeEditor = () => {
    setEditorOpen(false);
  };

  const openAddEditor = () => {
    setEditorMode("add");
    setEditingEntry(null);
    setEditorName("");
    setEditorPhone("");
    setFieldErrors({});
    setFormError(null);
    setEditorOpen(true);
  };

  const openEditEditor = (entry: CampaignCanvasserRecord) => {
    setEditorMode("edit");
    setEditingEntry(entry);
    setEditorName(entry.name);
    setEditorPhone(entry.phone);
    setFieldErrors({});
    setFormError(null);
    setEditorOpen(true);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isEditing && (!editingEntry || editingEntryMissing)) {
      toast.error(
        "This canvasser is no longer on the saved list. Choose another entry to edit.",
      );
      closeEditor();
      return;
    }

    const result = addCampaignCanvasserSchema.safeParse({
      name: editorName,
      phone: editorPhone,
      zone: editingEntry?.zone ?? undefined,
    });
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        phone: errors.phone?.[0],
      });
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);

    const onError = (error: Error) => {
      const isPhoneConflict =
        error.message.toLowerCase().includes("phone") ||
        error.message.toLowerCase().includes("exists");
      if (isPhoneConflict) {
        setFieldErrors((current) => ({ ...current, phone: error.message }));
      } else {
        setFormError(error.message);
      }
    };

    if (isEditing && editingEntry) {
      updateMutation.mutate(
        {
          canvasserId: editingEntry.id,
          data: {
            name: result.data.name,
            phone: result.data.phone,
            zone: result.data.zone || undefined,
          },
        },
        {
          onSuccess: () => {
            toast.success("Canvasser updated");
            closeEditor();
          },
          onError,
        },
      );
      return;
    }

    addMutation.mutate(
      {
        name: result.data.name,
        phone: result.data.phone,
      },
      {
        onSuccess: () => {
          toast.success("Canvasser added to the public form list");
          closeEditor();
        },
        onError,
      },
    );
  };

  return (
    <>
      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <p className="font-mono text-[10px] font-bold tracking-widest uppercase">
                Current Canvasser List
              </p>
              <Badge
                variant="secondary"
                className="rounded-sm px-1.5 py-0 font-mono text-[10px] tabular-nums"
              >
                {preloaded.length}
              </Badge>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {preloaded.length > 4 ? (
                <div className="relative min-w-0 sm:w-64">
                  <IconSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search names or phone..."
                    className="h-8 rounded-sm pl-8 text-sm"
                  />
                </div>
              ) : null}
              <Button
                type="button"
                size="sm"
                className="h-8 rounded-sm font-mono text-[10px] tracking-widest uppercase"
                onClick={openAddEditor}
              >
                <IconPlus className="mr-1.5 h-3.5 w-3.5" />
                Add to Dropdown
              </Button>
            </div>
          </div>

          {preloaded.length > 0 ? (
            <div className="overflow-x-auto rounded-sm border">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-muted-foreground h-9 font-mono text-[10px] font-bold tracking-widest uppercase">
                      Name
                    </TableHead>
                    <TableHead className="text-muted-foreground h-9 font-mono text-[10px] font-bold tracking-widest uppercase">
                      Phone
                    </TableHead>
                    <TableHead className="text-muted-foreground h-9 w-[88px] text-right font-mono text-[10px] font-bold tracking-widest uppercase">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPreloaded.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-muted/30">
                      <TableCell className="text-sm font-medium">
                        {formatPersonName(entry.name)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {entry.phone}
                      </TableCell>
                      <TableCell className="p-1">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditEditor(entry)}
                            disabled={areRowActionsDisabled}
                            title={`Edit ${formatPersonName(entry.name)}`}
                          >
                            <IconPencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onRemoveClick(entry.id, entry.name)}
                            disabled={removeMutation.isPending}
                            title={`Remove ${formatPersonName(entry.name)}`}
                          >
                            <IconTrash className="text-destructive h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPreloaded.length === 0 && search.trim() ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-muted-foreground py-8 text-center text-sm"
                      >
                        No names match &quot;{search}&quot;
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border-border flex flex-col items-center gap-3 rounded-sm border border-dashed py-6 text-center">
              <IconUsers className="text-muted-foreground h-6 w-6" />
              <p className="text-muted-foreground text-xs">
                No dropdown names yet. Add one to make the public form easier
                for supporters to use when choosing a canvasser.
              </p>
              <Button
                type="button"
                size="sm"
                className="h-8 rounded-sm font-mono text-[10px] tracking-widest uppercase"
                onClick={openAddEditor}
              >
                <IconPlus className="mr-1.5 h-3.5 w-3.5" />
                Add to Dropdown
              </Button>
            </div>
          )}
        </div>
      </div>
      <Dialog
        open={editorOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeEditor();
          }
        }}
      >
        <DialogContent
          className="border-border/60 max-w-lg gap-0 rounded-sm p-0 shadow-none"
          onAnimationEnd={() => {
            if (!editorOpen) {
              resetEditorState();
            }
          }}
        >
          <DialogHeader className="border-border/60 space-y-2 border-b px-4 py-4 text-left sm:px-5">
            <DialogTitle className="text-foreground font-mono text-[11px] font-bold tracking-widest uppercase">
              {isEditing ? "Edit Saved Canvasser" : "Add to Dropdown"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              {isEditing
                ? "This updates the saved canvasser list and future dropdown display. Existing submission snapshots remain unchanged."
                : "Names added here appear in the public form dropdown. Supporters can still type a canvasser name manually if it is not in this list."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3 px-4 py-4 sm:px-5">
            <div className="space-y-1.5">
              <Label htmlFor="canvasser-editor-name">Name</Label>
              <Input
                id="canvasser-editor-name"
                value={editorName}
                onChange={(e) => {
                  setEditorName(e.target.value);
                  setFieldErrors((current) => ({
                    ...current,
                    name: undefined,
                  }));
                  setFormError(null);
                }}
                placeholder="e.g. Ali Musa"
                className="h-9 rounded-sm"
              />
              {fieldErrors.name ? (
                <p className="text-destructive text-[11px] font-medium">
                  {fieldErrors.name}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="canvasser-editor-phone">Phone</Label>
              <Input
                id="canvasser-editor-phone"
                value={editorPhone}
                onChange={(e) => {
                  setEditorPhone(e.target.value);
                  setFieldErrors((current) => ({
                    ...current,
                    phone: undefined,
                  }));
                  setFormError(null);
                }}
                placeholder="e.g. 08012345678"
                className="h-9 rounded-sm font-mono"
              />
              {fieldErrors.phone ? (
                <p className="text-destructive text-[11px] font-medium">
                  {fieldErrors.phone}
                </p>
              ) : null}
            </div>

            {formError ? (
              <p className="text-destructive text-[11px] font-medium">
                {formError}
              </p>
            ) : null}

            <DialogFooter className="border-border/60 bg-muted/10 border-t px-0 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-sm"
                onClick={closeEditor}
                disabled={isSubmitting}
              >
                <IconX className="mr-1.5 h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 rounded-sm"
                disabled={isSubmitting}
              >
                {isEditing ? (
                  <IconPencil className="mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <IconPlus className="mr-1.5 h-3.5 w-3.5" />
                )}
                {isEditing
                  ? isEditSubmitting
                    ? "Saving..."
                    : "Save Changes"
                  : isAddSubmitting
                    ? "Adding..."
                    : "Add to Canvasser List"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
