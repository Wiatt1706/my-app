"use client";

import * as React from "react";
import { landInfo, type LandInfo } from "@/db/schema";
import { type DataTableRowAction } from "@/types";
import { type ColumnDef } from "@tanstack/react-table";
import { Ellipsis } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

import { getTypeContent } from "../_lib/utils";
import SquareAvatar from "@/components/SquareAvatar";
import { Icons } from "@/components/icons";

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<LandInfo> | null>
  >;
}

export function getColumns({
  setRowAction,
}: GetColumnsProps): ColumnDef<LandInfo>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="ml-1 translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="ml-1 translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "landName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="土块" />
      ),
      cell: ({ row }) => {
        const coord =
          row.original.worldCoordinatesX +
          ", " +
          row.original.worldCoordinatesY;
        return (
          <div className="flex items-center text-[14px]">
            <SquareAvatar
              url={row.original.coverIconUrl || "/images/DefPixel.png"}
              className="min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] border hover:border-[#006fef] p-1 m-1 overflow-hidden"
            />
            <div className="flex flex-col px-6 gap-2">
              <span className="text-[14px] font-bold">
                {row.getValue("landName")}
              </span>
              <div className="text-[#606060] text-[12px] flex items-center gap-1">
                <Icons.mapPin className="h-4 w-4" />
                {coord}
              </div>
            </div>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "landLevel",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="level" />
      ),
      cell: ({ row }) => {
        const level = landInfo.landLevel.enumValues.find(
          (level) => level === row.original.landLevel
        );

        if (!level) return null;

        return (
          <div className="flex w-[6.25rem] items-center">
            <span className="capitalize">{level + "x" + level}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "landType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = landInfo.landType.enumValues.find(
          (type) => type === row.original.landType
        );

        if (!type) return null;

        const { icon: Icon, text } = getTypeContent(type);

        return (
          <div className="flex w-[6.25rem] items-center">
            <Icon
              className="mr-2 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="capitalize">{text}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue() as Date),
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "update" })}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "delete" })}
              >
                Delete
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 40,
    },
  ];
}
