"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export const schema = z.object({
  id: z.number(),
  header: z.string(), // Ward name
  type: z.string(), // LGA
  status: z.string(), // Active or Planning
  target: z.string(), // Supporter count
  limit: z.string(), // Priority: High, Medium, Low
  reviewer: z.string(), // Coverage status
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "header",
    header: "Ward",
    cell: ({ row }) => {
      return <WardCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "LGA",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge
          variant="outline"
          className="text-muted-foreground rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
        >
          {row.original.type}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.status === "Active";
      return (
        <Badge
          variant={isActive ? "default" : "outline"}
          className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
        >
          {isActive ? (
            <IconCircleCheckFilled className="mr-1.5 size-3" />
          ) : (
            <IconLoader className="mr-1.5 size-3 animate-spin" />
          )}
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "target",
    header: () => <div className="w-full text-right">Supporters</div>,
    cell: ({ row }) => {
      const count = parseInt(row.original.target) || 0;
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
              loading: `Saving ${row.original.header} supporters`,
              success: "Saved",
              error: "Error",
            });
          }}
        >
          <Label htmlFor={`${row.original.id}-supporters`} className="sr-only">
            Supporters
          </Label>
          <div className="flex items-center justify-end gap-2">
            <IconUsers className="text-muted-foreground size-4" />
            <Input
              className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right font-mono text-sm shadow-none focus-visible:border dark:bg-transparent"
              defaultValue={count}
              id={`${row.original.id}-supporters`}
              type="number"
            />
          </div>
        </form>
      );
    },
  },
  {
    accessorKey: "limit",
    header: () => <div className="w-full text-right">Priority</div>,
    cell: ({ row }) => {
      const priority = row.original.limit;
      const variant =
        priority === "High"
          ? "default"
          : priority === "Medium"
            ? "secondary"
            : "outline";
      return (
        <div className="flex justify-end">
          <Badge
            variant={variant}
            className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
          >
            {priority}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Export Data</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Set Target</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data],
  );

  // Note: React Compiler warning about useReactTable is expected and harmless.
  // React Compiler automatically skips memoization for this hook to prevent stale UI.
  // This is a known incompatibility with TanStack Table's API design.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <Tabs
      defaultValue="coverage"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="coverage">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="coverage">Ward Coverage</SelectItem>
            <SelectItem value="analytics">Ward Analytics</SelectItem>
            <SelectItem value="targets">Target Wards</SelectItem>
            <SelectItem value="reports">Coverage Reports</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger
            className="font-mono text-[10px] font-bold tracking-widest uppercase"
            value="coverage"
          >
            Ward Coverage
          </TabsTrigger>
          <TabsTrigger
            className="font-mono text-[10px] font-bold tracking-widest uppercase"
            value="analytics"
          >
            Analytics <Badge variant="secondary">3</Badge>
          </TabsTrigger>
          <TabsTrigger
            className="font-mono text-[10px] font-bold tracking-widest uppercase"
            value="targets"
          >
            Targets <Badge variant="secondary">2</Badge>
          </TabsTrigger>
          <TabsTrigger
            className="font-mono text-[10px] font-bold tracking-widest uppercase"
            value="reports"
          >
            Reports
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden font-mono text-[10px] font-bold tracking-widest uppercase lg:inline">
                  Customize Columns
                </span>
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase lg:hidden">
                  Columns
                </span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide(),
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "type"
                        ? "LGA"
                        : column.id === "header"
                          ? "Ward"
                          : column.id === "target"
                            ? "Supporters"
                            : column.id === "limit"
                              ? "Priority"
                              : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden font-mono text-[10px] font-bold tracking-widest uppercase lg:inline">
              Add Ward
            </span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="coverage"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="border-border/60 overflow-hidden rounded-sm border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted/30 border-border/60 sticky top-0 z-10 border-b">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No wards found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 font-mono text-[11px] tracking-wider lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} ward(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="font-mono text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20 rounded-sm" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center font-mono text-[11px] font-medium tracking-wider">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 rounded-sm p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8 rounded-sm"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8 rounded-sm"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 rounded-sm lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="analytics" className="flex flex-col px-4 lg:px-6">
        <div className="flex aspect-video w-full flex-1 items-center justify-center rounded-sm border border-dashed">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Ward Analytics</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Detailed analytics coming soon
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="targets" className="flex flex-col px-4 lg:px-6">
        <div className="flex aspect-video w-full flex-1 items-center justify-center rounded-sm border border-dashed">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Target Wards</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Set and track ward targets coming soon
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="reports" className="flex flex-col px-4 lg:px-6">
        <div className="flex aspect-video w-full flex-1 items-center justify-center rounded-sm border border-dashed">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Coverage Reports</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Generate reports coming soon
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

// Mock chart data for supporter trends (would come from API in production)
const generateChartData = (supporterCount: number) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const baseValue = Math.max(0, supporterCount - 10);
  return months.map((month, index) => ({
    month,
    supporters: Math.max(
      0,
      baseValue + Math.floor(Math.random() * 5) + index * 2,
    ),
  }));
};

