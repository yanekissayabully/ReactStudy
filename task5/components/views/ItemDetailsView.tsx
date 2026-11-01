"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import ItemActions from "@/components/ItemActions";
import StateMessage from "@/components/StateMessage";
import StatusBadge from "@/components/StatusBadge";
import StatusControls from "@/components/StatusControls";
import { useAsync } from "@/hooks/useAsync";
import { formatDate, formatMoney, messageOf } from "@/lib/items";
import { statusChanges, type StatusAction } from "@/lib/status";
import { deleteItem, getItem, updateItem } from "@/services/service";
import styles from "@/styles/ItemDetailsView.module.css";

export default function ItemDetailsView() {
  const params = useParams<{ id: string }>();

  if (!/^[1-9]\d*$/.test(params.id)) notFound();

  return <LoadedItem id={Number(params.id)} />;
}

function LoadedItem({ id }: { id: number }) {
  const router = useRouter();
  const load = useCallback((signal: AbortSignal) => getItem(id, signal), [id]);
  const { status, data: item, error, reload, mutate } = useAsync(load);

  const [busy, setBusy] = useState<"status" | "remove" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/items");
  }

  async function handleStatus(action: StatusAction) {
    setBusy("status");
    setActionError(null);
    try {
      mutate(await updateItem(id, statusChanges(action)));
    } catch (e) {
      setActionError(messageOf(e));
    } finally {
      setBusy(null);
    }
  }

  async function handleRemove() {
    setBusy("remove");
    setActionError(null);
    try {
      await deleteItem(id);
      router.push("/items");
    } catch (e) {
      setActionError(messageOf(e));
      setBusy(null);
    }
  }

  const nav = (
    <div className={styles.nav}>
      <button type="button" className="btn" onClick={goBack}>
        ← Back
      </button>
      <Link href="/items" className="btn">
        All equipment
      </Link>
    </div>
  );

  if (status === "loading") {
    return (
      <>
        {nav}
        <div
          className={`${styles.skeletons} panel`}
          aria-busy="true"
          aria-label="Loading details"
        >
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      </>
    );
  }

  if (status === "error") {
    return (
      <>
        {nav}
        <StateMessage
          tone="error"
          title="Could not load this item"
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

  if (!item) {
    return (
      <>
        {nav}
        <MissingItem id={id} />
      </>
    );
  }

  return (
    <>
      {nav}

      <article className={`${styles.details} panel`}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.name}>{item.name}</h1>
            <StatusBadge status={item.status} />
          </div>
          <p className={styles.description}>{item.description}</p>
        </header>

        <dl className={styles.fields}>
          <Field label="Category" value={item.category} />
          <Field label="Serial number" value={item.serialNumber} />
          <Field label="Location" value={item.location} />
          <Field label="Assigned to" value={item.assignedTo ?? "Nobody"} />
          <Field label="Purchased" value={formatDate(item.purchasedAt)} />
          <Field label="Last serviced" value={formatDate(item.lastServiceAt)} />
          <Field label="Value" value={formatMoney(item.valueUsd)} />
          <Field label="Notes" value={item.notes || "—"} wide />
        </dl>

        <section className={styles.section} aria-label="Status">
          <h2 className={styles.sectionTitle}>Status</h2>
          <StatusControls
            key={item.status}
            item={item}
            disabled={busy !== null}
            updating={busy === "status"}
            onAction={handleStatus}
          />
        </section>

        {actionError && (
          <p className={styles.error} role="alert">
            {actionError}
          </p>
        )}

        <footer className={styles.footer}>
          <Link href={`/items/${item.id}/edit`} className="btn">
            Edit
          </Link>
          <ItemActions
            disabled={busy !== null}
            removing={busy === "remove"}
            onRemove={handleRemove}
          />
        </footer>
      </article>
    </>
  );
}

function MissingItem({ id }: { id: number }) {
  return (
    <StateMessage
      title={`No equipment with id ${id}`}
      actions={
        <>
          <Link href="/items" className="btn btnPrimary">
            All equipment
          </Link>
          <Link href="/" className="btn">
            Home
          </Link>
        </>
      }
    >
      It may have been removed, or the link is wrong.
    </StateMessage>
  );
}

function Field({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? styles.fieldWide : styles.field}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value}</dd>
    </div>
  );
}
