"use client";

import { useState,  } from "react";
import { MessageList } from "./_components/MessageList";
import { CommentEditorWrapper } from "./_components/CommentEditorWrapper";
import { AiMessage } from "./_lib/chatApi";
import { HeadTool } from "./_components/HeadTool";
import { Separator } from "@/components/ui/separator";

export default function ChatPage() {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="relative flex flex-col h-full">
      <HeadTool />
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      <div className="absolute bottom-0 w-full">
        <Separator className="mt-auto" />
        <CommentEditorWrapper
          messages={messages}
          setMessages={setMessages}
          setIsLoading={setIsLoading}
        />
      </div>
    </div>
  );
}
