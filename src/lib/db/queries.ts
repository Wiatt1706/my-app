import "server-only"

import { db } from "@/db"
import {
	count,
	gt,
} from "drizzle-orm"

import { unstable_cache } from "@/lib/unstable-cache"

import { PgColumn, PgTable } from "drizzle-orm/pg-core"

type GroupedCountsOptions<T extends PgTable<any>, K extends keyof T["_"]["columns"]> = {
	table: T;
	groupByField: K;
	cacheKey: string;
	revalidate?: number;
};

// 获取 指定表格 的统计数据
export async function getGroupedCounts<
	T extends PgTable<any>,
	K extends keyof T["_"]["columns"]
>({
	table,
	groupByField,
	cacheKey,
	revalidate = 3600,
}: GroupedCountsOptions<T, K>): Promise<Record<string, number>> {
	return unstable_cache(
		async () => {
			try {
				// 强制将 groupByField 的类型解析为有效的列
				const groupColumn = table[groupByField] as PgColumn<any>;

				const result = await db
					.select({
						groupKey: groupColumn,
						count: count(),
					})
					.from(table)
					.groupBy(groupColumn)
					.having(gt(count(), 0));

				// Reduce the result to a Record<string, number>
				return result.reduce((acc, { groupKey, count }) => {
					acc[String(groupKey)] = count;
					return acc;
				}, {} as Record<string, number>);
			} catch (err) {
				console.error("Error in getGroupedCounts:", err);
				return {};
			}
		},
		[cacheKey],
		{
			revalidate,
			tags: [cacheKey],
		}
	)();
}
