import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { AiMessage } from "../_lib/chatApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  message: AiMessage;
};

export const MessageItem: React.FC<Props> = ({ message }) => {
  const isUser = message.role === "user";
  const [isExecuting, setIsExecuting] = useState(false);

  // Render Markdown content
  const renderMarkdown = (text: string) => (
    <ReactMarkdown
      components={{
        code({ children, className, ...rest }) {
          const match = /language-(\w+)/.exec(className || "");
          const codeContent = String(children).replace(/\n$/, "");

          return match ? (
            <div className="relative group">
              <SyntaxHighlighter
                PreTag="div"
                language={match[1]}
                style={okaidia}
              >
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

  // Render interactive function calls (if any)
  const renderFunctionCalls = (
    functionCalls?: Array<{ name: string; args: Record<string, any> }>
  ) => {
    const [isExecuting, setIsExecuting] = React.useState(false);
    const [isExecuted, setIsExecuted] = React.useState(false);

    if (!functionCalls) return null;

    return (
      <div className="mt-2 space-y-2">
        {functionCalls.map((call, index) => (
          <div
            key={index}
            className="p-2 border rounded bg-secondary text-secondary-foreground whitespace-pre-wrap text-sm space-y-1 flex flex-col gap-2"
          >
            <div>
              <strong>方法:</strong> {call.name}
            </div>
            <div>
              <strong>参数:</strong>
              <pre className="bg-muted p-2 rounded">
                {JSON.stringify(call.args, null, 2)}
              </pre>
            </div>
          </div>
        ))}
        {!isExecuted && (
          <Button
            size="sm"
            disabled={isExecuting}
            onClick={async () => {
              if (message.onConfirm) {
                setIsExecuting(true);
                try {
                  await message.onConfirm();
                  setIsExecuted(true); // 设置已成功执行
                } finally {
                  setIsExecuting(false);
                }
              }
            }}
          >
            {isExecuting ? "执行中..." : "执行函数"}
          </Button>
        )}
      </div>
    );
  };


  return (
    <div className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`inline-block p-4 rounded-lg max-w-full text-sm break-words space-y-4 ${
          isUser
            ? "bg-secondary text-secondary-foreground whitespace-pre-wrap"
            : ""
        }`}
        style={isUser ? { textAlign: "left", paddingLeft: "1em" } : {}}
      >
        {/* Render text or markdown */}
        {renderMarkdown(message.parts[0].text)}

        {/* Render function calls if present */}
        {message.parts[0].functionCalls &&
          renderFunctionCalls(message.parts[0].functionCalls)}
      </div>
    </div>
  );
};
