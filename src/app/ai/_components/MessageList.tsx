import { AiMessage } from "../_lib/chatApi";
import { MessageItem } from "./MessageItem";

type Props = {
  messages: AiMessage[];
};

export const MessageList: React.FC<Props> = ({ messages }) => {
  return (
    <>
      {messages.map((message, index) => (
        <MessageItem key={index} message={message} />
      ))}
    </>
  );
};
