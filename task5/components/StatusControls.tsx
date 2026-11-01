"use client";

import { useState } from "react";
import type { StatusAction } from "@/lib/status";
import type { Item } from "@/lib/types";
import styles from "@/styles/StatusControls.module.css";

interface StatusControlsProps {
  item: Item;
  disabled: boolean;
  updating: boolean;
  onAction: (action: StatusAction) => void;
}

export default function StatusControls({
  item,
  disabled,
  updating,
  onAction,
}: StatusControlsProps) {
  const [borrower, setBorrower] = useState("");

  return (
    <div className={styles.controls} aria-busy={updating}>
      {item.status === "available" && (
        <>
          <label className={styles.borrower}>
            <span className={styles.label}>Borrower</span>
            <input
              value={borrower}
              maxLength={60}
              placeholder="Who is taking it?"
              onChange={(e) => setBorrower(e.target.value)}
            />
          </label>
          <button
            type="button"
            className={styles.primary}
            disabled={disabled || !borrower.trim()}
            onClick={() =>
              onAction({ type: "check-out", borrower: borrower.trim() })
            }
          >
            Check out
          </button>
          <button
            type="button"
            className={styles.secondary}
            disabled={disabled}
            onClick={() => onAction({ type: "send-to-maintenance" })}
          >
            Send to maintenance
          </button>
        </>
      )}

      {item.status === "checked-out" && (
        <>
          <p className={styles.note}>
            Checked out to <strong>{item.assignedTo}</strong>.
          </p>
          <button
            type="button"
            className={styles.primary}
            disabled={disabled}
            onClick={() => onAction({ type: "return" })}
          >
            Mark as returned
          </button>
        </>
      )}

      {item.status === "maintenance" && (
        <>
          <p className={styles.note}>
            Out of service until maintenance is done.
          </p>
          <button
            type="button"
            className={styles.primary}
            disabled={disabled}
            onClick={() => onAction({ type: "finish-maintenance" })}
          >
            Complete maintenance
          </button>
        </>
      )}

      {updating && <span className={styles.updating}>Updating…</span>}
    </div>
  );
}
