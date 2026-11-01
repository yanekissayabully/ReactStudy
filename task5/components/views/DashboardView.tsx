"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import StateMessage from "@/components/StateMessage";
import StatusBadge, { statusLabel } from "@/components/StatusBadge";
import { useAsync } from "@/hooks/useAsync";
import { formatMoney } from "@/lib/items";
import {
  applyFilters,
  computeStats,
  type Breakdown,
  type Filters,
} from "@/lib/stats";
import { CATEGORIES, STATUSES, type Category, type Status } from "@/lib/types";
import { getAllItems } from "@/services/service";
import styles from "@/styles/DashboardView.module.css";

export default function DashboardView() {
  const load = useCallback((signal: AbortSignal) => getAllItems(signal), []);
  const { status, data, error, reload } = useAsync(load);

  const [filters, setFilters] = useState<Filters>({
    category: "all",
    status: "all",
  });

  const [today] = useState(() => new Date());

  const stats = useMemo(
    () => (data ? computeStats(applyFilters(data, filters), today) : null),
    [data, filters, today],
  );

  const header = (
    <div className="pageHeader">
      <div>
        <h1 className="pageTitle">Dashboard</h1>
        <p className="pageLead">Statistics calculated from the live API data.</p>
      </div>
      <button type="button" className="btn" onClick={reload}>
        Refresh
      </button>
    </div>
  );

  if (status === "error") {
    return (
      <>
        {header}
        <StateMessage
          tone="error"
          title="Could not load statistics"
          actions={
            <button type="button" className="btn" onClick={reload}>
              Try again
            </button>
          }
        >
          {error}
        </StateMessage>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        {header}
        <div className={styles.tiles} aria-busy="true" aria-label="Loading">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      </>
    );
  }

  return (
    <div aria-busy={status === "loading"}>
      {header}

      <form
        className={`${styles.filters} panel`}
        onSubmit={(e) => e.preventDefault()}
      >
        <label className={styles.field}>
          <span className={styles.label}>Category</span>
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({
                ...filters,
                category: e.target.value as Category | "all",
              })
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

        <fieldset className={styles.chips}>
          <legend className={styles.label}>Status</legend>
          {(["all", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`${styles.chip} ${filters.status === s ? styles.chipOn : ""}`}
              aria-pressed={filters.status === s}
              onClick={() => setFilters({ ...filters, status: s })}
            >
              {s === "all" ? "All" : statusLabel(s)}
            </button>
          ))}
        </fieldset>
      </form>

      {stats.total === 0 ? (
        <StateMessage
          title="No equipment matches these filters"
          actions={
            <button
              type="button"
              className="btn"
              onClick={() => setFilters({ category: "all", status: "all" })}
            >
              Clear filters
            </button>
          }
        >
          The statistics are empty because nothing is selected.
        </StateMessage>
      ) : (
        <>
          <div className={styles.tiles}>
            <Tile label="Items" value={String(stats.total)} />
            <Tile label="Total value" value={formatMoney(stats.totalValue)} />
            <Tile
              label="Average value"
              value={formatMoney(stats.averageValue)}
            />
            <Tile
              label="Available"
              value={`${Math.round(stats.availablePercent)}%`}
            />
            <Tile
              label="Need service"
              value={String(stats.needsService)}
              hint="Not serviced for over a year"
              warn={stats.needsService > 0}
            />
          </div>

          <div className={styles.columns}>
            <section className={`${styles.card} panel`}>
              <h2 className={styles.cardTitle}>By status</h2>
              <BreakdownList
                rows={stats.byStatus}
                total={stats.total}
                label={(key) => statusLabel(key as Status)}
                href={(key) => `/items?status=${key}`}
              />
            </section>

            <section className={`${styles.card} panel`}>
              <h2 className={styles.cardTitle}>By category</h2>
              <BreakdownList
                rows={stats.byCategory}
                total={stats.total}
                label={(key) => key}
                href={(key) => `/items?category=${key}`}
              />
            </section>
          </div>

          <section className={`${styles.card} panel`}>
            <h2 className={styles.cardTitle}>Most valuable equipment</h2>
            <ol className={styles.top}>
              {stats.topByValue.map((item) => (
                <li key={item.id}>
                  <Link href={`/items/${item.id}`}>{item.name}</Link>
                  <StatusBadge status={item.status} />
                  <span className={styles.topValue}>
                    {formatMoney(item.valueUsd)}
                  </span>
                </li>
              ))}
            </ol>
            <Link href="/items" className={styles.more}>
              Browse all equipment →
            </Link>
          </section>
        </>
      )}
    </div>
  );
}

function Tile({
  label,
  value,
  hint,
  warn = false,
}: {
  label: string;
  value: string;
  hint?: string;
  warn?: boolean;
}) {
  return (
    <div className={`${styles.tile} panel ${warn ? styles.warn : ""}`}>
      <p className={styles.tileLabel}>{label}</p>
      <p className={styles.tileValue}>{value}</p>
      {hint && <p className={styles.tileHint}>{hint}</p>}
    </div>
  );
}

function BreakdownList({
  rows,
  total,
  label,
  href,
}: {
  rows: Breakdown<string>[];
  total: number;
  label: (key: string) => string;
  href: (key: string) => string;
}) {
  return (
    <ul className={styles.rows}>
      {rows.map((row) => (
        <li key={row.key}>
          <div className={styles.rowTop}>
            <Link href={href(row.key)}>{label(row.key)}</Link>
            <span>
              {row.count} · {formatMoney(row.valueUsd)}
            </span>
          </div>
          <div className={styles.bar} aria-hidden="true">
            <div
              className={styles.barFill}
              style={{ width: `${(row.count / total) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
