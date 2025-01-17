import { useEffect, useRef } from "react";
import { AiMessage } from "../_lib/chatApi";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  generateFunctionDeclarations,
  useFunctionsFromActions,
} from "./ai-util";
import { AiboardState } from "@/components/AiboardProvider";
import { AvailableAction } from "@/app/dashboard/menu/_lib/ai";

type InitialConfig = {
  language?: string; // 语言要求，例如 "zh" 或 "en"
  baseInstructions?: string; // 基础系统说明
  baseFunctions?: AvailableAction[]; // 预定义的基础函数
};

type AiHandlerParams = {
  messages: AiMessage[];
  setMessages: React.Dispatch<React.SetStateAction<AiMessage[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  state: AiboardState; // 父组件提供的状态
  initialConfig?: InitialConfig; // 初始化配置
};

const key = process.env.NEXT_PUBLIC_GEMINI_API;
const genAI = new GoogleGenerativeAI(key!);

export const useAiHandler = ({
  messages,
  setMessages,
  setLoading,
  isLoading,
  state,
  initialConfig = {},
}: AiHandlerParams) => {
  const latestMessagesRef = useRef<AiMessage[]>(messages);

  const allActions = [
    ...(initialConfig.baseFunctions || []),
    ...(state.actions?.availableActions || []),
  ];

  const hasActions = allActions.length > 0;

  const functions = useFunctionsFromActions(allActions); // Always call
  const tools = generateFunctionDeclarations(allActions); // Always call

    const baseInstructions = initialConfig.baseInstructions
    ? `下面这些是我的基础说明，请你在回答时牢记：${initialConfig.baseInstructions}`
    : "";

    const systemInstruction = `
    现在你是DeepCosmo平台的智能 AI 系统，你的主要任务是根据当前页面的调用函数和数据来自动化执行任务，你回答用户的需求时请更多的自主去进行推断，而减少对用户的要求，即使你无法理解用户的需求你也需要推断用户的需求，结合目前你所有的知识进行回答。
    请始终使用中文沟通，并切记你是 DeepCosmo 平台的智能 AI 助手。
    ${baseInstructions}
    `;

    const modelConfig: any = {
    model: "gemini-2.0-flash-exp",
    systemInstruction: `
        ${systemInstruction}
        同时，你将获得当前页面的基本数据：${JSON.stringify(state.pageInfo)}
    `,
    tools,
    };


  const model = genAI.getGenerativeModel(modelConfig);

  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

  const handleSend = async (text: string) => {
    console.log("modelConfig", modelConfig);
    
    if (!text.trim() || isLoading) return;

    const userMessage: AiMessage = { role: "user", parts: [{ text }] };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const chat = model.startChat({
        history: latestMessagesRef.current.filter(
          (message) => message.role !== "system"
        ),
        generationConfig: { maxOutputTokens: 1000, temperature: 2 },
      });

      const preliminaryResult = await chat.sendMessage(text);
      const preliminaryResponse = preliminaryResult.response;

      const functionCalls = preliminaryResponse.functionCalls();
      if (
        hasActions &&
        Array.isArray(functionCalls) &&
        functionCalls.length > 0
      ) {
        await handleFunctionCalls(functionCalls, functions, chat);
      } else {
        await handleStreamResponse(chat, text);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: "抱歉，发生了一个错误。" }] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFunctionCalls = async (
    functionCalls: any[],
    functions: any,
    chat: any
  ) => {
    const autoExecuteCalls = functionCalls.filter(
      (call) => functions[call.name]?.autoExecute
    );
    const manualExecuteCalls = functionCalls.filter(
      (call) => !functions[call.name]?.autoExecute
    );

    const autoResponses = [];
    const placeholderResponses = [];

    for (const autoCall of autoExecuteCalls) {
      const { name, args } = autoCall;
      try {
        const apiResponse = await functions[name].method(args);
        autoResponses.push({ name, response: apiResponse });
      } catch (error) {
        console.error(`Error executing function ${name}:`, error);
        autoResponses.push({
          name,
          response: { status: "error", message: `Error executing ${name}.` },
        });
      }
    }

    if (autoResponses.length > 0) {
      // 为非自动执行的函数生成占位符响应
      for (const manualCall of manualExecuteCalls) {
        placeholderResponses.push({
          name: manualCall.name,
          response: {
            status: "pending",
            message: `Waiting for user confirmation to execute ${manualCall.name}.`,
          },
        });
      }
      const allResponses = [...autoResponses, ...placeholderResponses];
      if (allResponses.length !== functionCalls.length) {
        throw new Error(
          `The number of function responses (${allResponses.length}) does not match the number of function calls (${functionCalls.length})`
        );
      }
      const allResults = await chat.sendMessage(
        allResponses.map((resp) => ({ functionResponse: resp }))
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          parts: [
            {
              text: "",
              autoFunctionCalls: autoExecuteCalls,
            },
          ],
        },
        {
          role: "model",
          parts: [{ text: allResults.response.text() }],
        },
      ]);
    }

    if (manualExecuteCalls.length > 0) {
      handleManualFunctionCalls(manualExecuteCalls, functions, chat);
    }
  };

  const handleManualFunctionCalls = async (
    manualExecuteCalls: any[],
    functions: any,
    chat: any
  ) => {
    const functionCallMessage: AiMessage = {
      role: "system",
      parts: [
        {
          text: "以下方法执行需要您的确认：",
          manualFunctionCalls: manualExecuteCalls,
        },
      ],
      interactive: true,
      onConfirm: async () => {
        try {
          const manualResponses = [];
          for (const manualCall of manualExecuteCalls) {
            const { name, args } = manualCall;
            try {
              const apiResponse = await functions[name].method(args);
              manualResponses.push({ name, response: apiResponse });
            } catch (error) {
              console.error(`Error executing function ${name}:`, error);
              manualResponses.push({
                name,
                response: {
                  status: "error",
                  message: `Error executing ${name}.`,
                },
              });
            }
          }
          const manualResult = await chat.sendMessage(
            "手动执行函数调用完毕，执行结果如下：" +
              JSON.stringify(manualResponses)
          );
          setMessages((prev) => [
            ...prev,
            {
              role: "model",
              parts: [{ text: manualResult.response.text() }],
            },
          ]);
        } catch (error) {
          console.error("Error handling manual function calls:", error);
          setMessages((prev) => [
            ...prev,
            {
              role: "system",
              parts: [{ text: `处理手动函数调用时发生错误: ${error}` }],
            },
          ]);
        }
      },
    };

    setMessages((prev) => [...prev, functionCallMessage]);
  };

  const handleStreamResponse = async (chat: any, text: string) => {
    const streamResult = await chat.sendMessageStream(text);

    let fullResponse = "";
    const modelMessage: AiMessage = { role: "model", parts: [{ text: "" }] };
    setMessages((prev) => [...prev, modelMessage]);

    for await (const chunk of streamResult.stream) {
      fullResponse += chunk.text();
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].parts[0].text = fullResponse;
        return updated;
      });
    }
  };

  return { handleSend };
};
