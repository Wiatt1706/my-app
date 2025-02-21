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
  landStatus: parseAsArrayOf(z.enum(landInfo.landStatus.enumValues)).withDefault([]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
})

export const createSchema = z.object({
  landName: z.string(),
  landType: z.enum(landInfo.landType.enumValues),
  landStatus: z.enum(landInfo.landStatus.enumValues),
})

export const updateSchema = z.object({
  landName: z.string().optional(),
  landType: z.enum(landInfo.landType.enumValues).optional(),
  landStatus: z.enum(landInfo.landStatus.enumValues).optional(),
})

export type GetDataSchema = Awaited<ReturnType<typeof searchParamsCache.parse>>
export type CreateDataSchema = z.infer<typeof createSchema>
export type UpdateDataSchema = z.infer<typeof updateSchema>
