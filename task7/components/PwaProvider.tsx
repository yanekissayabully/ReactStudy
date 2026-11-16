"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/Pwa.module.css";

// Registers the service worker and shows an "update available" bar.
// Flow: new sw.js found -> installs -> waits (it never calls skipWaiting by itself)
// -> user clicks "Update now" -> we post SKIP_WAITING -> new worker activates ->
// "controllerchange" fires -> we reload once so the page uses the new version.
export default function PwaProvider() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // In `next dev` assets are not stable/hashed, so only register in production.
    if (process.env.NODE_ENV !== "production") return;

    let reloading = false;
    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    let registration: ServiceWorkerRegistration | undefined;

    function watch(reg: ServiceWorkerRegistration) {
      // A worker may already be waiting from an earlier visit.
      if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);

      reg.addEventListener("updatefound", () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          // "installed" + an existing controller = an UPDATE, not the first install.
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            setWaiting(installing);
          }
        });
      });
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        registration = reg;
        watch(reg);
      })
      .catch((error) => console.error("Service worker registration failed", error));

    // Look for a new version whenever the user comes back to the tab.
    const checkForUpdate = () => {
      if (document.visibilityState === "visible") {
        void registration?.update().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", checkForUpdate);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", checkForUpdate);
    };
  }, []);

  if (!waiting) return null;

  return (
    <div className={styles.update} role="status">
      <span>A new version of Lab Inventory is available.</span>
      <div className={styles.updateActions}>
        <button
          type="button"
          className="btn btnPrimary"
          onClick={() => waiting.postMessage({ type: "SKIP_WAITING" })}
        >
          Update now
        </button>
        <button type="button" className="btn" onClick={() => setWaiting(null)}>
          Later
        </button>
      </div>
    </div>
  );
}
