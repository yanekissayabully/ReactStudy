import { DATA_KEY, getApiConfig } from "@/lib/api/settings";
import { seedItems } from "@/lib/api/seed";
import type {
  Item,
  ItemChanges,
  ItemInput,
  ItemsPage,
  ItemsQuery,
} from "@/lib/types";

function readData(): Item[] {
  const raw = localStorage.getItem(DATA_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Item[];
    } catch {}
  }
  writeData(seedItems);
  return seedItems;
}

function writeData(items: Item[]): void {
  localStorage.setItem(DATA_KEY, JSON.stringify(items));
}

function abortError(): DOMException {
  return new DOMException("Request aborted", "AbortError");
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function fakeRequest<T>(operation: () => T, signal?: AbortSignal): Promise<T> {
  const { minDelay, maxDelay, errorChance } = getApiConfig();

  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const delay =
      Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);

      if (Math.random() < errorChance) {
        reject(new Error("Simulated server error. Please try again."));
        return;
      }

      try {
        resolve(operation());
      } catch (error) {
        reject(error);
      }
    }, delay);

    function onAbort() {
      clearTimeout(timer);
      reject(abortError());
    }

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function assertValid(items: Item[], candidate: Partial<Item>, id?: number) {
  if (candidate.name !== undefined && !candidate.name.trim()) {
    throw new Error("Name is required.");
  }
  if (candidate.serialNumber !== undefined) {
    if (!candidate.serialNumber.trim()) {
      throw new Error("Serial number is required.");
    }
    const taken = items.some(
      (item) => item.id !== id && item.serialNumber === candidate.serialNumber,
    );
    if (taken) {
      throw new Error(
        `Serial number ${candidate.serialNumber} is already in use.`,
      );
    }
  }
}

function compare(a: Item, b: Item, sort: ItemsQuery["sort"]): number {
  if (sort === "value") return a.valueUsd - b.valueUsd;
  if (sort === "purchased") return a.purchasedAt.localeCompare(b.purchasedAt);
  return a.name.localeCompare(b.name);
}

export function getItems(
  query: ItemsQuery,
  signal?: AbortSignal,
): Promise<ItemsPage> {
  return fakeRequest(() => {
    const needle = query.search.trim().toLowerCase();

    const matches = readData()
      .filter((item) => query.status === "all" || item.status === query.status)
      .filter(
        (item) => query.category === "all" || item.category === query.category,
      )
      .filter(
        (item) =>
          !needle ||
          [item.name, item.description, item.serialNumber, item.location]
            .join(" ")
            .toLowerCase()
            .includes(needle),
      )
      .sort((a, b) => {
        const result = compare(a, b, query.sort);
        return query.order === "asc" ? result : -result;
      });

    const totalPages = Math.max(1, Math.ceil(matches.length / query.pageSize));
    const page = Math.min(Math.max(1, query.page), totalPages);
    const start = (page - 1) * query.pageSize;

    return {
      items: matches.slice(start, start + query.pageSize),
      total: matches.length,
      page,
      pageSize: query.pageSize,
      totalPages,
    };
  }, signal);
}

export function getAllItems(signal?: AbortSignal): Promise<Item[]> {
  return fakeRequest(() => readData(), signal);
}

export function getItem(
  id: number,
  signal?: AbortSignal,
): Promise<Item | null> {
  return fakeRequest(
    () => readData().find((item) => item.id === id) ?? null,
    signal,
  );
}

export function createItem(input: ItemInput): Promise<Item> {
  return fakeRequest(() => {
    const items = readData();
    assertValid(items, input);

    const created: Item = {
      ...input,
      id: items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1,
      status: "available",
      assignedTo: null,
    };
    writeData([...items, created]);
    return created;
  });
}

export function updateItem(id: number, changes: ItemChanges): Promise<Item> {
  return fakeRequest(() => {
    const items = readData();
    const current = items.find((item) => item.id === id);
    if (!current) throw new Error("Item not found. It may have been removed.");
    assertValid(items, changes, id);

    const updated: Item = { ...current, ...changes, id };
    writeData(items.map((item) => (item.id === id ? updated : item)));
    return updated;
  });
}

export function deleteItem(id: number): Promise<{ id: number }> {
  return fakeRequest(() => {
    const items = readData();
    if (!items.some((item) => item.id === id)) {
      throw new Error("Item not found. It may have been removed.");
    }
    writeData(items.filter((item) => item.id !== id));
    return { id };
  });
}
