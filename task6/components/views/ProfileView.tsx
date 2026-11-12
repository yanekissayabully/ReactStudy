"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/Login.module.css";

export default function ProfileView() {
  const { user, logout, error } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    await logout();
    router.replace("/login");
  }

  if (!user) return null; // ProtectedRoute guarantees a user; this narrows the type.

  return (
    <div className={styles.wrap}>
      <section className={`${styles.form} panel`}>
        <h1 className={styles.title}>Profile</h1>

        <dl className={styles.profile}>
          <div>
            <dt className={styles.label}>Email</dt>
            <dd>{user.email ?? "—"}</dd>
          </div>
          <div>
            <dt className={styles.label}>UID</dt>
            <dd className={styles.mono}>{user.uid}</dd>
          </div>
        </dl>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          className="btn"
          onClick={handleLogout}
          disabled={busy}
        >
          {busy ? "Logging out…" : "Log out"}
        </button>
      </section>
    </div>
  );
}
