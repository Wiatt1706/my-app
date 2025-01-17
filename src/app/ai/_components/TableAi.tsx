import { useState, useEffect, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AiMessage } from "../_lib/chatApi";
import { HeadTool } from "./HeadTool";
import { MessageList } from "./message/MessageList";
import { CommentEditorWrapper } from "./CommentEditorWrapper";
import { useAiHandler } from "./AiHandler";
import { useAiboard } from "@/hooks/useAiboard";

export function TableAi() {
  const { state } = useAiboard();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [scrollAreaHeight, setScrollAreaHeight] = useState("100%");

  const headToolRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { handleSend } = useAiHandler({
    messages,
    setMessages,
    setLoading,
    isLoading,
    state,
  });

  const templates = [
    {
      title: "Recursion Explanation",
      description: "Learn about recursion with examples.",
      content: "Can you explain the concept of recursion with examples?",
    },
    {
      title: "Sorting Algorithms",
      description: "Understand different sorting algorithms.",
      content: "Can you compare bubble sort and quicksort?",
    },
    {
      title: "JavaScript Closures",
      description: "Deep dive into closures in JavaScript.",
      content: "What are closures in JavaScript, and how are they used?",
    },
  ];

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
        className="w-full overflow-auto"
      >
        {messages.length > 0 ? (
          <>
            <MessageList messages={messages} />
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex flex-wrap gap-4 justify-start w-full p-4">
            {templates.map((template, index) => (
              <Card
                key={index}
                className="w-full cursor-pointer"
                onClick={() => {
                  setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                      role: "user",
                      parts: [
                        {
                          text: template.content,
                          manualFunctionCalls: [],
                          autoFunctionCalls: [],
                        },
                      ],
                    },
                  ]);
                }}
              >
                <CardHeader>
                  <CardTitle>{template.title}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
      <div ref={bottomRef} className="absolute bottom-0 w-full bg-background">
        <Separator className="mt-auto" />
        <CommentEditorWrapper isLoading={isLoading} handleSend={handleSend} />
      </div>
    </div>
  );
}
