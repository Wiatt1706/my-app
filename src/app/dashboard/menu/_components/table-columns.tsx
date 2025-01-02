"use client";

import * as React from "react";
import { systemMenu, type SystemMenu } from "@/db/schema";
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

interface GetColumnsProps {
	setRowAction: React.Dispatch<
		React.SetStateAction<DataTableRowAction<SystemMenu> | null>
	>;
}

export function getColumns({
	setRowAction,
}: GetColumnsProps): ColumnDef<SystemMenu>[] {
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
				className="translate-y-0.5"
			  />
			),
			cell: ({ row }) => (
			  <Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
				className="translate-y-0.5"
			  />
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "title",
			header: ({ column }) => (
			  <DataTableColumnHeader column={column} title="title" />
			),
			cell: ({ row }) => <div className="w-20">{row.getValue("title")}</div>,
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "url",
			header: ({ column }) => (
			  <DataTableColumnHeader column={column} title="url" />
			),
			cell: ({ row }) => <div className="w-20">{row.getValue("url")}</div>,
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "icon",
			header: ({ column }) => (
			  <DataTableColumnHeader column={column} title="icon" />
			),
			cell: ({ row }) => <div className="w-20">{row.getValue("icon")}</div>,
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "createdAt",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Created At" />
			),
			cell: ({ cell }) => formatDate(cell.getValue() as Date),
      size: 40,
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
