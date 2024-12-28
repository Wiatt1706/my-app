"use client";

import * as React from "react";
import { landInfo, type LandInfo } from "@/db/schema";
import type { DataTableFilterField, DataTableRowAction } from "@/types";

import { toSentenceCase } from "@/lib/utils";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import type { getLandInfos, getLandTypeCounts } from "../_lib/queries";
import { getTypeContent } from "../_lib/utils";
import { DeleteLandInfosDialog } from "./delete-landInfo-dialog";
import { getColumns } from "./table-columns";
import { LandInfoTableToolbarActions } from "./table-toolbar-actions";
import { UpdateSheet } from "./update-landInfo-sheet";

interface LandInfoTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getLandInfos>>,
      Awaited<ReturnType<typeof getLandTypeCounts>>
    ]
  >;
}

export function LandInfosTable({ promises }: LandInfoTableProps) {
  const [{ data, pageCount }, TypeCounts] = React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<LandInfo> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  );

  const filterFields: DataTableFilterField<LandInfo>[] = [
    {
      id: "landName",
      label: "name",
      placeholder: "Filter names...",
    },
    {
      id: "landType",
      label: "type",
      options: landInfo.landType.enumValues.map((type) => ({
        label: toSentenceCase(type),
        value: type,
        icon: getTypeContent(type).icon,
        count: TypeCounts[type],
      })),
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table} filterFields={filterFields}>
          <LandInfoTableToolbarActions table={table} />
        </DataTableToolbar>
      </DataTable>

      <UpdateSheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        land={rowAction?.row.original ?? null}
      />

      <DeleteLandInfosDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        lands={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
}
