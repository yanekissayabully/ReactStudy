import { setFromCache } from "@/lib/connectivity";
import type { Item } from "@/lib/types";

// Real HTTP request to the public API. The service worker sits in between:
// when the network fails it answers from cache and adds `x-sw-cache: hit`.
export async function fetchCatalog(): Promise<Item[]> {
  let response: Response;
  try {
    response = await fetch("/api/items");
  } catch {
    throw new Error(
      "You are offline and this data has not been saved yet. Reconnect and try again.",
    );
  }
  if (!response.ok) {
    throw new Error(`Server error (${response.status}). Please try again.`);
  }
  setFromCache(response.headers.get("x-sw-cache") === "hit");
  return (await response.json()) as Item[];
}
