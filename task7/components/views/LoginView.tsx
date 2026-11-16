"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import GoogleButton from "@/components/GoogleButton";
import { useAuth } from "@/context/AuthContext";
import { useRedirectIfAuthed } from "@/hooks/useRedirectIfAuthed";
import styles from "@/styles/Login.module.css";

export default function LoginView() {
  const { login, loginWithGoogle, error, clearError, loading, user } =
    useAuth();
  const { next } = useRedirectIfAuthed();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Do not show an old error from another page.
  useEffect(() => clearError, [clearError]);

  async function submit(action: () => Promise<boolean>) {
    setBusy(true);
    await action();
    setBusy(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(() => login(email.trim(), password));
  }

  const disabled = busy || loading || user !== null;

  return (
    <div className={styles.wrap}>
      <form
        className={`${styles.form} panel`}
        onSubmit={handleSubmit}
        noValidate
      >
        <h1 className={styles.title}>Log in</h1>
        <p className={styles.lead}>Sign in to manage equipment.</p>

        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btnPrimary" disabled={disabled}>
          {busy ? "Signing in…" : "Log in"}
        </button>

        <p className={styles.divider}>or</p>

        <GoogleButton
          disabled={disabled}
          onClick={() => void submit(loginWithGoogle)}
        />

        <p className={styles.footer}>
          No account?{" "}
          <Link
            href={next === "/profile" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`}
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
