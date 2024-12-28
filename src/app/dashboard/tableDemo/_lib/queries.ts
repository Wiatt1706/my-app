import "server-only"

import { db } from "@/db"
import { landInfo, type LandInfo } from "@/db/schema"
import {
  and,
  asc,
  count,
  desc,
  gt,
  gte,
  ilike,
  inArray,
  lte,
} from "drizzle-orm"

import { filterColumns } from "@/lib/filter-columns"
import { unstable_cache } from "@/lib/unstable-cache"

import { type GetDataSchema } from "./validations"

export async function getLandInfos(input: GetDataSchema) {
  return await unstable_cache(
    async () => {
      try {
        const offset = (input.page - 1) * input.perPage
        const fromDate = input.from ? new Date(input.from) : undefined
        const toDate = input.to ? new Date(input.to) : undefined
        const advancedTable = input.flags.includes("advancedTable")

        const advancedWhere = filterColumns({
          table: landInfo,
          filters: input.filters,
          joinOperator: input.joinOperator,
        })

        const where = advancedTable
          ? advancedWhere
          : and(
            input.landName ? ilike(landInfo.landName, `%${input.landName   }%`) : undefined,
            input.landType.length > 0
              ? inArray(landInfo.landType, input.landType)
              : undefined,
            fromDate ? gte(landInfo.createdAt, fromDate.toISOString()) : undefined,
            toDate ? lte(landInfo.createdAt, toDate.toISOString()) : undefined
          )

        const orderBy =
          input.sort.length > 0
            ? input.sort.map((item) =>
              item.desc ? desc(landInfo[item.id]) : asc(landInfo[item.id])
            )
            : [asc(landInfo.createdAt)]

        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx
            .select()
            .from(landInfo)
            .limit(input.perPage)
            .offset(offset)
            .where(where)
            .orderBy(...orderBy)

          const total = await tx
            .select({
              count: count(),
            })
            .from(landInfo)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0)

          return {
            data,
            total,
          }
        })

        const pageCount = Math.ceil(total / input.perPage)
        return { data, pageCount }
      } catch (err) {
        return { data: [], pageCount: 0 }
      }
    },
    [JSON.stringify(input)],
    {
      revalidate: 3600,
      tags: ["landInfo"],
    }
  )()
}

export async function getLandTypeCounts() {
  return unstable_cache(
    async () => {
      try {
        return await db
          .select({
            landType: landInfo.landType,
            count: count(),
          })
          .from(landInfo)
          .groupBy(landInfo.landType)
          .having(gt(count(), 0))
          .then((res) =>
            res.reduce(
              (acc, { landType, count }) => {
                acc[landType] = count
                return acc
              },
              {} as Record<LandInfo["landType"], number>
            )
          )
      } catch (err) {
        return {} as Record<LandInfo["landType"], number>
      }
    },
    ["LandInfo-landType-counts"],
    {
      revalidate: 3600,
    }
  )()
}