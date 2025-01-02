"use client";

import * as React from "react";
import { systemMenu, type SystemMenu } from "@/db/schema";
import { type DataTableRowAction } from "@/types";
import { type ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Ellipsis } from "lucide-react";

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
import { Icons } from "@/components/icons";

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
			accessorKey: 'title',
			header: ({ column, table }) => (
			  <div className="flex items-center gap-2">
				<Checkbox
				  checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				  }
				  onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				  aria-label="Select all"
				/>
				<button
				  {...{
					onClick: table.getToggleAllRowsExpandedHandler(),
				  }}
				  className="p-1 rounded transition-transform duration-200 
							  focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-200"
				  aria-label="Toggle expand"
				>
				  <ChevronRight
					className={`w-4 h-4 transition-transform duration-200 ${
					  table.getIsAllRowsExpanded() ? "rotate-90" : ""
					}`}
				  />
				</button>
				<DataTableColumnHeader className="ml-2" column={column} title="title" />
			  </div>
			),
			cell: ({ row }) => (
			  <div
				style={{
				  paddingLeft: `${row.depth * 2}rem`,
				}}
			  >
				<div className="flex items-center gap-2">
				  <Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				  />
				  {row.getCanExpand() ? (
					<button
					  onClick={row.getToggleExpandedHandler()}
					  className="p-1 rounded transition-transform duration-200 
								  focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-200"
					  aria-label="Toggle expand"
					>
					  <ChevronRight
						className={`w-4 h-4 transition-transform duration-200 ${
						  row.getIsExpanded() ? "rotate-90" : ""
						}`}
					  />
					</button>
				  ) : (
					<span className=""></span> // 空白占位符
				  )}
				  <span>{row.getValue("title")}</span>
				</div>
			  </div>
			),
			footer: (props) => props.column.id,
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
				<DataTableColumnHeader column={column} title="图标" />
			),
			cell: ({ row }) => {
				const icon = row.getValue("icon") as keyof typeof Icons; 
				const Icon = icon ? Icons[icon] : Icons.logo;
				return <div className="w-20">{<Icon className="size-4" />}</div>
			},
			enableSorting: false,
			enableHiding: false,
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
