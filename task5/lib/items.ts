import type { Item, ItemInput } from "./types";

export function toInput(item: Item): ItemInput {
  const { name, description, category, serialNumber, location, purchasedAt } =
    item;
  const { lastServiceAt, valueUsd, notes } = item;
  return {
    name,
    description,
    category,
    serialNumber,
    location,
    purchasedAt,
    lastServiceAt,
    valueUsd,
    notes,
  };
}

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatMoney(value: number): string {
  return money.format(value);
}

export function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
