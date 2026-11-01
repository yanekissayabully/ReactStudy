"use client";

import Link from "next/link";
import { useCallback } from "react";
import ItemCard from "@/components/ItemCard";
import ItemsToolbar from "@/components/ItemsToolbar";
import Pagination from "@/components/Pagination";
import StateMessage from "@/components/StateMessage";
import { useAsync, type AsyncStatus } from "@/hooks/useAsync";
import { DEFAULT_QUERY, useItemsQuery } from "@/hooks/useItemsQuery";
import type { ItemsPage } from "@/lib/types";
import { getItems } from "@/services/service";
import styles from "@/styles/ItemsView.module.css";

export default function ItemsView() {
  const { query, update, isFiltered } = useItemsQuery();

  const load = useCallback(
    (signal: AbortSignal) => getItems(query, signal),
    [query],
  );
  const { status, data, error, reload } = useAsync(load);

  const reset = () =>
    update({
      search: DEFAULT_QUERY.search,
      status: DEFAULT_QUERY.status,
      category: DEFAULT_QUERY.category,
    });

  return (
    <>
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Equipment</h1>
          <p className="pageLead">
            Search, filter and sort. Everything you set is saved in the URL.
          </p>
        </div>
        <Link href="/items/new" className="btn btnPrimary">
          + Add equipment
        </Link>
      </div>

      <ItemsToolbar
        query={query}
        isFiltered={isFiltered}
        onChange={update}
        onReset={reset}
      />

      <Results
        status={status}
        data={data}
        error={error}
        isFiltered={isFiltered}
        onRetry={reload}
        onReset={reset}
        onPage={(page) => update({ page })}
      />
    </>
  );
}

type ResultsProps = {
  status: AsyncStatus;
  data: ItemsPage | null;
  error: string | null;
  isFiltered: boolean;
  onRetry: () => void;
  onReset: () => void;
  onPage: (page: number) => void;
};

function Results({
  status,
  data,
  error,
  isFiltered,
  onRetry,
  onReset,
  onPage,
}: ResultsProps) {
  if (status === "error") {
    return (
      <StateMessage
        tone="error"
        title="Could not load the equipment"
        actions={
          <button type="button" className="btn" onClick={onRetry}>
            Try again
          </button>
        }
      >
        {error}
      </StateMessage>
    );
  }

  if (!data) {
    return (
      <ul className={styles.grid} aria-busy="true" aria-label="Loading items">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className={styles.skeleton} />
        ))}
      </ul>
    );
  }

  if (data.total === 0) {
    return (
      <StateMessage
        title={isFiltered ? "Nothing matches these filters" : "No equipment yet"}
        actions={
          isFiltered ? (
            <button type="button" className="btn" onClick={onReset}>
              Clear filters
            </button>
          ) : (
            <Link href="/items/new" className="btn btnPrimary">
              Add the first item
            </Link>
          )
        }
      >
        {isFiltered
          ? "Try a different search or remove a filter."
          : "The inventory is empty."}
      </StateMessage>
    );
  }

  const first = (data.page - 1) * data.pageSize + 1;
  const last = first + data.items.length - 1;

  return (
    <>
      <p className={styles.count} aria-live="polite">
        Showing {first}–{last} of {data.total}
      </p>

      <ul
        className={`${styles.grid} ${status === "loading" ? styles.refreshing : ""}`}
        aria-busy={status === "loading"}
      >
        {data.items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </ul>

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        onChange={onPage}
      />
    </>
  );
}
