"use server"

import { revalidateTag, unstable_noStore } from "next/cache"
import { db } from "@/db/index"
import { landInfo, type LandInfo } from "@/db/schema"
import { takeFirstOrThrow } from "@/db/utils"
import { asc, eq, inArray, not } from "drizzle-orm"
import { getErrorMessage } from "@/lib/handle-error"
import type { UpdateDataSchema } from "./validations"

export async function updateLandInfo(input: UpdateDataSchema & { id: string }) {
	unstable_noStore()
	try {
		const data = await db
			.update(landInfo)
			.set({
				landName: input.landName,
				landType: input.landType,
				landStatus: input.landStatus,
			})
			.where(eq(landInfo.id, input.id))
			.returning({
				landType: landInfo.landType,
				landStatus: landInfo.landStatus,
			})
			.then(takeFirstOrThrow)

		revalidateTag("landInfo")

		if (data.landType === input.landType) {
			revalidateTag("LandInfo-landType-counts")
		}
		if (data.landStatus === input.landStatus) {
			revalidateTag("LandInfo-landStatus-counts")
		}

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

export async function updateLandInfos(input: {
	ids: string[]
	types?: LandInfo["landType"]
}) {
	unstable_noStore()
	try {
		const data = await db
			.update(landInfo)
			.set({
				landType: input.types,
			})
			.where(inArray(landInfo.id, input.ids))
			.returning({
				landType: landInfo.landType,
			})
			.then(takeFirstOrThrow)

		revalidateTag("landInfo")
		if (data.landType === input.types) {
			revalidateTag("LandInfo-landType-counts")
		}

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

export async function deleteLandInfo(input: { id: string }) {
	unstable_noStore()
	try {
		await db.transaction(async (tx) => {
			await tx.delete(landInfo).where(eq(landInfo.id, input.id))
		})

		revalidateTag("landInfo")
		revalidateTag("LandInfo-landType-counts")

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

export async function deleteLandInfos(input: { ids: string[] }) {
	unstable_noStore()
	try {
		await db.transaction(async (tx) => {
			await tx.delete(landInfo).where(inArray(landInfo.id, input.ids))
		})

		revalidateTag("landInfo")
		revalidateTag("LandInfo-landType-counts")

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
