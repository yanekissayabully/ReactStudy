import {
  CATEGORIES,
  STATUSES,
  type Category,
  type Item,
  type Status,
} from "./types";

export interface Filters {
  category: Category | "all";
  status: Status | "all";
}

export interface Breakdown<K extends string> {
  key: K;
  count: number;
  valueUsd: number;
}

export interface Stats {
  total: number;
  totalValue: number;
  averageValue: number;
  availablePercent: number;
  needsService: number;
  byStatus: Breakdown<Status>[];
  byCategory: Breakdown<Category>[];
  topByValue: Item[];
}

const SERVICE_INTERVAL_DAYS = 365;

export function applyFilters(items: Item[], filters: Filters): Item[] {
  return items.filter(
    (item) =>
      (filters.category === "all" || item.category === filters.category) &&
      (filters.status === "all" || item.status === filters.status),
  );
}

export function needsService(item: Item, today: Date): boolean {
  if (!item.lastServiceAt) return true;
  const last = new Date(item.lastServiceAt).getTime();
  const days = (today.getTime() - last) / 86_400_000;
  return days > SERVICE_INTERVAL_DAYS;
}

function breakdown<K extends string>(
  keys: readonly K[],
  items: Item[],
  keyOf: (item: Item) => K,
): Breakdown<K>[] {
  return keys.map((key) => {
    const group = items.filter((item) => keyOf(item) === key);
    return {
      key,
      count: group.length,
      valueUsd: group.reduce((sum, item) => sum + item.valueUsd, 0),
    };
  });
}

export function computeStats(items: Item[], today: Date): Stats {
  const totalValue = items.reduce((sum, item) => sum + item.valueUsd, 0);
  const available = items.filter((item) => item.status === "available").length;

  return {
    total: items.length,
    totalValue,
    averageValue: items.length ? totalValue / items.length : 0,
    availablePercent: items.length ? (available / items.length) * 100 : 0,
    needsService: items.filter((item) => needsService(item, today)).length,
    byStatus: breakdown(STATUSES, items, (item) => item.status),
    byCategory: breakdown(CATEGORIES, items, (item) => item.category),
    topByValue: [...items].sort((a, b) => b.valueUsd - a.valueUsd).slice(0, 5),
  };
}
