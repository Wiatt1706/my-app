import "server-only"

import { db } from "@/db"
import { landInfo } from "@/db/schema"
import {
  and,
  asc,
  count,
  desc,
  gte,
  ilike,
  inArray,
  lte,
} from "drizzle-orm"

import { filterColumns } from "@/lib/filter-columns"
import { unstable_cache } from "@/lib/unstable-cache"

import { type GetDataSchema } from "./validations"
import { getGroupedCounts } from "@/lib/db/queries"

export async function getLandInfos(input: GetDataSchema) {
  return await unstable_cache(
    async () => {
      try {
        const { page, perPage, from, to, flags, filters, joinOperator, landName, landType, landStatus, sort } = input;
        const offset = (page - 1) * perPage;

        const fromDate = from ? new Date(from) : undefined;
        const toDate = to ? new Date(to) : undefined;
        const isAdvancedTable = flags.includes("advancedTable");

        const where = isAdvancedTable
          ? filterColumns({
              table: landInfo,
              filters,
              joinOperator,
            })
          : and(
              landName ? ilike(landInfo.landName, `%${landName}%`) : undefined,
              landType.length > 0 ? inArray(landInfo.landType, landType) : undefined,
              landStatus.length > 0 ? inArray(landInfo.landStatus, landStatus) : undefined,
              fromDate ? gte(landInfo.createdAt, fromDate.toISOString()) : undefined,
              toDate ? lte(landInfo.createdAt, toDate.toISOString()) : undefined
            );

            const orderBy = sort.length > 0
            ? sort.map(({ id, desc: isDesc }) => (isDesc ? desc(landInfo[id]) : asc(landInfo[id])))
            : [asc(landInfo.createdAt)];

        const { data, total } = await db.transaction(async (tx) => {
          const dataPromise = tx
            .select()
            .from(landInfo)
            .limit(perPage)
            .offset(offset)
            .where(where)
            .orderBy(...orderBy);

          const totalPromise = tx
            .select({ count: count() })
            .from(landInfo)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0);

          const [data, total] = await Promise.all([dataPromise, totalPromise]);
          return { data, total };
        });

        const pageCount = Math.ceil(total / perPage);
        return { data, pageCount };
      } catch (error) {
        console.error("Error fetching land infos:", error);
        return { data: [], pageCount: 0 };
      }
    },
    [JSON.stringify(input)],
    {
      revalidate: 3600,
      tags: ["landInfo"],
    }
  )();
}

// 获取 landType 的统计数据
export async function getLandTypeCounts() {
  return getGroupedCounts({
    table: landInfo,
    groupByField: "landType",
    cacheKey: "LandInfo-landType-counts",
    revalidate: 3600,
  });
}

// 获取 landStatus 的统计数据
export async function getLandStatsCounts() {
  return getGroupedCounts({
    table: landInfo,
    groupByField: "landStatus",
    cacheKey: "LandInfo-landStatus-counts",
    revalidate: 3600,
  });
}
