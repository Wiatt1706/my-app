"use client";

import * as React from "react";
import { type SystemMenu } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { updateSystemMenu } from "../_lib/actions";
import { updateSchema, type UpdateDataSchema } from "../_lib/validations";
import { Input } from "@/components/ui/input";
import { Icons, RenderIcon } from "@/components/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";

interface UpdateSheetProps extends React.ComponentPropsWithRef<typeof Sheet> {
  menu: SystemMenu | null;
}

export function UpdateSheet({ menu, ...props }: UpdateSheetProps) {
  const [isUpdatePending, startUpdateTransition] = React.useTransition();
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const form = useForm<UpdateDataSchema>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
	  icon: menu?.icon || "",
      title: menu?.title,
      url: menu?.url || "",
      menuSort: menu?.menuSort || 0,
    },
  });

  React.useEffect(() => {
    if (menu) {
      form.reset({
		icon: menu.icon || "",
        title: menu.title || "",
        url: menu.url || "",
        menuSort: menu.menuSort || 0,
      });
    }
  }, [menu, form]);

  function onSubmit(input: UpdateDataSchema) {
    startUpdateTransition(async () => {
      if (!menu) return;

      const { error } = await updateSystemMenu({
        id: menu.id,
        ...input,
      });

      console.log("error", error);

      if (error) {
        toast.error(error);
        return;
      }

      form.reset();
      props.onOpenChange?.(false);
      toast.success("Menu updated");
    });
  }

  const filteredIcons = Object.keys(Icons).filter((iconKey) =>
    iconKey.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Sheet {...props}>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Update SystemMenu</SheetTitle>
          <SheetDescription>
            Update the systemMenu details and save the changes
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
			<FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Popover modal>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          {field.value ? RenderIcon(field.value) : <span>Select Icon</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="flex flex-col p-2 gap-2 relative overflow-hidden">
						{/* Search input */}
						<Input
							placeholder="Search icons..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="mb-2"
						/>

						{/* Scrollable area */}
						<ScrollArea className="h-48 max-h-[200px] w-full overflow-y-auto">
							<div className="grid grid-cols-4 gap-2">
							{filteredIcons.length === 0 ? (
								<span>No icons found</span>
							) : (
								filteredIcons.map((iconKey) => (
								<div
									key={iconKey}
									onClick={() => {
									field.onChange(iconKey);
									}}
									className={`flex items-center justify-center p-2 cursor-pointer rounded-md ${
									field.value === iconKey ? "bg-primary text-white" : "hover:bg-gray-200"
									}`}
								>
									{RenderIcon(iconKey)}
								</div>
								))
							)}
							</div>
						</ScrollArea>
						<div className="mt-2">
							<Button
							variant="outline"
							onClick={() => field.onChange("")}  // Clear the selected icon
							className="w-full"
							>
							Clear Current Icon
							</Button>
						</div>
						</PopoverContent>

                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Do a kickflip"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Url</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Do a kickflip"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="menuSort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>序号</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="序号"
                      value={field.value} // 受控输入
                      onChange={(e) => field.onChange(Number(e.target.value))} // 转换为数字
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="gap-2 pt-2 sm:space-x-0">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button disabled={isUpdatePending}>
                {isUpdatePending && (
                  <Loader
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Save
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
