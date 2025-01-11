import { useRef } from "react";
import { AiMessage, callChatAPI } from "../_lib/chatApi";
import { CommentEditor } from "./CommentEditor";

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
      onSend={handleSend}
      placeholder="在这里输入你的问题"
      isLoading={false}
    />
  );
};
