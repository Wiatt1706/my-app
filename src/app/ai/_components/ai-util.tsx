import { AvailableAction } from "@/app/dashboard/menu/_lib/ai";
import {
  FunctionDeclarationSchemaProperty,
  FunctionDeclarationsTool,
  SchemaType,
} from "@google/generative-ai";
import { useMemo } from "react";
import { ZodObject, ZodType, ZodOptional, ZodEnum } from "zod";

export function generateFunctionDeclarations(
  actions: AvailableAction[]
): FunctionDeclarationsTool | undefined {
  // 如果 actions 长度小于等于 0，直接返回 undefined
  if (actions.length <= 0) {
    return undefined;
  }

  return {
    functionDeclarations: actions.map((action: AvailableAction) => {
      if (!action.schema || !(action.schema instanceof ZodObject)) {
        throw new Error(
          `Invalid schema for action "${action.name}". Expected a ZodObject.`
        );
      }

      const schema = action.schema;
      return {
        name: action.name,
        description: action.description,
        parameters: {
          type: SchemaType.OBJECT,
          properties: Object.entries(
            schema.shape as { [key: string]: ZodType }
          ).reduce(
            (
              acc: { [k: string]: FunctionDeclarationSchemaProperty },
              [key, value]: [string, ZodType]
            ) => {
              // 如果是 ZodOptional，提取内部实际类型
              const actualType =
                value instanceof ZodOptional ? value.unwrap() : value;

              acc[key] = {
                type: convertZodTypeToSchemaType(actualType),
                description: `${key} 参数`,
              };

              if (actualType instanceof ZodEnum) {
                acc[key].enum = actualType._def.values; // 提取 enum 的值
              }

              return acc;
            },
            {} // 初始值是一个空对象
          ),
          required: Object.keys(schema.shape).filter(
            (key) => !(schema.shape[key] instanceof ZodOptional)
          ),
        },
      };
    }),
  };
}

// 辅助函数：将 Zod 类型转换为 SchemaType
function convertZodTypeToSchemaType(zodType: any): SchemaType {
  if (!zodType || !zodType._def) {
    throw new Error("Invalid Zod type provided.");
  }
  switch (zodType._def.typeName) {
    case "ZodString":
      return SchemaType.STRING;
    case "ZodNumber":
      return SchemaType.NUMBER;
    case "ZodBoolean":
      return SchemaType.BOOLEAN;
    case "ZodEnum":
      return SchemaType.STRING;
    case "ZodArray":
      return SchemaType.STRING;
    default:
      throw new Error(`Unsupported Zod type: ${zodType._def.typeName}`);
  }
}

function actionToFunctionAdapter(
  schema: any,
  method: (args: any) => Promise<any>
): (args: any) => Promise<any> {
  return async (args: any) => {
    // 1. 验证输入
    const validatedInput = schema.parse(args);

    // 2. 执行业务逻辑
    const result = await method(validatedInput);

    // 3. 返回结果
    return result;
  };
}

export function useFunctionsFromActions(
  actions: AvailableAction[]
): Record<
  string,
  { autoExecute: boolean; method: (args: any) => Promise<any> }
> {
  return useMemo(() => {
    const functions: Record<
      string,
      { autoExecute: boolean; method: (args: any) => Promise<any> }
    > = {};
    actions.forEach((action) => {
      const { name, method, schema, autoExecute = false } = action;
      functions[name] = {
        autoExecute,
        method: actionToFunctionAdapter(schema, method),
      };
    });
    return functions;
  }, [actions]);
}

