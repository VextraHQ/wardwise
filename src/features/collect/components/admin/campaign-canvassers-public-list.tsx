"use client";

import { useMemo, useState } from "react";
import type {
  useAddCanvasser,
  useRemoveCanvasser,
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { addCampaignCanvasserSchema } from "@/features/collect/schemas/collect-schemas";
import type { CampaignCanvasserRecord } from "@/features/collect/types/collect.types";
import { formatPersonName } from "@/lib/utils";
import {
  IconPlus,
  IconSearch,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";

export function CampaignCanvassersPublicList({
  preloaded,
  addMutation,
  removeMutation,
  onRemoveClick,
}: {
  preloaded: CampaignCanvasserRecord[];
  addMutation: ReturnType<typeof useAddCanvasser>;
  removeMutation: ReturnType<typeof useRemoveCanvasser>;
  onRemoveClick: (id: string, name: string) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState("");
  const [search, setSearch] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    zone?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const filteredPreloaded = useMemo(() => {
    if (!search.trim()) return preloaded;
    const q = search.toLowerCase();
    return preloaded.filter(
      (entry) =>
        entry.name.toLowerCase().includes(q) ||
        entry.phone.toLowerCase().includes(q) ||
        (entry.zone ?? "").toLowerCase().includes(q),
    );
  }, [preloaded, search]);

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    const result = addCampaignCanvasserSchema.safeParse({ name, phone, zone });
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        phone: errors.phone?.[0],
        zone: errors.zone?.[0],
      });
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);

    addMutation.mutate(
      {
        name: result.data.name,
        phone: result.data.phone,
        zone: result.data.zone || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Canvasser added to the public form list");
          setName("");
          setPhone("");
          setZone("");
          setFieldErrors({});
          setFormError(null);
        },
        onError: (error) => {
          const isPhoneConflict =
            error.message.toLowerCase().includes("phone") ||
            error.message.toLowerCase().includes("exists");
          if (isPhoneConflict) {
            setFieldErrors((current) => ({ ...current, phone: error.message }));
          } else {
            setFormError(error.message);
          }
        },
      },
    );
  };

  return (
    <div className="space-y-5">
      <div className="border-border/60 bg-card rounded-sm border p-4 shadow-none">
        <p className="mb-4 font-mono text-[10px] font-bold tracking-widest uppercase">
          Add to Dropdown
        </p>
        <p className="text-muted-foreground mb-4 text-xs leading-relaxed">
          Names added here appear in the public form dropdown. Supporters can
          still type a canvasser name manually if it is not in this list.
        </p>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="canvasser-name">Name</Label>
            <Input
              id="canvasser-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((current) => ({ ...current, name: undefined }));
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
            <Label htmlFor="canvasser-phone">Phone</Label>
            <Input
              id="canvasser-phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setFieldErrors((current) => ({ ...current, phone: undefined }));
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

          <div className="space-y-1.5">
            <Label htmlFor="canvasser-zone">
              Zone{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="canvasser-zone"
              value={zone}
              onChange={(e) => {
                setZone(e.target.value);
                setFieldErrors((current) => ({ ...current, zone: undefined }));
                setFormError(null);
              }}
              placeholder="e.g. Ward 3"
              className="h-9 rounded-sm"
            />
            {fieldErrors.zone ? (
              <p className="text-destructive text-[11px] font-medium">
                {fieldErrors.zone}
              </p>
            ) : null}
          </div>

          {formError ? (
            <p className="text-destructive text-[11px] font-medium">
              {formError}
            </p>
          ) : null}

          <Button
            type="submit"
            size="sm"
            className="h-9 w-full rounded-sm"
            disabled={addMutation.isPending}
          >
            <IconPlus className="mr-1.5 h-3.5 w-3.5" />
            {addMutation.isPending ? "Adding..." : "Add to Canvasser List"}
          </Button>
        </form>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                  <TableHead className="text-muted-foreground hidden h-9 font-mono text-[10px] font-bold tracking-widest uppercase sm:table-cell">
                    Zone
                  </TableHead>
                  <TableHead className="h-9 w-10" />
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
                    <TableCell className="text-muted-foreground hidden text-xs sm:table-cell">
                      {entry.zone ?? "—"}
                    </TableCell>
                    <TableCell className="p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onRemoveClick(entry.id, entry.name)}
                        disabled={removeMutation.isPending}
                      >
                        <IconTrash className="text-destructive h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPreloaded.length === 0 && search.trim() ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
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
          <div className="border-border flex flex-col items-center gap-2 rounded-sm border border-dashed py-6 text-center">
            <IconUsers className="text-muted-foreground h-6 w-6" />
            <p className="text-muted-foreground text-xs">
              No dropdown names yet. Add one above to make the public form
              easier for supporters to use when choosing a canvasser.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
