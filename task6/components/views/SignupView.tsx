"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import GoogleButton from "@/components/GoogleButton";
import { useAuth } from "@/context/AuthContext";
import { useRedirectIfAuthed } from "@/hooks/useRedirectIfAuthed";
import styles from "@/styles/Login.module.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  email?: string;
  password?: string;
  confirm?: string;
}

function validate(email: string, password: string, confirm: string) {
  const errors: FieldErrors = {};
  if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
  if (password.length < 6)
    errors.password = "Password must be at least 6 characters.";
  if (confirm !== password) errors.confirm = "Passwords do not match.";
  return errors;
}

export default function SignupView() {
  const { signup, loginWithGoogle, error, clearError, loading, user } =
    useAuth();
  const { next } = useRedirectIfAuthed();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => clearError, [clearError]);

  async function submit(action: () => Promise<boolean>) {
    setBusy(true);
    await action();
    setBusy(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(email.trim(), password, confirm);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    void submit(() => signup(email.trim(), password));
  }

  const disabled = busy || loading || user !== null;

  return (
    <div className={styles.wrap}>
      <form
        className={`${styles.form} panel`}
        onSubmit={handleSubmit}
        noValidate
      >
        <h1 className={styles.title}>Sign up</h1>
        <p className={styles.lead}>Create an account to manage equipment.</p>

        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            aria-invalid={Boolean(errors.email)}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            aria-invalid={Boolean(errors.password)}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <span className={styles.fieldError}>{errors.password}</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Confirm password</span>
          <input
            type="password"
            name="confirm"
            autoComplete="new-password"
            value={confirm}
            aria-invalid={Boolean(errors.confirm)}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {errors.confirm && (
            <span className={styles.fieldError}>{errors.confirm}</span>
          )}
        </label>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btnPrimary" disabled={disabled}>
          {busy ? "Creating account…" : "Sign up"}
        </button>

        <p className={styles.divider}>or</p>

        <GoogleButton
          disabled={disabled}
          onClick={() => void submit(loginWithGoogle)}
        />

        <p className={styles.footer}>
          Already registered?{" "}
          <Link
            href={next === "/profile" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
