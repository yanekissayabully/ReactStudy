"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import ItemForm, { EMPTY_INPUT } from "@/components/ItemForm";
import StateMessage from "@/components/StateMessage";
import {
  useCreateItem,
  useItem,
  useUpdateItem,
} from "@/hooks/useItemsApi";
import { messageOf, toInput } from "@/lib/items";
import type { ItemInput } from "@/lib/types";

export function NewItemView() {
  const router = useRouter();
  const create = useCreateItem();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(input: ItemInput) {
    setSaving(true);
    setError(null);
    try {
      const created = await create.mutateAsync(input);
      router.push(`/items/${created.id}`);
    } catch (e) {
      setError(messageOf(e));
      setSaving(false);
    }
  }

  return (
    <FormShell title="Add equipment" error={error}>
      <ItemForm
        title="New item"
        submitLabel="Create"
        initial={EMPTY_INPUT}
        saving={saving}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/items")}
      />
    </FormShell>
  );
}

export function EditItemView() {
  const params = useParams<{ id: string }>();
  if (!/^[1-9]\d*$/.test(params.id)) notFound();
  return <EditLoaded id={Number(params.id)} />;
}

function EditLoaded({ id }: { id: number }) {
  const router = useRouter();
  const {
    data: item,
    error: loadError,
    isPending,
    isError,
    refetch,
  } = useItem(id);
  const update = useUpdateItem(id);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(input: ItemInput) {
    setSaving(true);
    setError(null);
    try {
      await update.mutateAsync(input);
      router.push(`/items/${id}`);
    } catch (e) {
      setError(messageOf(e));
      setSaving(false);
    }
  }

  if (isPending) {
    return (
      <FormShell title="Edit equipment" error={null}>
        <p style={{ padding: 20 }} aria-busy="true">
          Loading…
        </p>
      </FormShell>
    );
  }

  if (isError) {
    return (
      <StateMessage
        tone="error"
        title="Could not load this item"
        actions={
          <button type="button" className="btn" onClick={() => void refetch()}>
            Try again
          </button>
        }
      >
        {loadError.message}
      </StateMessage>
    );
  }

  if (!item) {
    return (
      <StateMessage
        title={`No equipment with id ${id}`}
        actions={
          <Link href="/items" className="btn btnPrimary">
            All equipment
          </Link>
        }
      >
        There is nothing to edit.
      </StateMessage>
    );
  }

  return (
    <FormShell title="Edit equipment" error={error}>
      <ItemForm
        title={item.name}
        submitLabel="Save changes"
        initial={toInput(item)}
        saving={saving}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/items/${id}`)}
      />
    </FormShell>
  );
}

function FormShell({
  title,
  error,
  children,
}: {
  title: string;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="pageHeader">
        <h1 className="pageTitle">{title}</h1>
      </div>
      <div className="panel" style={{ maxWidth: 720 }}>
        {children}
        {error && (
          <p
            role="alert"
            style={{
              margin: "0 16px 16px",
              padding: "10px 12px",
              borderRadius: "var(--radius)",
              background: "var(--danger-soft)",
              color: "var(--danger)",
            }}
          >
            {error}
          </p>
        )}
      </div>
    </>
  );
}