const chartConfig = {
  supporters: {
    label: "Supporters",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

function WardCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();
  const supporterCount = parseInt(item.target) || 0;
  const chartData = React.useMemo(
    () => generateChartData(supporterCount),
    [supporterCount],
  );

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.header}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.header} Ward</DrawerTitle>
          <DrawerDescription>
            Ward coverage details and supporter statistics
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-6 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-mono text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Supporter Trend</h3>
                  <ChartContainer config={chartConfig}>
                    <AreaChart
                      accessibilityLayer
                      data={chartData}
                      margin={{
                        left: 0,
                        right: 10,
                        top: 10,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <Area
                        dataKey="supporters"
                        type="natural"
                        fill="var(--color-supporters)"
                        fillOpacity={0.4}
                        stroke="var(--color-supporters)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
                <Separator />
                <div className="grid gap-2">
                  <div className="flex gap-2 leading-none font-medium">
                    Supporter growth this month{" "}
                    <IconTrendingUp className="size-4" />
                  </div>
                  <div className="text-muted-foreground">
                    Showing supporter count trends for {item.header} ward over
                    the last 6 months. Track your campaign progress and
                    supporter engagement.
                  </div>
                </div>
                <Separator />
              </div>
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <Label htmlFor="ward-name">Ward Name</Label>
                <Input id="ward-name" defaultValue={item.header} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="lga">Local Government Area</Label>
                <Input id="lga" defaultValue={item.type} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status" className="w-full rounded-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="priority">Priority Level</Label>
                <Select defaultValue={item.limit}>
                  <SelectTrigger id="priority" className="w-full rounded-sm">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="supporters">Current Supporters</Label>
                <span className="text-muted-foreground font-mono text-[11px] tracking-wider">
                  {supporterCount} supporters
                </span>
              </div>
              <Input
                id="supporters"
                type="number"
                defaultValue={supporterCount}
                min={0}
              />
              <Progress
                value={Math.min(100, (supporterCount / 20) * 100)}
                className="mt-2 h-2"
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Target: 20 supporters per ward
              </p>
            </div>
            <div className="rounded-sm border border-border/60 p-4">
              <h4 className="mb-2 font-mono text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Coverage Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Status</p>
                  <p className="mt-1 font-medium">{item.reviewer}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Priority</p>
                  <p className="mt-1 font-medium">{item.limit}</p>
                </div>
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button
            className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
            onClick={() => {
              toast.promise(
                new Promise((resolve) => setTimeout(resolve, 1000)),
                {
                  loading: `Saving ${item.header} ward details`,
                  success: "Ward details saved successfully",
                  error: "Failed to save ward details",
                },
              );
            }}
          >
            Save Changes
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="rounded-sm font-mono text-[11px] tracking-widest uppercase">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
