export const STATUSES = ["available", "checked-out", "maintenance"] as const;
export type Status = (typeof STATUSES)[number];

export const CATEGORIES = [
  "Electronics",
  "Fabrication",
  "Imaging",
  "Computing",
  "Tools",
] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Item {
  id: number;
  name: string;
  description: string;
  category: Category;
  status: Status;
  serialNumber: string;
  location: string;
  assignedTo: string | null;
  purchasedAt: string;
  lastServiceAt: string | null;
  valueUsd: number;
  notes: string;
}

export type ItemInput = Omit<Item, "id" | "status" | "assignedTo">;

export type ItemChanges = Partial<Omit<Item, "id">>;

export const SORT_KEYS = ["name", "value", "purchased"] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export type SortOrder = "asc" | "desc";

export interface ItemsQuery {
  search: string;
  status: Status | "all";
  category: Category | "all";
  sort: SortKey;
  order: SortOrder;
  page: number;
  pageSize: number;
}

export interface ItemsPage {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
