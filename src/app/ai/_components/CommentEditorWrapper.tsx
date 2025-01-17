import { CommentEditor } from "./CommentEditor";

type CommentEditorWrapperProps = {
  handleSend: (message: string) => void;
  isLoading?: boolean;
};

export const CommentEditorWrapper: React.FC<CommentEditorWrapperProps> = ({
  handleSend,
  isLoading,
}) => {
  return (
    <CommentEditor
      onSend={handleSend}
      placeholder="在这里输入你的问题"
      isLoading={isLoading}
    />
  );
};
