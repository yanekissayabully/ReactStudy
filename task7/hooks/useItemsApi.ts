"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type { Item, ItemChanges, ItemInput, ItemsQuery } from "@/lib/types";
import {
  createItem,
  deleteItem,
  getAllItems,
  getItem,
  getItems,
  updateItem,
} from "@/services/service";

// Query keys. The key is the cache address: same key = same cache entry.
// Every value the request depends on (filters, page, id) is part of the key,
// so "page 2" and "page 3" never overwrite each other.
export const itemKeys = {
  all: ["items"] as const,
  lists: () => [...itemKeys.all, "list"] as const,
  list: (query: ItemsQuery) => [...itemKeys.lists(), query] as const,
  everything: () => [...itemKeys.all, "everything"] as const,
  details: () => [...itemKeys.all, "detail"] as const,
  detail: (id: number) => [...itemKeys.details(), id] as const,
};

// ---------- reading (cached) ----------

// `signal` is aborted by TanStack Query when the key changes or the component
// unmounts, so an outdated request can never overwrite a newer result.
export function useItemsList(query: ItemsQuery) {
  return useQuery({
    queryKey: itemKeys.list(query),
    queryFn: ({ signal }) => getItems(query, signal),
    // Keep showing the previous page while the next one loads.
    placeholderData: keepPreviousData,
  });
}

export function useAllItems() {
  return useQuery({
    queryKey: itemKeys.everything(),
    queryFn: ({ signal }) => getAllItems(signal),
  });
}

export function useItem(id: number) {
  return useQuery({
    queryKey: itemKeys.detail(id),
    queryFn: ({ signal }) => getItem(id, signal),
  });
}

// ---------- writing (invalidates the cache) ----------

// Anything that shows a list or statistics is now out of date: mark it stale and
// refetch the ones currently on screen.
function invalidateCollections(client: QueryClient) {
  return Promise.all([
    client.invalidateQueries({ queryKey: itemKeys.lists() }),
    client.invalidateQueries({ queryKey: itemKeys.everything() }),
  ]);
}

export function useCreateItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: ItemInput) => createItem(input),
    onSuccess: (created) => {
      client.setQueryData<Item>(itemKeys.detail(created.id), created);
      return invalidateCollections(client);
    },
  });
}

export function useUpdateItem(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (changes: ItemChanges) => updateItem(id, changes),
    onSuccess: (updated) => {
      // We already have the fresh item from the server: write it straight in.
      client.setQueryData<Item>(itemKeys.detail(id), updated);
      return invalidateCollections(client);
    },
  });
}

export function useDeleteItem(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => deleteItem(id),
    onSuccess: () => {
      client.removeQueries({ queryKey: itemKeys.detail(id) });
      return invalidateCollections(client);
    },
  });
}
