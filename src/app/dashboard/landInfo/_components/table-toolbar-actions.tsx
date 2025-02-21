"use client"

import { type LandInfo } from "@/db/schema"
import { type Table } from "@tanstack/react-table"
import { Download } from "lucide-react"

import { exportTableToCSV } from "@/lib/export"
import { Button } from "@/components/ui/button"

import { DeleteLandInfosDialog } from "./delete-landInfo-dialog";

interface LandInfoTableToolbarActionsProps {
  table: Table<LandInfo>;
}

export function LandInfoTableToolbarActions({ table }: LandInfoTableToolbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteLandInfosDialog
          lands={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "landInfos",
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
