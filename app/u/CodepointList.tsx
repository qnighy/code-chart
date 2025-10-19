"use client";

import { useMemo, type ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import { filterFromSearchParams, filterToSearch } from "./filter";
import { useJSONMemoize } from "./useJSONMemoize";
import { CodepointListBody } from "./CodepointListBody";
import { FilterToolbar } from "./FilterToolbar";

export function CodepointList(): ReactElement | null {
  const searchParams = useSearchParams();

  const filter = useJSONMemoize(filterFromSearchParams(searchParams));
  const key = useMemo(() => filterToSearch(filter), [filter]);

  return (
    <>
      <FilterToolbar filter={filter} />
      <CodepointListBody key={key} filter={filter} />
    </>
  );
}
