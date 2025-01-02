import "server-only"

import { db } from "@/db"
import { systemMenu } from "@/db/schema"
import {
  and,
  asc,
  count,
  desc,
  gte,
  ilike,
  lte,
} from "drizzle-orm"

import { filterColumns } from "@/lib/filter-columns"
import { unstable_cache } from "@/lib/unstable-cache"

import { type GetDataSchema } from "./validations"

export async function getSystemMenus(input: GetDataSchema) {
  return await unstable_cache(
    async () => {
      try {
        const { page, perPage, from, to, filters, joinOperator, title, url, sort } = input;
        const offset = (page - 1) * perPage;

        const where = filterColumns({
          table: systemMenu,
          filters,
          joinOperator,
        })
            const orderBy = sort.length > 0
            ? sort.map(({ id, desc: isDesc }) => (isDesc ? desc(systemMenu[id]) : asc(systemMenu[id])))
            : [asc(systemMenu.createdAt)];

        const { data, total } = await db.transaction(async (tx) => {
          const dataPromise = tx
            .select()
            .from(systemMenu)
            .limit(perPage)
            .offset(offset)
            .where(where)
            .orderBy(...orderBy);

          const totalPromise = tx
            .select({ count: count() })
            .from(systemMenu)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0);

          const [data, total] = await Promise.all([dataPromise, totalPromise]);
          return { data, total };
        });

        const pageCount = Math.ceil(total / perPage);
        return { data, pageCount };
      } catch (error) {
        console.error("Error fetching infos:", error);
        return { data: [], pageCount: 0 };
      }
    },
    [JSON.stringify(input)],
    {
      revalidate: 3600,
      tags: ["systemMenu"],
    }
  )();
}