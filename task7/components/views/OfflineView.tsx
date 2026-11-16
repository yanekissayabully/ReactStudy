"use client";

import Link from "next/link";
import { useState } from "react";
import { useOnline } from "@/lib/connectivity";
import styles from "@/styles/Pwa.module.css";

export default function OfflineView() {
  const online = useOnline();
  const [checking, setChecking] = useState(false);
  const [failed, setFailed] = useState(false);

  // navigator.onLine can be wrong, so "Retry" makes a real request to the server.
  async function retry() {
    setChecking(true);
    setFailed(false);
    try {
      const response = await fetch(`/manifest.json?ping=${Date.now()}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("bad response");
      // Back to where the user came from (or home).
      const from = document.referrer;
      const ok = from.startsWith(window.location.origin) && !from.endsWith("/offline");
      window.location.assign(ok ? from : "/");
    } catch {
      setFailed(true);
      setChecking(false);
    }
  }

  return (
    <div className={`${styles.offlinePage} panel`}>
      <div className={styles.offlineIcon} aria-hidden="true">
        📡
      </div>
      <h1 className={styles.offlineTitle}>You are offline</h1>
      <p className={styles.offlineText}>
        This page could not be loaded without an internet connection. Pages and
        equipment data you opened before are still available.
      </p>
      <div className="btnRow" style={{ justifyContent: "center" }}>
        <button type="button" className="btn btnPrimary" onClick={retry} disabled={checking}>
          {checking ? "Checking…" : "Retry connection"}
        </button>
        <Link href="/items" className="btn">
          Saved equipment
        </Link>
      </div>
      {(failed || !online) && (
        <p className={styles.offlineText} style={{ marginTop: 16, marginBottom: 0 }} role="status">
          Still no connection.
        </p>
      )}
    </div>
  );
}
