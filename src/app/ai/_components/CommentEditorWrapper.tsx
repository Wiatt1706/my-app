import { useEffect, useRef, useState } from "react";
import { AiMessage } from "../_lib/chatApi";
import { CommentEditor } from "./CommentEditor";
import {
	GoogleGenerativeAI,
} from "@google/generative-ai";
import { useAiboard } from "@/hooks/useAiboard";
import { generateFunctionDeclarations, useFunctionsFromActions } from "./ai-util";

const key = process.env.NEXT_PUBLIC_GEMINI_API;
const genAI = new GoogleGenerativeAI(key!);

type Props = {
	messages: AiMessage[];
	setMessages: React.Dispatch<React.SetStateAction<AiMessage[]>>;
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CommentEditorWrapper: React.FC<Props> = ({
	messages,
	setMessages,
	setIsLoading,
}) => {
	const { state } = useAiboard();
	const availableActions = state.actions.availableActions || [];
	const functions = useFunctionsFromActions(availableActions);
	const tools = generateFunctionDeclarations(availableActions);
	const latestMessagesRef = useRef<AiMessage[]>(messages);
	const [isStreamActive, setStreamActive] = useState(false);

	const model = genAI.getGenerativeModel({
		model: "gemini-1.5-flash",
		tools: [tools],
	});

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
				history: latestMessagesRef.current.filter(
					(message) => message.role !== "system"
				),
				generationConfig: {
					maxOutputTokens: 1000,
				},
			});

			const preliminaryResult = await chat.sendMessage(text);
			const preliminaryResponse = preliminaryResult.response;

			const functionCalls = preliminaryResponse.functionCalls();
			if (Array.isArray(functionCalls) && functionCalls.length > 0) {
				// 将函数调用分为自动执行和非自动执行
				const autoExecuteCalls = functionCalls.filter(
					(call) => functions[call.name]?.autoExecute
				);
				const manualExecuteCalls = functionCalls.filter(
					(call) => !functions[call.name]?.autoExecute
				);

				const allResponses = [] as { name: string; response: any }[];

				// 自动执行函数调用处理
				for (const autoCall of autoExecuteCalls) {
					const { name, args } = autoCall;

					if (functions[name]) {
						try {
							const apiResponse = await functions[name].method(args);
							allResponses.push({
                name,
                response: apiResponse,
              });
						} catch (error) {
							console.error(`Error executing function ${name}:`, error);
							allResponses.push({
                name,
                response: {
                  status: "error",
                  message: `Error executing ${name}.`,
                },
              });
						}
					}
				}

				// 处理自动响应的最终文本
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
        ]);

				// 处理非自动执行函数的确认
				if (manualExecuteCalls.length > 0) {
					const functionCallMessage: AiMessage = {
            role: "system",
            parts: [
              {
                text: "以下函数调用需要您的确认：",
                manualFunctionCalls: manualExecuteCalls,
              },
            ],
            interactive: true,
            onConfirm: async () => {
              try {
                for (const manualCall of manualExecuteCalls) {
                  const { name, args } = manualCall;

                  if (functions[name]) {
                    try {
                      const apiResponse = await functions[name].method(args);
                      allResponses.push({
                        name,
                        response: apiResponse,
                      });
                    } catch (error) {
                      console.error(`Error executing function ${name}:`, error);
                      allResponses.push({
                        name,
                        response: {
                          status: "error",
                          message: `Error executing ${name}.`,
                        },
                      });
                    }
                  }
                }

                // 将用户确认后的响应发送给模型
                const manualResult = await chat.sendMessage(
                  allResponses.map((resp) => ({ functionResponse: resp }))
                );

                const manualResponseText = await manualResult.response.text();
                setMessages((prev) => [
                  ...prev,
                  { role: "model", parts: [{ text: manualResponseText }] },
                ]);
              } catch (error) {
                console.error("Error handling manual function calls:", error);
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "system",
                    parts: [{ text: "处理手动函数调用时发生错误。" }],
                  },
                ]);
              }
            },
          };

					setMessages((prev) => [...prev, functionCallMessage]);
				}

				setStreamActive(false); // 停止流式处理
				return;
			}

			// 如果没有函数调用，则流式处理响应
			const streamResult = await chat.sendMessageStream(text);

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
