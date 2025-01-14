import { useEffect, useRef } from "react";
import { AiMessage } from "../_lib/chatApi";
import { CommentEditor } from "./CommentEditor";
import { FunctionDeclarationsTool, GoogleGenerativeAI, SchemaType, Tool } from "@google/generative-ai";

const key = process.env.NEXT_PUBLIC_GEMINI_API;
const genAI = new GoogleGenerativeAI(key!);

const functionDeclarationsTool: FunctionDeclarationsTool = {
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

const tools: Tool[] = [functionDeclarationsTool];

async function controlLight(args: {
  brightness: number;
  colorTemperature: string;
}) {
  // 在此处实现控制灯光的逻辑
  // 例如，调用实际的硬件 API 或服务
  return {
    success: true,
    message: `灯光已设置为亮度：${args.brightness}，色温：${args.colorTemperature}。`,
  };
}

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  tools: tools,
});

type InitialConfig = {
  systemPrompt?: string; // 预设 AI 的系统提示
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
  const latestMessagesRef = useRef<AiMessage[]>([]);
  latestMessagesRef.current = messages;

  // 设置初始系统消息
  const initializeSystemMessage = () => {
    if (initialConfig?.systemPrompt) {
      const systemMessage: AiMessage = {
        role: "user",
        parts: [{ text: initialConfig.systemPrompt }],
      };
      setMessages([systemMessage, ...messages]);
    }
  };

  // 初始化时注入系统消息
  useEffect (() => {
    initializeSystemMessage();
  } , []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: AiMessage = { role: "user", parts: [{ text }] };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/generateChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: latestMessagesRef.current,
          text,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullResponse = "";
      const modelMessage: AiMessage = { role: "model", parts: [{ text: "" }] };

      setMessages((prev) => [...prev, modelMessage]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        console.log("value：", decoder.decode(value, { stream: true }));
        fullResponse += decoder.decode(value, { stream: true });

        // Update the last message in the state
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].parts[0].text = fullResponse;
          return updated;
        });
      }
    } catch (error) {
      console.error("Error calling chat API:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: "抱歉，发生了一个错误。" }] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendlocal = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: AiMessage = { role: "user", parts: [{ text }] };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const chat = model.startChat({
        history: latestMessagesRef.current,
        generationConfig: initialConfig?.generationConfig || {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessageStream(text);
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
    }
  };

  return (
    <CommentEditor
      onSend={handleSendlocal}
      placeholder="在这里输入你的问题"
      isLoading={false}
    />
  );
};
