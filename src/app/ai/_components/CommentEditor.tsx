import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";

type CommentEditorProps = {
  onSend: (text: string) => void;
  placeholder?: string;
  isLoading?: boolean;
};

export const CommentEditor: React.FC<CommentEditorProps> = ({
  onSend,
  placeholder = "Write a comment...",
  isLoading = false,
}) => {
  const [text, setText] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text);
      setText(""); // Clear the text area after sending
    }
  };

  return (
    <div className="p-4 ">
      <form onSubmit={handleSend}>
        <div className="grid gap-4">
          {/* Textarea for comment input */}
          <Textarea
            className=" p-4 text-sm"
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />

          {/* Controls: Switch and Send Button */}
          <div className="flex items-center">
            <label
              htmlFor="mute"
              className="flex items-center gap-2 text-xs font-normal text-gray-600"
            >
              <input
                type="checkbox"
                id="mute"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded "
                aria-label="Mute thread"
              />
              Mute this thread
            </label>

            <Button
              type="submit"
              className={`ml-auto px-4 py-2 text-sm font-medium rounded-md  ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
