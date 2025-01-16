import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { AiMessage } from "../../_lib/chatApi";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Render Markdown
export const renderMarkdown = (text: string) => (
  <ReactMarkdown
    components={{
      code({ children, className, ...rest }) {
        const match = /language-(\w+)/.exec(className || "");
        const codeContent = String(children).replace(/\n$/, "");

        return match ? (
          <div className="relative group">
            <SyntaxHighlighter PreTag="div" language={match[1]} style={okaidia}>
              {codeContent}
            </SyntaxHighlighter>
            <CopyToClipboard text={codeContent}>
              <button
                className="absolute top-2 right-2 px-2 py-1 text-xs font-medium text-white bg-gray-700 rounded hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => alert("代码已复制！")}
              >
                复制
              </button>
            </CopyToClipboard>
          </div>
        ) : (
          <code
            {...rest}
            className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs shadow-sm"
          >
            {children}
          </code>
        );
      },
    }}
  >
    {text}
  </ReactMarkdown>
);

// Render Manual Function Calls
export const renderManualFunctionCalls = (
  functionCalls: Array<{ name: string; args: Record<string, any> }>,
  message: AiMessage
) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExecuted, setIsExecuted] = useState(false);

  return (
    <>
      {functionCalls.map((call, index) => (
        <div
          key={index}
          className="p-3 border rounded bg-card text-card-foreground text-sm flex flex-col gap-1"
        >
          <div>
            <span className="font-bold">方法:</span> {call.name}
          </div>
          <div>
            <span className="font-bold">参数:</span>
            <pre className="bg-muted p-2 rounded text-xs mt-2 overflow-x-auto">
              {JSON.stringify(call.args, null, 2)}
            </pre>
          </div>
        </div>
      ))}
      {message?.onConfirm && !isExecuted && (
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={isExecuting}
            onClick={async () => {
              if (message?.onConfirm) {
                setIsExecuting(true);
                try {
                  await message.onConfirm();
                  setIsExecuted(true);
                } finally {
                  setIsExecuting(false);
                }
              }
            }}
          >
            {isExecuting ? "执行中..." : "确认执行"}
          </Button>
        </div>
      )}
    </>
  );
};

// Render Auto Function Calls
export const renderAutoFunctionCalls = (
  functionCalls: Array<{ name: string; args: Record<string, any> }>
) => (
  <Tooltip>
    <Popover>
      <PopoverTrigger asChild>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <InfoIcon className="h-4 w-4" />
            <span className="sr-only">查看详情</span>
          </Button>
        </TooltipTrigger>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-2">
        <div className="text-sm">
          <span className="font-bold">自动执行参数</span>
          <pre className="bg-muted p-2 rounded text-xs mt-2 overflow-x-auto">
            {JSON.stringify(functionCalls, null, 2)}
          </pre>
        </div>
      </PopoverContent>
    </Popover>
    <TooltipContent>点击查看详细信息</TooltipContent>
  </Tooltip>
);