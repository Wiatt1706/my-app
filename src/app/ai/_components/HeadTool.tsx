import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAiboard } from "@/hooks/useAiboard";
import {
  Clock,
  MoreVertical,
  PanelLeft,
  PanelRightClose,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { AiMessage } from "../_lib/chatApi";

interface HeadToolProps {
  setMessages: React.Dispatch<React.SetStateAction<AiMessage[]>>;
}

export const HeadTool: React.FC<HeadToolProps> = ({ setMessages }) => {
  const { state, dispatch } = useAiboard();
  const { pageInfo, actions } = state;

  // Reusable Dialog Component
  const InfoDialog = ({
    triggerText,
    title,
    content,
  }: {
    triggerText: string;
    title: string;
    content: any;
  }) => (
    <Dialog modal>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          {triggerText}
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="w-full relative overflow-hidden">
          <pre className="bg-muted p-2 rounded text-sm overflow-auto  max-h-[400px]">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );

  // 清除缓存并清空当前信息的处理函数
  const handleClearData = () => {
    setMessages([]);
    // 清除 localStorage 中的缓存数据
    localStorage.removeItem("messages");
  };

  const toggleAi = () => {
    dispatch({
      type: "SET_VISIBILITY",
      payload: !state.isVisible,
    });
  };

  return (
    <>
      <div className="flex items-center p-2">
        {/* Archive and Trash Section */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleAi}>
                <PanelRightClose className="h-4 w-4" />
                <span className="sr-only">PanelLeft</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>PanelLeft</TooltipContent>
          </Tooltip>
        </div>

        {/* Snooze Section */}
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearData} // 点击时清除缓存和当前信息
              >
                <RefreshCcw className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to trash</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="mx-2 h-6" />

        {/* More Options Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Page Info Dialog */}
            <InfoDialog
              triggerText="页面信息"
              title="页面信息"
              content={pageInfo}
            />

            {/* Page Actions Dialog */}
            <InfoDialog
              triggerText="页面函数"
              title="页面函数"
              content={actions.availableActions}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
    </>
  );
};
