"use client"

import * as React from "react"
import { type SystemMenu } from "@/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

import { updateSystemMenu } from "../_lib/actions";
import { updateSchema, type UpdateDataSchema } from "../_lib/validations";

interface UpdateSheetProps extends React.ComponentPropsWithRef<typeof Sheet> {
	menu: SystemMenu | null;
}

export function UpdateSheet({ menu, ...props }: UpdateSheetProps) {
	const [isUpdatePending, startUpdateTransition] = React.useTransition();

	const form = useForm<UpdateDataSchema>({
		resolver: zodResolver(updateSchema),
		defaultValues: {
			title: menu?.title || "",
			url: menu?.url || "",
		},
	});

	React.useEffect(() => {
		if (menu) {
			form.reset({
				title: menu.title || "",
				url: menu.url || "",
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

			if (error) {
				toast.error(error);
				return;
			}

			form.reset();
			props.onOpenChange?.(false);
			toast.success("Task updated");
		});
	}

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
