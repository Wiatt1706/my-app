import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
            className=" p-4 text-sm max-h-60"
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />

          {/* Controls: Switch and Send Button */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mute this thread
              </label>
            </div>

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
