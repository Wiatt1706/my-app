import { useState } from "react";
import { CommentEditor } from "./CommentEditor";
import { AiMessage } from "../_lib/chatApi";
import { useAiboard } from "@/hooks/useAiboard";
import { useAiHandler } from "./AiHandler";

type CommentEditorWrapperProps = {
  messages?: AiMessage[];
  setMessages?: React.Dispatch<React.SetStateAction<AiMessage[]>>;
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CommentEditorWrapper: React.FC<CommentEditorWrapperProps> = ({
  messages: propMessages = [],
  setMessages: propSetMessages,
  setIsLoading: propSetIsLoading,
}) => {
  const { state } = useAiboard();
  const [localMessages, setLocalMessages] = useState(propMessages);
  const [isLoading, setLocalLoading] = useState(false);

  const messages = propSetMessages ? propMessages : localMessages;
  const setMessages = propSetMessages || setLocalMessages;
  const setLoading = propSetIsLoading || setLocalLoading;

  const { handleSend } = useAiHandler({
    messages,
    setMessages,
    setLoading,
    isLoading,
    state,
  });

  return (
    <CommentEditor
      onSend={handleSend}
      placeholder="在这里输入你的问题"
      isLoading={isLoading}
    />
  );
};
