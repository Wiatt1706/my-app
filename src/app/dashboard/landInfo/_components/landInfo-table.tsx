"use client";

import * as React from "react";
import { landInfo, type LandInfo } from "@/db/schema";
import type { DataTableFilterField, DataTableRowAction } from "@/types";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import type {
  getLandInfos,
  getLandStatsCounts,
  getLandTypeCounts,
} from "../_lib/queries";
import { getStatusContent, getTypeContent } from "../_lib/utils";
import { DeleteLandInfosDialog } from "./delete-landInfo-dialog";
import { getColumns } from "./table-columns";
import { LandInfoTableToolbarActions } from "./table-toolbar-actions";
import { UpdateSheet } from "./update-landInfo-sheet";
import { useDashboard } from "@/hooks/useAiboard";

interface LandInfoTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getLandInfos>>,
      Awaited<ReturnType<typeof getLandTypeCounts>>,
      Awaited<ReturnType<typeof getLandStatsCounts>>
    ]
  >;
}

export function LandInfosTable({ promises }: LandInfoTableProps) {
  const [{ data, pageCount }, TypeCounts, StatusCounts] = React.use(promises);

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
        label: getTypeContent(type).text,
        value: type,
        icon: getTypeContent(type).icon,
        count: TypeCounts[type],
      })),
    },
    {
      id: "landStatus",
      label: "status",
      options: landInfo.landStatus.enumValues.map((status) => ({
        label: getStatusContent(status).text,
        value: status,
        icon: getStatusContent(status).icon,
        count: StatusCounts[status],
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

  const { state, dispatch } = useDashboard();

  React.useEffect(() => {
    // 设置页面信息
    dispatch({
      type: "SET_PAGE_INFO",
      payload: {
        route: "/landInfo",
        pageId: "landInfoTable",
        description: "Manage system landInfo.",
      },
    });

    // 设置初始表格数据
    dispatch({
      type: "SET_TABLE_DATA",
      payload: {
        data: data,
      },
    });
  }, [dispatch]);

  return (
    <>
      <DataTable table={table} className="h-[calc(100vh-48px)] px-8">
        <DataTableToolbar table={table} filterFields={filterFields}>
          <LandInfoTableToolbarActions table={table} />
        </DataTableToolbar>
      </DataTable>

      <UpdateSheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        land={rowAction?.row?.original ?? null}
      />

      <DeleteLandInfosDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        lands={rowAction?.row?.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row?.toggleSelected(false)}
      />
    </>
  );
}
