"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiDotsVertical,
  HiOutlineUpload,
  HiOutlineMap,
} from "react-icons/hi";
import {
  useGeoWards,
  useCreateWard,
  useUpdateWard,
  useDeleteWard,
} from "@/hooks/use-geo";
import type { GeoWard } from "@/types/geo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { BulkImportDialog } from "@/components/admin/geo/geo-dialogs/bulk-import-dialog";
import { formatGeoDisplayName } from "@/lib/utils/geo-display";

interface GeoLevelWardsProps {
  lgaId: number;
  lgaName: string | null;
  onDrillDown: (wardId: number, wardName: string) => void;
}

type SortOption = "name-asc" | "name-desc" | "pus-desc";

function sortWards(wards: GeoWard[], sort: SortOption): GeoWard[] {
  const sorted = [...wards];
  switch (sort) {
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "pus-desc":
      return sorted.sort(
        (a, b) => b._count.pollingUnits - a._count.pollingUnits,
      );
    default:
      return sorted;
  }
}

export function GeoLevelWards({
  lgaId,
  lgaName,
  onDrillDown,
}: GeoLevelWardsProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<GeoWard | null>(null);
  const [deletingWard, setDeletingWard] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading } = useGeoWards(lgaId, {
    page,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const wardData = data?.data;
  const sortedWards = useMemo(() => {
    if (!wardData) return [];
    return sortWards(wardData, sort);
  }, [wardData, sort]);

  const createMutation = useCreateWard();
  const updateMutation = useUpdateWard();
  const deleteMutation = useDeleteWard();

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  const handleCreate = () => {
    if (!formName.trim()) return;
    createMutation.mutate(
      { code: formCode.trim() || undefined, name: formName.trim(), lgaId },
      {
        onSuccess: () => {
          toast.success("Ward created successfully");
          setCreateOpen(false);
          setFormCode("");
          setFormName("");
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to create ward",
          );
        },
      },
    );
  };

  const handleUpdate = () => {
    if (!editingWard || !formName.trim()) return;
    updateMutation.mutate(
      {
        id: editingWard.id,
        data: { code: formCode.trim() || null, name: formName.trim() },
      },
      {
        onSuccess: () => {
          toast.success("Ward updated successfully");
          setEditingWard(null);
          setFormCode("");
          setFormName("");
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to update ward",
          );
        },
      },
    );
  };

  const handleDelete = () => {
    if (!deletingWard) return;
    deleteMutation.mutate(deletingWard.id, {
      onSuccess: () => {
        toast.success("Ward deleted successfully");
        setDeletingWard(null);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete ward",
        );
      },
    });
  };

  const openEdit = (ward: GeoWard) => {
    setFormCode(ward.code ?? "");
    setFormName(ward.name);
    setEditingWard(ward);
  };

  return (
    <>
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-tight">
            Wards
          </CardTitle>
          <CardAction>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setImportOpen(true)}
                className="gap-1.5 rounded-sm font-mono text-[11px] tracking-widest uppercase"
              >
                <HiOutlineUpload className="h-4 w-4" />
                Import CSV
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setFormCode("");
                  setFormName("");
                  setCreateOpen(true);
                }}
                className="gap-1.5 rounded-sm font-mono text-[11px] tracking-widest uppercase"
              >
                <HiOutlinePlus className="h-4 w-4" />
                Add Ward
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <AdminSearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search wards..."
              />
            </div>
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as SortOption)}
            >
              <SelectTrigger className="w-[160px] rounded-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="pus-desc">Most PUs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="border-border flex flex-col items-center gap-3 rounded-sm border border-dashed py-12 text-center">
              <HiOutlineMap className="text-muted-foreground h-10 w-10" />
              <div>
                <p className="text-foreground mb-1 font-medium">
                  {debouncedSearch
                    ? "No wards match your search"
                    : "No wards found for this LGA"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {debouncedSearch
                    ? "Try adjusting your search terms"
                    : "Add a ward using the button above"}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-sm border">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-muted-foreground h-10 w-14 text-center font-mono text-[10px] font-bold tracking-widest uppercase">
                      S/N
                    </TableHead>
                    <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                      Code
                    </TableHead>
                    <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                      Name
                    </TableHead>
                    <TableHead className="text-muted-foreground h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
                      Polling Units
                    </TableHead>
                    <TableHead className="text-muted-foreground h-10 w-12 font-mono text-[10px] font-bold tracking-widest uppercase">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedWards.map((ward, idx) => (
                    <TableRow
                      key={ward.id}
                      className={`cursor-pointer transition-colors ${
                        ward._count.pollingUnits === 0
                          ? "bg-orange-500/5 hover:bg-orange-500/10"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() =>
                        onDrillDown(ward.id, formatGeoDisplayName(ward.name))
                      }
                    >
                      <TableCell className="text-muted-foreground text-center font-mono text-xs tabular-nums">
                        {(page - 1) * pageSize + idx + 1}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs tabular-nums">
                        {ward.code || "—"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatGeoDisplayName(ward.name)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {ward._count.pollingUnits === 0 ? (
                          <Badge
                            variant="outline"
                            className="rounded-sm border-orange-500/20 bg-orange-500/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-orange-600 uppercase"
                          >
                            No PUs
                          </Badge>
                        ) : (
                          ward._count.pollingUnits
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <HiDotsVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem onClick={() => openEdit(ward)}>
                              <HiOutlinePencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                setDeletingWard({
                                  id: ward.id,
                                  name: ward.name,
                                })
                              }
                            >
                              <HiOutlineTrash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="pt-4">
            <AdminPagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={data?.total ?? 0}
              itemLabel="wards"
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-sm">
          <DialogHeader>
            <DialogTitle>Add Ward</DialogTitle>
            <DialogDescription>
              Create a new ward
              {lgaName ? ` in ${formatGeoDisplayName(lgaName)}` : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="ward-code">
                Official Code (Optional)
              </label>
              <Input
                id="ward-code"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="Optional official ward code"
                className="rounded-sm font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="ward-name">
                Name
              </label>
              <Input
                id="ward-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter ward name"
                className="rounded-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={createMutation.isPending}
              className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formName.trim() || createMutation.isPending}
              className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editingWard !== null}
        onOpenChange={(open) => {
          if (!open) setEditingWard(null);
        }}
      >
        <DialogContent className="rounded-sm">
          <DialogHeader>
            <DialogTitle>Edit Ward</DialogTitle>
            <DialogDescription>
              Update
              {editingWard
                ? ` ${formatGeoDisplayName(editingWard.name)}`
                : ""}{" "}
              details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="edit-ward-code">
                Official Code (Optional)
              </label>
              <Input
                id="edit-ward-code"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="Optional official ward code"
                className="rounded-sm font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="edit-ward-name">
                Name
              </label>
              <Input
                id="edit-ward-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter ward name"
                className="rounded-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdate();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingWard(null)}
              disabled={updateMutation.isPending}
              className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formName.trim() || updateMutation.isPending}
              className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={deletingWard !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingWard(null);
        }}
      >
        <AlertDialogContent className="rounded-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              ward
              {deletingWard &&
                ` "${formatGeoDisplayName(deletingWard.name)}"`}{" "}
              and all its polling units.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BulkImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        level="ward"
      />
    </>
  );
}
