import { useRef } from "react";
import { AiMessage, callChatAPI } from "../_lib/chatApi";
import { CommentEditor } from "./CommentEditor";
import { GoogleGenerativeAI } from "@google/generative-ai";

const key = process.env.NEXT_PUBLIC_GEMINI_API;
const genAI = new GoogleGenerativeAI(key!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  const latestMessagesRef = useRef<AiMessage[]>([]);
  latestMessagesRef.current = messages;



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


   const handleSend3 = async (text: string) => {
     if (!text.trim()) return;

     const userMessage: AiMessage = { role: "user", parts: [{ text }] };
     setMessages((prev) => [...prev, userMessage]);
     setIsLoading(true);

     try {
       const chat = model.startChat({
         history: latestMessagesRef.current,
         generationConfig: {
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

  const handleSend2 = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: AiMessage = { role: "user", parts: [{ text }] };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const modelMessage = await callChatAPI(latestMessagesRef.current, text);
      setMessages((prev) => [...prev, modelMessage]);
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

  return (
    <CommentEditor
      onSend={handleSend3}
      placeholder="在这里输入你的问题"
      isLoading={false}
    />
  );
};
