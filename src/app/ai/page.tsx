"use client";

import { useState } from "react";
import { MessageList } from "./_components/MessageList";
import { CommentEditorWrapper } from "./_components/CommentEditorWrapper";
import { AiMessage } from "./_lib/chatApi";
import { HeadTool } from "./_components/HeadTool";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatPage() {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="relative flex flex-col h-full">
      <HeadTool />
      <ScrollArea className="max-h-[calc(100vh-260px)] w-full overflow-y-auto">
        <MessageList messages={messages} />
      </ScrollArea>
      <div className="absolute bottom-0 w-full bg-background">
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
