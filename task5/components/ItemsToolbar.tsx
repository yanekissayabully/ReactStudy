"use client";

import { useEffect, useState } from "react";
import {
  CATEGORIES,
  STATUSES,
  type ItemsQuery,
  type SortKey,
} from "@/lib/types";
import { statusLabel } from "./StatusBadge";
import styles from "@/styles/ItemsToolbar.module.css";

type Patch = Partial<Omit<ItemsQuery, "pageSize">>;

interface ItemsToolbarProps {
  query: ItemsQuery;
  isFiltered: boolean;
  onChange: (patch: Patch, options?: { replace?: boolean }) => void;
  onReset: () => void;
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "value", label: "Value" },
  { value: "purchased", label: "Purchase date" },
];

export default function ItemsToolbar({
  query,
  isFiltered,
  onChange,
  onReset,
}: ItemsToolbarProps) {
  const [text, setText] = useState(query.search);
  const [seenUrlSearch, setSeenUrlSearch] = useState(query.search);

  const [pushedSearch, setPushedSearch] = useState(query.search);

  if (seenUrlSearch !== query.search) {
    setSeenUrlSearch(query.search);
    if (query.search !== pushedSearch) setText(query.search);
  }

  useEffect(() => {
    if (text === query.search) return;
    const timer = setTimeout(() => {
      setPushedSearch(text);
      onChange({ search: text }, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [text, query.search, onChange]);

  return (
    <form
      className={`${styles.toolbar} panel`}
      role="search"
      onSubmit={(e) => e.preventDefault()}
    >
      <label className={`${styles.field} ${styles.search}`}>
        <span className={styles.label}>Search</span>
        <input
          type="search"
          value={text}
          placeholder="Name, serial number, location…"
          onChange={(e) => setText(e.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Status</span>
        <select
          value={query.status}
          onChange={(e) =>
            onChange({ status: e.target.value as ItemsQuery["status"] })
          }
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Category</span>
        <select
          value={query.category}
          onChange={(e) =>
            onChange({ category: e.target.value as ItemsQuery["category"] })
          }
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Sort by</span>
        <select
          value={query.sort}
          onChange={(e) => onChange({ sort: e.target.value as SortKey })}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="btn"
        aria-label={`Order: ${query.order === "asc" ? "ascending" : "descending"}. Click to reverse.`}
        onClick={() =>
          onChange({ order: query.order === "asc" ? "desc" : "asc" })
        }
      >
        {query.order === "asc" ? "↑ Asc" : "↓ Desc"}
      </button>

      {isFiltered && (
        <button type="button" className="btn" onClick={onReset}>
          Reset
        </button>
      )}
    </form>
  );
}
