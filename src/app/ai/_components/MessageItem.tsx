import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { AiMessage } from "../_lib/chatApi";
import { Badge } from "@/components/ui/badge";

type Props = {
  message: AiMessage;
};

export const MessageItem: React.FC<Props> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`inline-block p-2 rounded-lg overflow-hidden max-w-full text-sm space-y-4 break-words ${
          isUser
            ? "bg-secondary text-secondary-foreground whitespace-pre-wrap"
            : ""
        }`}
        style={isUser ? { textAlign: "left", paddingLeft: "1em" } : {}}
      >
        {isUser ? (
          <div>{message.parts[0].text}</div>
        ) : (
          <ReactMarkdown
            components={{
              code(props) {
                const { children, className, node, ...rest } = props;
                const match = /language-(\w+)/.exec(className || "");
                const codeContent = String(children).replace(/\n$/, "");

                return match ? (
                  <div className="relative">
                    <SyntaxHighlighter
                      PreTag="div"
                      children={String(children).replace(/\n$/, "")}
                      language={match[1]}
                      style={okaidia}
                    />
                    <CopyToClipboard text={codeContent}>
                      <button
                        className="absolute top-2 right-2 px-2 py-1 text-xs font-medium text-white bg-gray-700 rounded hover:bg-gray-600"
                        onClick={() => alert("代码已复制！")}
                      >
                        复制
                      </button>
                    </CopyToClipboard>
                  </div>
                ) : (
                  <code {...rest} className={className}>
                    <Badge variant="outline">{children}</Badge>
                  </code>
                );
              },
            }}
          >
            {message.parts[0].text}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};
