import React from "react";
import { AiMessage } from "../../_lib/chatApi";
import { UserMessage } from "./UserMessage";
import { AiResponse } from "./AiResponse";

type Props = {
  message: AiMessage;
};

export const MessageItem: React.FC<Props> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`mb-4 flex ${isUser && "justify-end"}`}>
      {isUser ? (
        <UserMessage text={message.parts[0].text} />
      ) : (
        <AiResponse message={message} />
      )}
    </div>
  );
};
