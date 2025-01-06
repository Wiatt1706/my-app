"use server"

import { revalidateTag, unstable_noStore } from "next/cache"
import { db } from "@/db/index"
import { systemMenu, type SystemMenu } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"
import { getErrorMessage } from "@/lib/handle-error"
import type { UpdateDataSchema } from "./validations"

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
			})
			.where(eq(systemMenu.id, input.id))

		console.log("data-isActive", input);
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
		revalidateTag("SystemMenu-landType-counts")

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
		revalidateTag("SystemMenu-landType-counts")

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
