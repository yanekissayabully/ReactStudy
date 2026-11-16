import { DATA_KEY, getApiConfig } from "@/lib/api/settings";
import { fetchCatalog } from "@/lib/api/catalog";
import type {
  Item,
  ItemChanges,
  ItemInput,
  ItemsPage,
  ItemsQuery,
} from "@/lib/types";

// Data model: the public catalog comes from the HTTP API (cacheable by the
// service worker); the user's own changes are an overlay stored in localStorage.
// edits[id] = full replacement item, or null when the item was deleted.
type Edits = Record<number, Item | null>;

function readEdits(): Edits {
  try {
    return JSON.parse(localStorage.getItem(DATA_KEY) ?? "{}") as Edits;
  } catch {
    return {};
  }
}

function writeEdits(edits: Edits): void {
  localStorage.setItem(DATA_KEY, JSON.stringify(edits));
}

async function readData(): Promise<Item[]> {
  const base = await fetchCatalog();
  const edits = readEdits();
  const merged = new Map<number, Item>(base.map((item) => [item.id, item]));
  for (const [id, value] of Object.entries(edits)) {
    if (value === null) merged.delete(Number(id));
    else merged.set(Number(id), value);
  }
  return [...merged.values()].sort((a, b) => a.id - b.id);
}

function saveItem(item: Item): void {
  writeEdits({ ...readEdits(), [item.id]: item });
}

function nextId(items: Item[]): number {
  const used = [...items.map((i) => i.id), ...Object.keys(readEdits()).map(Number)];
  return used.length > 0 ? Math.max(...used) + 1 : 1;
}

function abortError(): DOMException {
  return new DOMException("Request aborted", "AbortError");
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function fakeRequest<T>(operation: () => T | Promise<T>, signal?: AbortSignal): Promise<T> {
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

      Promise.resolve()
        .then(operation)
        .then(resolve, reject);
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
  return fakeRequest(async () => {
    const needle = query.search.trim().toLowerCase();

    const matches = (await readData())
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
    async () => (await readData()).find((item) => item.id === id) ?? null,
    signal,
  );
}

export function createItem(input: ItemInput): Promise<Item> {
  return fakeRequest(async () => {
    const items = await readData();
    assertValid(items, input);

    const created: Item = {
      ...input,
      id: nextId(items),
      status: "available",
      assignedTo: null,
    };
    saveItem(created);
    return created;
  });
}

export function updateItem(id: number, changes: ItemChanges): Promise<Item> {
  return fakeRequest(async () => {
    const items = await readData();
    const current = items.find((item) => item.id === id);
    if (!current) throw new Error("Item not found. It may have been removed.");
    assertValid(items, changes, id);

    const updated: Item = { ...current, ...changes, id };
    saveItem(updated);
    return updated;
  });
}

export function deleteItem(id: number): Promise<{ id: number }> {
  return fakeRequest(async () => {
    const items = await readData();
    if (!items.some((item) => item.id === id)) {
      throw new Error("Item not found. It may have been removed.");
    }
    writeEdits({ ...readEdits(), [id]: null });
    return { id };
  });
}
