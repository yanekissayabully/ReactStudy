"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CATEGORIES,
  SORT_KEYS,
  STATUSES,
  type ItemsQuery,
} from "@/lib/types";

export const PAGE_SIZE = 6;

export const DEFAULT_QUERY: ItemsQuery = {
  search: "",
  status: "all",
  category: "all",
  sort: "name",
  order: "asc",
  page: 1,
  pageSize: PAGE_SIZE,
};

type Patch = Partial<Omit<ItemsQuery, "pageSize">>;

function pick<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T | undefined {
  return allowed.find((candidate) => candidate === value);
}

export function useItemsQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = useMemo<ItemsQuery>(() => {
    const page = Number(searchParams.get("page"));
    return {
      search: searchParams.get("search") ?? DEFAULT_QUERY.search,
      status: pick(searchParams.get("status"), STATUSES) ?? "all",
      category: pick(searchParams.get("category"), CATEGORIES) ?? "all",
      sort: pick(searchParams.get("sort"), SORT_KEYS) ?? DEFAULT_QUERY.sort,
      order: searchParams.get("order") === "desc" ? "desc" : "asc",
      page: Number.isInteger(page) && page > 0 ? page : 1,
      pageSize: PAGE_SIZE,
    };
  }, [searchParams]);

  const update = useCallback(
    (patch: Patch, options: { replace?: boolean } = {}) => {
      const next: ItemsQuery = { ...query, page: 1, ...patch };
      const params = new URLSearchParams();

      if (next.search.trim()) params.set("search", next.search);
      if (next.status !== "all") params.set("status", next.status);
      if (next.category !== "all") params.set("category", next.category);
      if (next.sort !== DEFAULT_QUERY.sort) params.set("sort", next.sort);
      if (next.order !== DEFAULT_QUERY.order) params.set("order", next.order);
      if (next.page > 1) params.set("page", String(next.page));

      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (options.replace) router.replace(url);
      else router.push(url);
    },
    [query, pathname, router],
  );

  const isFiltered =
    query.search.trim() !== "" ||
    query.status !== "all" ||
    query.category !== "all";

  return { query, update, isFiltered };
}
