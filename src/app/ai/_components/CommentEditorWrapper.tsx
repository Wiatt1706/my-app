import { useEffect, useRef, useState } from "react";
import { AiMessage } from "../_lib/chatApi";
import { CommentEditor } from "./CommentEditor";
import {
  EnhancedGenerateContentResponse,
  FunctionDeclarationsTool,
  GoogleGenerativeAI,
  SchemaType,
  Tool,
} from "@google/generative-ai";

const key = process.env.NEXT_PUBLIC_GEMINI_API;
const genAI = new GoogleGenerativeAI(key!);

// 模拟控制灯光的逻辑函数
async function controlLight(args: {
  brightness: number;
  colorTemperature: string;
}) {
  // 实现控制灯光的逻辑，例如调用实际硬件 API 或服务
  return {
    success: true,
    message: `灯光已设置为亮度：${args.brightness}，色温：${args.colorTemperature}。`,
  };
}

const functionDeclarationsTool = {
  functionDeclarations: [
    {
      name: "controlLight",
      description: "设置房间灯光的亮度和色温。",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          brightness: {
            type: SchemaType.INTEGER,
            description:
              "亮度级别，范围从 0 到 100。0 表示关闭，100 表示全亮度。",
          },
          colorTemperature: {
            type: SchemaType.STRING,
            enum: ["daylight", "cool", "warm"],
            description: "灯光的色温，可以是 'daylight'、'cool' 或 'warm'。",
          },
        },
        required: ["brightness", "colorTemperature"],
      },
    },
  ],
};

const tools = [functionDeclarationsTool];
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  tools: tools,
});

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
  const latestMessagesRef = useRef<AiMessage[]>(messages);
  const [isStreamActive, setStreamActive] = useState(false);

  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

  // 模拟设置灯光的 API 函数
  async function setLightValues(brightness: number, colorTemp: string) {
    return {
      brightness,
      colorTemperature: colorTemp,
    };
  }

  // 定义可用的函数调用映射
  const functions = {
    controlLight: async ({
      brightness,
      colorTemperature,
    }: {
      brightness: number;
      colorTemperature: string;
    }) => {
      return await setLightValues(brightness, colorTemperature);
    },
  };

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

      const result = await chat.sendMessageStream(text);
      const response = await result.response;
      console.log("result:", result);
      // 检查是否有函数调用建议
      if (
        Array.isArray(response.functionCalls) &&
        response.functionCalls.length > 0
      ) {
        console.log("response.functionCalls:", response.functionCalls);
        const functionCall = response.functionCalls[0];
        if (functionCall) {
          console.log("functionCall：", functionCall);
          const { name, arguments: args } = functionCall;

          console.log("functionCall：",name);
          
          if (functions[name]) {
            const apiResponse = await functions[name](args);

            // 将函数返回结果发送回模型
            const finalResult = await chat.sendMessage([
              {
                functionResponse: {
                  name,
                  response: apiResponse,
                },
              },
            ]);

            const finalResponseText = await finalResult.response.text();
            setMessages((prev) => [
              ...prev,
              { role: "model", parts: [{ text: finalResponseText }] },
            ]);
            return;
          }
        }
      }

      // 流式处理响应
      let fullResponse = "";
      const modelMessage: AiMessage = { role: "model", parts: [{ text: "" }] };
      setMessages((prev) => [...prev, modelMessage]);

      for await (const chunk of result.stream) {
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
