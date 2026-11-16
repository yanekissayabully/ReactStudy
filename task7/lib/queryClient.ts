import { QueryClient } from "@tanstack/react-query";

// Cache lifetime settings (see README "Caching strategy"):
//  - staleTime: for 30 s cached data is "fresh" and is shown with NO request.
//  - gcTime:    unused entries stay in memory for 5 min, then are deleted.
//  - After staleTime the data is shown instantly but refetched in the background.
export const STALE_TIME = 30 * 1000;
export const GC_TIME = 5 * 60 * 1000;

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        // The fake API fails on purpose; show the error and let the user press
        // "Try again" instead of silently retrying in the background.
        retry: false,
        networkMode: "always", // run queryFn offline so the service worker can answer
        refetchOnWindowFocus: true,
      },
      mutations: { networkMode: "always" },
    },
  });
}
