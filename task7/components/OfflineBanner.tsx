"use client";

import { useFromCache, useOnline } from "@/lib/connectivity";
import styles from "@/styles/Pwa.module.css";

// Tells the user when the data on screen comes from the cache, not the server.
export default function OfflineBanner() {
  const online = useOnline();
  const fromCache = useFromCache();

  if (online && !fromCache) return null;

  return (
    <div className={styles.banner} role="status">
      {online
        ? "The server could not be reached. You are viewing saved (cached) data."
        : "You are offline. You are viewing saved (cached) data; it will refresh when you reconnect."}
    </div>
  );
}
