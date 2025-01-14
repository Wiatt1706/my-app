import { useEffect, useMemo, useRef, useState } from "react";
import { AiMessage } from "../_lib/chatApi";
import { CommentEditor } from "./CommentEditor";
import {
  FunctionDeclarationsTool,
  GoogleGenerativeAI,
  SchemaType,
} from "@google/generative-ai";
import { useDashboard } from "@/hooks/useDashboard";
import { generateFunctionDeclarations, useFunctionsFromActions } from "./ai-util";

const key = process.env.NEXT_PUBLIC_GEMINI_API;
const genAI = new GoogleGenerativeAI(key!);

type InitialConfig = {
  systemPrompt?: string;
  generationConfig?: {
    maxOutputTokens?: number;
    temperature?: number;
    topP?: number;
  };
};

type Props = {
  messages: AiMessage[];
  setMessages: React.Dispatch<React.SetStateAction<AiMessage[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  initialConfig?: InitialConfig;
};

export const CommentEditorWrapper: React.FC<Props> = ({
  messages,
  setMessages,
  setIsLoading,
  initialConfig,
}) => {
  const { state } = useDashboard();
  const availableActions = state.actions.availableActions || [];
  const functions = useFunctionsFromActions(availableActions);
  const tools = generateFunctionDeclarations(availableActions);
  const latestMessagesRef = useRef<AiMessage[]>(messages);
  const [isStreamActive, setStreamActive] = useState(false);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    tools: [tools],
  });

  console.log("model", model);
  
  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isStreamActive) return;

    const userMessage: AiMessage = { role: "user", parts: [{ text }] };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setStreamActive(true);

    try {
      const chat = model.startChat({
        history: latestMessagesRef.current,
        generationConfig: initialConfig?.generationConfig || {
          maxOutputTokens: 1000,
        },
      });

      // Step 1: 使用 sendMessage 检查是否存在函数调用
      const preliminaryResult = await chat.sendMessage(text);
      const preliminaryResponse = await preliminaryResult.response;

      const functionCalls = await preliminaryResponse.functionCalls();
      if (Array.isArray(functionCalls) && functionCalls.length > 0) {
        const functionResponses = []; // 用于存储所有函数调用的响应

        for (const functionCall of functionCalls) {
          const { name, args } = functionCall;

          if (functions[name]) {
            try {
              const apiResponse = await functions[name](args);
              // 将响应存储到数组中
              functionResponses.push({
                name,
                response: apiResponse,
              });
            } catch (error) {
              console.error(`Error executing function ${name}:`, error);
              functionResponses.push({
                name,
                response: `执行函数 ${name} 时发生错误。`,
              });
            }
          } else {
            console.warn(`No handler for function ${name}`);
            functionResponses.push({
              name,
              response: `未找到函数 ${name} 的处理程序。`,
            });
          }
        }

        // 将所有响应一次性发送给模型
        const finalResult = await chat.sendMessage(
          functionResponses.map((funcResponse) => ({
            functionResponse: funcResponse,
          }))
        );

        const finalResponseText = await finalResult.response.text();
        setMessages((prev) => [
          ...prev,
          { role: "model", parts: [{ text: finalResponseText }] },
        ]);

        return; // 函数调用已处理完成，结束处理。
      }

      // Step 2: 如果没有函数调用，改为流式处理
      const streamResult = await chat.sendMessageStream(text);

      // 流式响应处理
      let fullResponse = "";
      const modelMessage: AiMessage = { role: "model", parts: [{ text: "" }] };
      setMessages((prev) => [...prev, modelMessage]);

      for await (const chunk of streamResult.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].parts[0].text = fullResponse;
          return updated;
        });
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: "抱歉，发生了一个错误。" }] },
      ]);
    } finally {
      setIsLoading(false);
      setStreamActive(false);
    }
  };

  return (
    <CommentEditor
      onSend={handleSend}
      placeholder="在这里输入你的问题"
      isLoading={isStreamActive}
    />
  );
};
