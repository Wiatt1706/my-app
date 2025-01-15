
import { z } from "zod";

type ActionMethod = (params: Record<string, any>) => Promise<any>;

export interface AvailableAction {
  name: string; // 操作名称（供 AI 调用）
  description: string; // 描述（供 AI 理解）
  method: ActionMethod; // 操作实现
  schema: z.ZodSchema<any>; // 输入验证规则
  autoExecute?: boolean; // 是否自动执行
}
