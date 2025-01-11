import { DataTableAdvancedFilterField } from "@/types";
import { createSystemMenu, updateSystemMenu } from "./actions";
import { z } from "zod";
import { createSchema, type CreateDataSchema, type UpdateDataSchema } from "./validations";

type ActionMethod = (params: Record<string, any>) => Promise<any>;

export interface AvailableAction {
  name: string; // 操作名称（供 AI 调用）
  description: string; // 描述（供 AI 理解）
  method: ActionMethod; // 操作实现
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

// 通用适配器
function actionMethodAdapter(
  schema: z.ZodSchema<any>, // 输入验证规则
  handler: (input: any) => Promise<{ data: any; error: any }>
): ActionMethod {
  return async (params: Record<string, any>) => {
    try {
      // 验证输入
      const validatedParams = schema.parse(params);

      // 调用实际业务逻辑
      const result = await handler(validatedParams);

      // 返回成功结果
      if (result.error) {
        throw new Error(result.error);
      }

      return { success: true, data: result.data };
    } catch (error) {
      // 返回失败结果
      return { success: false, message: (error as Error).message };
    }
  };
}



// 注册所有可用操作
const actionRegistry: AvailableAction[] = [
  {
    name: "createMenu",
    description: "Create a new menu item.",
    method: actionMethodAdapter(
      createSchema, // 输入验证规则
      createSystemMenu // 业务逻辑方法
    ),
  },
];
