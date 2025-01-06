import { systemMenu, type SystemMenu } from "@/db/schema"
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"

import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers"

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<SystemMenu>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  title: parseAsString.withDefault(""),
  url: parseAsString.withDefault(""),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
})

export const createSchema = z.object({
  title: z.string(),
  url: z.string(),
})

export const updateSchema = z.object({
  title: z.string().optional(),
  url: z.string().optional(),
  menuSort: z.number().optional(),
  isActive: z.boolean().optional(),
})

export type GetDataSchema = Awaited<ReturnType<typeof searchParamsCache.parse>>
export type CreateDataSchema = z.infer<typeof createSchema>
export type UpdateDataSchema = z.infer<typeof updateSchema>
