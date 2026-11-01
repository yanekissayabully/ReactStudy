"use client";

import { useState } from "react";
import styles from "@/styles/ItemActions.module.css";

interface ItemActionsProps {
  disabled: boolean;
  removing: boolean;
  onRemove: () => void;
}

export default function ItemActions({
  disabled,
  removing,
  onRemove,
}: ItemActionsProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className={styles.actions}>
      {confirming ? (
        <>
          <button
            type="button"
            className={styles.danger}
            onClick={() => {
              setConfirming(false);
              onRemove();
            }}
            disabled={disabled}
          >
            {removing ? "Removing…" : "Confirm remove"}
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => setConfirming(false)}
          >
            Keep
          </button>
        </>
      ) : (
        <button
          type="button"
          className={styles.secondary}
          onClick={() => setConfirming(true)}
          disabled={disabled}
        >
          {removing ? "Removing…" : "Remove"}
        </button>
      )}
    </div>
  );
}
