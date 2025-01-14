import { useEffect, useRef, useState } from "react";
import { AiMessage } from "../_lib/chatApi";
import { CommentEditor } from "./CommentEditor";
import {
  FunctionDeclarationsTool,
  GoogleGenerativeAI,
  SchemaType,
} from "@google/generative-ai";

const key = process.env.NEXT_PUBLIC_GEMINI_API;
const genAI = new GoogleGenerativeAI(key!);

const functions: Record<string, (args: any) => Promise<any>> = {
  controlLight: async ({ brightness, colorTemperature }) => {
    console.log("Setting light:", brightness, colorTemperature);
    return { brightness, colorTemperature };
  },
  adjustThermostat: async ({ temperature, mode }) => {
    console.log("Adjusting thermostat:", temperature, mode);
    return { temperature, mode };
  },
  playMusic: async ({ trackName, volume }) => {
    console.log("Playing music:", trackName, volume);
    return { trackName, volume };
  },
  openWindow: async ({ action, percentage }) => {
    console.log("Window action:", action, percentage);
    return { action, percentage: action === "open" ? percentage : 0 };
  },
  setAlarm: async ({ time, label, repeat }) => {
    console.log("Setting alarm:", time, label, repeat);
    return { time, label, repeat };
  },
};

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
    {
      name: "adjustThermostat",
      description: "设置房间的温度。",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          temperature: {
            type: SchemaType.INTEGER,
            description: "温度设置，单位为摄氏度（°C）。",
          },
          mode: {
            type: SchemaType.STRING,
            enum: ["cooling", "heating", "auto"],
            description:
              "温控模式：制冷（cooling）、制热（heating）或自动（auto）。",
          },
        },
        required: ["temperature", "mode"],
      },
    },
    {
      name: "playMusic",
      description: "播放音乐。",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          trackName: {
            type: SchemaType.STRING,
            description: "要播放的曲目名称。",
          },
          volume: {
            type: SchemaType.INTEGER,
            description: "音量级别，范围从 0 到 100。",
          },
        },
        required: ["trackName", "volume"],
      },
    },
    {
      name: "openWindow",
      description: "控制房间的窗户状态。",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          action: {
            type: SchemaType.STRING,
            enum: ["open", "close"],
            description: "窗户操作：打开（open）或关闭（close）。",
          },
          percentage: {
            type: SchemaType.INTEGER,
            description:
              "打开窗户的百分比（0 到 100）。仅当 action 为 open 时有效。",
          },
        },
        required: ["action"],
      },
    },
    {
      name: "setAlarm",
      description: "设置闹钟。",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          time: {
            type: SchemaType.STRING,
            description: "闹钟时间，格式为 HH:mm。",
          },
          label: {
            type: SchemaType.STRING,
            description: "闹钟标签，例如 '早起'。",
          },
          repeat: {
            type: SchemaType.BOOLEAN,
            description: "是否重复闹钟。",
          },
        },
        required: ["time"],
      },
    },
  ],
} as FunctionDeclarationsTool;

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
