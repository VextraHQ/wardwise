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
  useGeoPollingUnits,
  useCreatePollingUnit,
  useUpdatePollingUnit,
  useDeletePollingUnit,
} from "@/hooks/use-geo";
import type { GeoPollingUnit } from "@/types/geo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface GeoLevelPollingUnitsProps {
  wardId: number;
  wardName: string | null;
}

type SortOption = "code-asc" | "code-desc" | "name-asc" | "name-desc";

function sortPUs(pus: GeoPollingUnit[], sort: SortOption): GeoPollingUnit[] {
  const sorted = [...pus];
  switch (sort) {
    case "code-asc":
      return sorted.sort((a, b) => a.code.localeCompare(b.code));
    case "code-desc":
      return sorted.sort((a, b) => b.code.localeCompare(a.code));
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return sorted;
  }
}

export function GeoLevelPollingUnits({
  wardId,
  wardName,
}: GeoLevelPollingUnitsProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("code-asc");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingPu, setEditingPu] = useState<GeoPollingUnit | null>(null);
  const [deletingPu, setDeletingPu] = useState<{
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

  const { data, isLoading } = useGeoPollingUnits(wardId, {
    page,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const puData = data?.data;
  const sortedPUs = useMemo(() => {
    if (!puData) return [];
    return sortPUs(puData, sort);
  }, [puData, sort]);

  const createMutation = useCreatePollingUnit();
  const updateMutation = useUpdatePollingUnit();
  const deleteMutation = useDeletePollingUnit();

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  const handleCreate = () => {
    if (!formCode.trim()) return;
    createMutation.mutate(
      {
        code: formCode.trim(),
        name: formName.trim() || formCode.trim(),
        wardId,
      },
      {
        onSuccess: () => {
          toast.success("Polling unit created");
          setCreateOpen(false);
          setFormCode("");
          setFormName("");
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to create polling unit",
          );
        },
      },
    );
  };

  const handleUpdate = () => {
    if (!editingPu || !formCode.trim()) return;
    updateMutation.mutate(
      {
        id: editingPu.id,
        data: {
          code: formCode.trim(),
          name: formName.trim() || formCode.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Polling unit updated");
          setEditingPu(null);
          setFormCode("");
          setFormName("");
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to update polling unit",
          );
        },
      },
    );
  };

  const handleDelete = () => {
    if (!deletingPu) return;
    deleteMutation.mutate(deletingPu.id, {
      onSuccess: () => {
        toast.success("Polling unit deleted");
        setDeletingPu(null);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete polling unit",
        );
      },
    });
  };

  const openEdit = (pu: GeoPollingUnit) => {
    setFormCode(pu.code);
    setFormName(pu.name);
    setEditingPu(pu);
  };

  return (
    <>
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Polling Units
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setImportOpen(true)}
                className="h-9 w-full gap-1.5 rounded-sm font-mono text-[10px] tracking-widest uppercase sm:w-auto sm:text-[11px]"
              >
                <HiOutlineUpload className="h-4 w-4" />
                Import CSV / Excel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setFormCode("");
                  setFormName("");
                  setCreateOpen(true);
                }}
                className="h-9 w-full gap-1.5 rounded-sm font-mono text-[10px] tracking-widest uppercase sm:w-auto sm:text-[11px]"
              >
                <HiOutlinePlus className="h-4 w-4" />
                Add Polling Unit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <AdminSearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by code or name..."
              />
            </div>
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as SortOption)}
            >
              <SelectTrigger className="w-full rounded-sm sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="code-asc">Code A-Z</SelectItem>
                <SelectItem value="code-desc">Code Z-A</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
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
                    ? "No polling units match your search"
                    : "No polling units found for this ward"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {debouncedSearch
                    ? "Try adjusting your search terms"
                    : "Add a polling unit using the button above"}
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
                      INEC Code
                    </TableHead>
                    <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                      Name
                    </TableHead>
                    <TableHead className="text-muted-foreground h-10 w-12 font-mono text-[10px] font-bold tracking-widest uppercase">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPUs.map((pu, idx) => (
                    <TableRow key={pu.id}>
                      <TableCell className="text-muted-foreground text-center font-mono text-xs tabular-nums">
                        {(page - 1) * pageSize + idx + 1}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-medium">
                        {pu.code}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatGeoDisplayName(pu.name)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <HiDotsVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(pu)}>
                              <HiOutlinePencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                setDeletingPu({
                                  id: pu.id,
                                  name: pu.code || pu.name,
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
              itemLabel="polling units"
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
            <DialogTitle>Add Polling Unit</DialogTitle>
            <DialogDescription>
              Create a new polling unit
              {wardName ? ` in ${formatGeoDisplayName(wardName)}` : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="pu-code">
                INEC Code
              </label>
              <Input
                id="pu-code"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g. 01-02-03-004"
                className="rounded-sm font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="pu-name">
                Name
                <span className="text-muted-foreground ml-1 text-xs font-normal">
                  (defaults to code if empty)
                </span>
              </label>
              <Input
                id="pu-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter polling unit name"
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
              disabled={!formCode.trim() || createMutation.isPending}
              className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editingPu !== null}
        onOpenChange={(open) => {
          if (!open) setEditingPu(null);
        }}
      >
        <DialogContent className="rounded-sm">
          <DialogHeader>
            <DialogTitle>Edit Polling Unit</DialogTitle>
            <DialogDescription>
              Update
              {editingPu ? ` ${formatGeoDisplayName(editingPu.name)}` : ""}{" "}
              details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="edit-pu-code">
                INEC Code
              </label>
              <Input
                id="edit-pu-code"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g. 01-02-03-004"
                className="rounded-sm font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="edit-pu-name">
                Name
                <span className="text-muted-foreground ml-1 text-xs font-normal">
                  (defaults to code if empty)
                </span>
              </label>
              <Input
                id="edit-pu-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter polling unit name"
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
              onClick={() => setEditingPu(null)}
              disabled={updateMutation.isPending}
              className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formCode.trim() || updateMutation.isPending}
              className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={deletingPu !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingPu(null);
        }}
      >
        <AlertDialogContent className="rounded-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              polling unit
              {deletingPu && ` "${formatGeoDisplayName(deletingPu.name)}"`}.
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
        level="polling-unit"
      />
    </>
  );
}
