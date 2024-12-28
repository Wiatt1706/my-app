import * as React from "react";
import { type SearchParams } from "@/types";

import { getValidFilters } from "@/lib/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DateRangePicker } from "@/components/date-range-picker";

import { FeatureFlagsProvider } from "./_components/feature-flags-provider";
import { LandInfosTable } from "./_components/landInfo-table";
import { getLandInfos, getLandTypeCounts } from "./_lib/queries";
import { searchParamsCache } from "./_lib/validations";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function IndexPage(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([
    getLandInfos({
      ...search,
      filters: validFilters,
    }),
    getLandTypeCounts(),
  ]);

  return (
    <>
      <React.Suspense
        fallback={
          <DataTableSkeleton
            columnCount={6}
            searchableColumnCount={1}
            filterableColumnCount={2}
            cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem", "8rem"]}
            shrinkZero
            className="p-4"
          />
        }
      >
        <LandInfosTable promises={promises} />
      </React.Suspense>
    </>
  );
}
