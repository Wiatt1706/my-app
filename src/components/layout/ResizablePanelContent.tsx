"use client";

import { TableAi } from "@/app/ai/_components/TableAi";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useAiboard } from "@/hooks/useAiboard";

const ResizablePanelContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { state } = useAiboard();

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={75}>{children}</ResizablePanel>
      <ResizableHandle withHandle />
      {state.isVisible && (
        <ResizablePanel defaultSize={25} maxSize={50}>
          <TableAi />
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
};

export default ResizablePanelContent;
