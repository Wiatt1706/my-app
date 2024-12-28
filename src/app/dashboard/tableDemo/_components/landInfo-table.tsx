"use client";

import * as React from "react";
import { landInfo, type LandInfo } from "@/db/schema";
import type {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
} from "@/types";

import { toSentenceCase } from "@/lib/utils";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

import type { getLandInfos, getLandTypeCounts } from "../_lib/queries";
import { getStatusIcon } from "../_lib/utils";
import { DeleteLandInfosDialog } from "./delete-landInfo-dialog";
import { useFeatureFlags } from "./feature-flags-provider";
import { getColumns } from "./table-columns";
import { TasksTableFloatingBar } from "./table-floating-bar";
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
  const { featureFlags } = useFeatureFlags();

  const [{ data, pageCount }, TypeCounts] = React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<LandInfo> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  );

  /**
   * This component can render either a faceted filter or a search filter based on the `options` prop.
   *
   * @prop options - An array of objects, each representing a filter option. If provided, a faceted filter is rendered. If not, a search filter is rendered.
   *
   * Each `option` object has the following properties:
   * @prop {string} label - The label for the filter option.
   * @prop {string} value - The value for the filter option.
   * @prop {React.ReactNode} [icon] - An optional icon to display next to the label.
   * @prop {boolean} [withCount] - An optional boolean to display the count of the filter option.
   */
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
        icon: getStatusIcon(type),
        count: TypeCounts[type],
      })),
    },
  ];

  /**
   * Advanced filter fields for the data table.
   * These fields provide more complex filtering options compared to the regular filterFields.
   *
   * Key differences from regular filterFields:
   * 1. More field types: Includes 'text', 'multi-select', 'date', and 'boolean'.
   * 2. Enhanced flexibility: Allows for more precise and varied filtering options.
   * 3. Used with DataTableAdvancedToolbar: Enables a more sophisticated filtering UI.
   * 4. Date and boolean types: Adds support for filtering by date ranges and boolean values.
   */
  const advancedFilterFields: DataTableAdvancedFilterField<LandInfo>[] = [
    {
      id: "landName",
      label: "name",
      type: "text",
    },
    {
      id: "landType",
      label: "type",
      type: "multi-select",
      options: landInfo.landType.enumValues.map((type) => ({
        label: toSentenceCase(type),
        value: type,
        icon: getStatusIcon(type),
        count: TypeCounts[type],
      })),
    },
    {
      id: "createdAt",
      label: "Created at",
      type: "date",
    },
  ];

  const enableAdvancedTable = featureFlags.includes("advancedTable");
  const enableFloatingBar = featureFlags.includes("floatingBar");

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: enableAdvancedTable,
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
      <DataTable
        table={table}
        floatingBar={
          enableFloatingBar ? <TasksTableFloatingBar table={table} /> : null
        }
      >
        {enableAdvancedTable ? (
          <DataTableAdvancedToolbar
            table={table}
            filterFields={advancedFilterFields}
            shallow={false}
          >
            <LandInfoTableToolbarActions table={table} />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table} filterFields={filterFields}>
            <LandInfoTableToolbarActions table={table} />
          </DataTableToolbar>
        )}
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
