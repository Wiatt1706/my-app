import React from "react";

type Props = {
  text: string;
};

export const UserMessage: React.FC<Props> = ({ text }) => {
  return (
    <div
      className="inline-block rounded-lg max-w-full text-sm p-4 bg-secondary text-secondary-foreground whitespace-pre-wrap overflow-x-auto"
      style={{ textAlign: "left", paddingLeft: "1em" }}
    >
      {text}
    </div>
  );
};
