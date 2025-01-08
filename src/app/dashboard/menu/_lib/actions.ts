"use server"

import { revalidateTag, unstable_noStore } from "next/cache"
import { db } from "@/db/index"
import { systemMenu, type SystemMenu } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"
import { getErrorMessage } from "@/lib/handle-error"
import type { CreateDataSchema, UpdateDataSchema } from "./validations"

export async function createSystemMenu(input: CreateDataSchema) {
	unstable_noStore();
	try {
		await db.transaction(async (tx) => {
			const newMenu = await tx
				.insert(systemMenu)
				.values({
					title: input.title,
					url: input.url,
					icon: input.icon,
					shortcut: input.shortcut,
					isActive: input.isActive, // 使用驼峰命名
					menuType: input.menuType,
					menuSort: input.menuSort,
				});
		});

		revalidateTag("systemMenu");
		revalidateTag("navMenu");

		return {
			data: null,
			error: null,
		};
	} catch (err) {
		return {
			data: null,
			error: getErrorMessage(err),
		};
	}
}


export async function updateSystemMenu(input: UpdateDataSchema & { id: string }) {
	unstable_noStore()
	try {
		const data = await db
			.update(systemMenu)
			.set({
				title: input.title,
				url: input.url,
				menuSort: input.menuSort,
				isActive: input.isActive,
				icon: input.icon,
				shortcut: input.shortcut,
				menuType: input.menuType
			})
			.where(eq(systemMenu.id, input.id))

		revalidateTag("systemMenu")
		revalidateTag("navMenu")

		return {
			data: null,
			error: null,
		}
	} catch (err) {
		return {
			data: null,
			error: getErrorMessage(err),
		}
	}
}

export async function updateSystemMenus(input: {
	ids: string[]
	isActive?: SystemMenu["isActive"]
	parentId?: SystemMenu["parentId"]
	menuType?: SystemMenu["menuType"]
		}) {
	unstable_noStore()
	try {
		const data = await db
		.update(systemMenu)
		.set({
			isActive: input.isActive,
			parentId: input.parentId,
			menuType: input.menuType,
		})
		.where(inArray(systemMenu.id, input.ids))

			revalidateTag("systemMenu")
			revalidateTag("navMenu")

			return {
		data: null,
		error: null,
			}
	} catch (err) {
		return {
			data: null,
			error: getErrorMessage(err),
		}
	}
}


export async function deleteSystemMenu(input: { id: string }) {
	unstable_noStore()
	try {
		await db.transaction(async (tx) => {
			await tx.delete(systemMenu).where(eq(systemMenu.id, input.id))
		})

		revalidateTag("systemMenu")
		revalidateTag("navMenu")

		return {
			data: null,
			error: null,
		}
	} catch (err) {
		return {
			data: null,
			error: getErrorMessage(err),
		}
	}
}

export async function deleteSystemMenus(input: { ids: string[] }) {
	unstable_noStore()
	try {
		await db.transaction(async (tx) => {
			await tx.delete(systemMenu).where(inArray(systemMenu.id, input.ids))
		})

		revalidateTag("systemMenu")
		revalidateTag("navMenu")

		return {
			data: null,
			error: null,
		}
	} catch (err) {
		return {
			data: null,
			error: getErrorMessage(err),
		}
	}
}
