"use client";

import * as React from "react";
import { systemMenu, type SystemMenu } from "@/db/schema";
import type { DataTableAdvancedFilterField, DataTableRowAction } from "@/types";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import {
  getSystemMenusWithChildren,
  SystemMenuWithChildren,
} from "../_lib/queries";
import { DeleteSystemMenusDialog } from "./delete-systemMenu-dialog";
import { getColumns } from "./table-columns";
import { SystemMenuTableToolbarActions } from "./table-toolbar-actions";
import { UpdateSheet } from "./update-systemMenu-sheet";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { TableFloatingBar } from "./table-floating-bar";
import { getExpandedRowModel } from "@tanstack/react-table";
import { CreateSheet } from "./create-systemMenu-sheet";
import { getMenuTypeContent } from "../_lib/utils";
import { useAiboard } from "@/hooks/useAiboard";
import { createSchema, selectSchema } from "../_lib/validations";
import { createSystemMenu, getMenusWithChildrenByAi } from "../_lib/actions";

export const MenuTableFilterFields: DataTableAdvancedFilterField<SystemMenu>[] =
  [
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
      id: "menuType",
      label: "菜单类型",
      type: "multi-select",
      options: systemMenu.menuType.enumValues.map((val) => ({
        label: getMenuTypeContent(val).text,
        value: val,
      })),
    },
    {
      id: "isActive",
      label: "默认打开",
      type: "boolean",
    },
    {
      id: "menuSort",
      label: "序号",
      type: "number",
    },
    {
      id: "createdAt",
      label: "Created at",
      type: "date",
    },
  ];

interface TableProps {
  promises: Promise<[Awaited<ReturnType<typeof getSystemMenusWithChildren>>]>;
}

export function MenuTable({ promises }: TableProps) {
  const [{ data, pageCount }] = React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<SystemMenu> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction, multiple: true }),
    [setRowAction]
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter: true,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"], left: ["select"] },
    },
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
    getSubRows: (originalRow) =>
      (originalRow as SystemMenuWithChildren).children,
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) =>
      !!(row.original as SystemMenuWithChildren).children?.length,
  });

  const { dispatch } = useAiboard();

  React.useEffect(() => {
    // 设置页面信息
    dispatch({
      type: "SET_PAGE_INFO",
      payload: {
        route: "/menu",
        pageId: "menuTable",
        description: "Manage system menus.",
      },
    });

    const actions = [
      {
        name: "createMenu",
        description: "创建菜单,注意必填参数，如果没有则你随机生成，必须保证必填参数有值",
        schema: createSchema,
        method: createSystemMenu,
      },
      {
        name: "selectMenu",
        description: "查询菜单",
        schema: selectSchema,
        method: getMenusWithChildrenByAi,
        autoExecute: true,
      },
    ];

    // 设置可用操作
    dispatch({
      type: "REGISTER_ACTION",
      payload: { availableActions: actions },
    });
  }, [dispatch]);

  return (
    <>
      <DataTable
        className="h-[calc(100vh-48px)] px-4"
        table={table}
        floatingBar={<TableFloatingBar table={table} />}
      >
        <DataTableAdvancedToolbar
          table={table}
          filterFields={MenuTableFilterFields}
          shallow={false}
        >
          <SystemMenuTableToolbarActions
            setRowAction={setRowAction}
            table={table}
          />
        </DataTableAdvancedToolbar>
      </DataTable>

      <CreateSheet
        open={rowAction?.type === "create"}
        onOpenChange={() => setRowAction(null)}
        datas={{ data: data ?? [], pageCount: pageCount ?? 0 }}
      />

      <UpdateSheet
        open={rowAction?.type === "update" || rowAction?.type === "select"}
        onOpenChange={() => setRowAction(null)}
        menu={rowAction?.row?.original ?? null}
        datas={{ data: data ?? [], pageCount: pageCount ?? 0 }}
      />

      <DeleteSystemMenusDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        rows={rowAction?.row?.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row?.toggleSelected(false)}
      />
    </>
  );
}
