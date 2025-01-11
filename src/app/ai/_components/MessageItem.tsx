import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { AiMessage } from "../_lib/chatApi";

type Props = {
  message: AiMessage;
};

export const MessageItem: React.FC<Props> = ({ message }) => {
  return (
    <div
      className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}
    >
      <div
        className={`inline-block p-2 rounded-lg overflow-hidden max-w-full ${
          message.role === "user"
            ? "bg-[#18181b] text-primary-foreground"
            : "bg-[#f4f4f5] text-[#18181b] text-sm space-y-4 break-words space-x-2"
        }`}
      >
        <ReactMarkdown
          components={{
            code({ node, inline, className, children }: any) {
              const match = /language-(\w+)/.exec(className || "");
              const codeContent = String(children).replace(/\n$/, "");

              return inline ? (
                <code>{children}</code>
              ) : (
                <div className="relative">
                  <SyntaxHighlighter
                    style={okaidia}
                    language={match ? match[1] : ""}
                  >
                    {codeContent}
                  </SyntaxHighlighter>
                  <CopyToClipboard text={codeContent}>
                    <button
                      className="absolute top-2 right-2 px-2 py-1 text-xs font-medium text-white bg-gray-700 rounded hover:bg-gray-600"
                      onClick={() => alert("代码已复制！")}
                    >
                      复制
                    </button>
                  </CopyToClipboard>
                </div>
              );
            },
          }}
        >
          {message.parts[0].text}
        </ReactMarkdown>
      </div>
    </div>
  );
};
