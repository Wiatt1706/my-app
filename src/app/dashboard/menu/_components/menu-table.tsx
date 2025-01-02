"use client";

import * as React from "react";
import { type SystemMenu } from "@/db/schema";
import type { DataTableAdvancedFilterField, DataTableFilterField, DataTableRowAction } from "@/types";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import type { getSystemMenusWithChildren, SystemMenuWithChildren} from "../_lib/queries";
import { DeleteSystemMenusDialog } from "./delete-systemMenu-dialog";
import { getColumns } from "./table-columns";
import { SystemMenuTableToolbarActions } from "./table-toolbar-actions";
import { UpdateSheet } from "./update-systemMenu-sheet";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { TableFloatingBar } from "./table-floating-bar";
import { getExpandedRowModel } from "@tanstack/react-table";

interface SystemMenuTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getSystemMenusWithChildren>>,
    ]
  >;
}

export function MenuTable({ promises }: SystemMenuTableProps) {
  const [{ data, pageCount }] = React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<SystemMenu> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  );

  const advancedFilterFields: DataTableAdvancedFilterField<SystemMenu>[] = [
    {
      id: "title",
      label: "title",
      type: "text",
    },
    {
      id: "url",
      label: "url",
      type: "text",
    },
    {
      id: "createdAt",
      label: "Created at",
      type: "date",
    },
  ];

  const filterFields: DataTableFilterField<SystemMenu>[] = [
    {
      id: "title",
      label: "title",
      placeholder: "Filter titles...",
    }
  ];

  console.log("data", data);
  
  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: true,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
    getSubRows: (originalRow) => (originalRow as SystemMenuWithChildren).children,
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => !!((row.original as SystemMenuWithChildren).children?.length)
  });

  return (
    <>
      <DataTable
        className="h-[calc(100vh-48px)] px-8"
        table={table} 
        floatingBar={
          <TableFloatingBar table={table} />
        } 
      >
        <DataTableAdvancedToolbar
            table={table}
            filterFields={advancedFilterFields}
            shallow={false}
          >
          <SystemMenuTableToolbarActions table={table} />
        </DataTableAdvancedToolbar>
      </DataTable>

      <UpdateSheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        menu={rowAction?.row.original ?? null}
      />

      <DeleteSystemMenusDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        menus={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
}
