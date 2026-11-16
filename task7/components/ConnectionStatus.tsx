"use client";

import { useOnline } from "@/lib/connectivity";
import styles from "@/styles/Pwa.module.css";

// Small online/offline pill, always visible in the header.
export default function ConnectionStatus() {
  const online = useOnline();
  return (
    <span
      className={`${styles.pill} ${online ? styles.online : styles.offline}`}
      role="status"
      aria-live="polite"
    >
      <span className={styles.dot} aria-hidden="true" />
      {online ? "Online" : "Offline"}
    </span>
  );
}
