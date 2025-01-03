"use client"

import { type SystemMenu } from "@/db/schema"
import { type Table } from "@tanstack/react-table"
import { Download } from "lucide-react"

import { exportTableToCSV } from "@/lib/export"
import { Button } from "@/components/ui/button"

import { DeleteSystemMenusDialog } from "./delete-systemMenu-dialog";

interface SystemMenuTableToolbarActionsProps {
	table: Table<SystemMenu>;
}

export function SystemMenuTableToolbarActions({ table }: SystemMenuTableToolbarActionsProps) {

	return (
		<div className="flex items-center gap-2">
			{table.getFilteredSelectedRowModel().flatRows.length > 0 ? (
			<DeleteSystemMenusDialog
				menus={table.getFilteredSelectedRowModel().flatRows.map((row) => row.original)}
				onSuccess={() => table.toggleAllRowsSelected(false)}
			/>
			) : null}
			<Button
				variant="outline"
				size="sm"
				onClick={() =>
					exportTableToCSV(table, {
						filename: "systemMenus",
						excludeColumns: ["select", "actions"],
					})
				}
				className="gap-2"
			>
				<Download className="size-4" aria-hidden="true" />
				Export
			</Button>
			{/**
				* Other actions can be added here.
				* For example, import, view, etc.
				*/}
		</div>
	);
}
