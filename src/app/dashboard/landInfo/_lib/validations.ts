import { landInfo, type LandInfo } from "@/db/schema"
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"

import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers"

export const searchParamsCache = createSearchParamsCache({
  flags: parseAsArrayOf(z.enum(["advancedTable", "floatingBar"])).withDefault(
    []
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<LandInfo>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  landName: parseAsString.withDefault(""),
  landType: parseAsArrayOf(z.enum(landInfo.landType.enumValues)).withDefault([]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
})

export const createSchema = z.object({
  name: z.string(),
  landType: z.enum(landInfo.landType.enumValues),
})

export const updateSchema = z.object({
  name: z.string().optional(),
  landType: z.enum(landInfo.landType.enumValues).optional(),
})

export type GetDataSchema = Awaited<ReturnType<typeof searchParamsCache.parse>>
export type CreateDataSchema = z.infer<typeof createSchema>
export type UpdateDataSchema = z.infer<typeof updateSchema>
