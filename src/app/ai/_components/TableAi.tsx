"use client";

import { useState, useEffect, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AiMessage } from "../_lib/chatApi";
import { HeadTool } from "./HeadTool";
import { MessageList } from "./MessageList";
import { CommentEditorWrapper } from "./CommentEditorWrapper";
import { useDashboard } from "@/hooks/useDashboard";


export function TableAi() {
  const { state } = useDashboard();

  console.log("state", state);
  
  const executeAction = async (
    actionName: string,
    params: Record<string, any>
  ) => {
    const action = state.actions.availableActions.find(
      (a) => a.name === actionName
    );
    if (!action) {
      console.error(`Action "${actionName}" not found.`);
      return;
    }
    const result = await action.method(params);
    console.log("Action result:", result);
  };

  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollAreaHeight, setScrollAreaHeight] = useState("100%");

  const headToolRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

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
        <HeadTool />
      </div>
      {state.pageInfo && (
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            {JSON.stringify(state.pageInfo)}
          </p>
        </div>
      )}
      <ScrollArea
        style={{ maxHeight: scrollAreaHeight, width: "100%" }}
        className="w-full overflow-auto"
      >
        <MessageList messages={messages} />
      </ScrollArea>
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
