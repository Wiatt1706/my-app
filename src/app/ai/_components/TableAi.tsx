"use client";

import { useState, useEffect, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { AiMessage } from "../_lib/chatApi";
import { HeadTool } from "./HeadTool";
import { MessageList } from "./message/MessageList";
import { CommentEditorWrapper } from "./CommentEditorWrapper";

export function TableAi() {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollAreaHeight, setScrollAreaHeight] = useState("100%");

  const headToolRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 从localStorage加载消息
  useEffect(() => {
    const savedMessages = localStorage.getItem("messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // 每次更新messages时，将它们保存到localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("messages", JSON.stringify(messages));
    }
  }, [messages]);

  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const updateHeight = () => {
      const headToolHeight = headToolRef.current?.offsetHeight || 0;
      const bottomHeight = bottomRef.current?.offsetHeight || 0;
      const newHeight = `calc(100vh - ${headToolHeight + bottomHeight + 48}px)`;
      setScrollAreaHeight(newHeight);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    // Observe the headTool and bottom sections
    if (headToolRef.current) {
      resizeObserver.observe(headToolRef.current);
    }
    if (bottomRef.current) {
      resizeObserver.observe(bottomRef.current);
    }

    updateHeight();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="relative flex flex-col h-full w-full">
      <div ref={headToolRef}>
        <HeadTool setMessages={setMessages} />
      </div>
      <div
        style={{ maxHeight: scrollAreaHeight, width: "100%" }}
        className="w-full overflow-auto "
      >
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </div>
      <div ref={bottomRef} className="absolute bottom-0 w-full bg-background">
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
