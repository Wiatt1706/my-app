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
import { Archive, Clock, MoreVertical, Trash2 } from "lucide-react";

export const HeadTool: React.FC = () => {
  const { state } = useAiboard();
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

  return (
    <>
      <div className="flex items-center p-2">
        {/* Archive and Trash Section */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Archive className="h-4 w-4" />
                <span className="sr-only">Archive</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to trash</TooltipContent>
          </Tooltip>
        </div>

        {/* Snooze Section */}
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Clock className="h-4 w-4" />
                    <span className="sr-only">Snooze</span>
                  </Button>
                </TooltipTrigger>
              </PopoverTrigger>
              <PopoverContent className="flex w-[535px] p-0">
                <div className="flex flex-col gap-2 border-r px-2 py-4">
                  <div className="px-4 text-sm font-medium">Snooze until</div>
                </div>
                <div className="p-2">
                  <Calendar />
                </div>
              </PopoverContent>
            </Popover>
            <TooltipContent>Snooze</TooltipContent>
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
