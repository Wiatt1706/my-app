import { DataTableAdvancedFilterField } from "@/types";
import { createSystemMenu, updateSystemMenu } from "./actions";
import { z } from "zod";
import { createSchema, type CreateDataSchema, type UpdateDataSchema } from "./validations";

type ActionMethod = (params: Record<string, any>) => Promise<any>;

export interface AvailableAction {
  name: string; // 操作名称（供 AI 调用）
  description: string; // 描述（供 AI 理解）
  method: ActionMethod; // 操作实现
  schema: z.ZodSchema<any>; // 输入验证规则
}

interface SharedTableData {
  pageInfo: {
    route: string;
    pageId: string;
    description: string;
  };
  query: {
    initialFilters: Record<string, any>;
    currentFilters: Record<string, any>;
    filterFields: DataTableAdvancedFilterField<any>[];
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
  };
  tableData: {
    data: any[];
    rowChildren?: (row: any) => any[];
  };
  actions: {
    availableActions: AvailableAction[]; // 可用操作
    selectedRows: any[]; // 当前选中的行
  };
}