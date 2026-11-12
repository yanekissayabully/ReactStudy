"use client";

import { useState, type FormEvent } from "react";
import { CATEGORIES, type Category, type ItemInput } from "@/lib/types";
import styles from "@/styles/ItemForm.module.css";

interface ItemFormProps {
  title: string;
  submitLabel: string;
  initial: ItemInput;
  saving: boolean;
  onSubmit: (input: ItemInput) => void;
  onCancel: () => void;
}

export const EMPTY_INPUT: ItemInput = {
  name: "",
  description: "",
  category: CATEGORIES[0],
  serialNumber: "",
  location: "",
  purchasedAt: "",
  lastServiceAt: null,
  valueUsd: 0,
  notes: "",
};

export default function ItemForm({
  title,
  submitLabel,
  initial,
  saving,
  onSubmit,
  onCancel,
}: ItemFormProps) {
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [category, setCategory] = useState<Category>(initial.category);
  const [serialNumber, setSerialNumber] = useState(initial.serialNumber);
  const [location, setLocation] = useState(initial.location);
  const [purchasedAt, setPurchasedAt] = useState(initial.purchasedAt);
  const [lastServiceAt, setLastServiceAt] = useState(
    initial.lastServiceAt ?? "",
  );
  const [valueUsd, setValueUsd] = useState(String(initial.valueUsd));
  const [notes, setNotes] = useState(initial.notes);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      category,
      serialNumber: serialNumber.trim(),
      location: location.trim(),
      purchasedAt,
      lastServiceAt: lastServiceAt || null,
      valueUsd: Number(valueUsd),
      notes: notes.trim(),
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.title}>{title}</h3>

      <label className={`${styles.field} ${styles.wide}`}>
        <span className={styles.label}>Name</span>
        <input
          required
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className={`${styles.field} ${styles.wide}`}>
        <span className={styles.label}>Description</span>
        <input
          maxLength={160}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Category</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Serial number</span>
        <input
          required
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Location</span>
        <input
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Value (USD)</span>
        <input
          required
          type="number"
          min={0}
          step={1}
          value={valueUsd}
          onChange={(e) => setValueUsd(e.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Purchased</span>
        <input
          required
          type="date"
          value={purchasedAt}
          onChange={(e) => setPurchasedAt(e.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Last serviced (optional)</span>
        <input
          type="date"
          value={lastServiceAt}
          onChange={(e) => setLastServiceAt(e.target.value)}
        />
      </label>

      <label className={`${styles.field} ${styles.wide}`}>
        <span className={styles.label}>Notes</span>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      <div className={`${styles.actions} ${styles.wide}`}>
        <button type="button" className={styles.secondary} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.primary} disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
