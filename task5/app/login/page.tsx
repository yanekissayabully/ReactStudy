"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import styles from "@/styles/Login.module.css";

export default function LoginPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className={styles.wrap}>
      <form className={`${styles.form} panel`} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Log in</h1>
        <p className={styles.lead}>
          Sign in to manage equipment. Authentication is coming soon.
        </p>

        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input type="email" name="email" autoComplete="email" required />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" className="btn btnPrimary">
          Log in
        </button>

        {submitted && (
          <p className={styles.notice} role="status">
            Login is not implemented yet — you can use the whole app without
            signing in.
          </p>
        )}

        <p className={styles.footer}>
          <Link href="/">← Back to home</Link>
        </p>
      </form>
    </div>
  );
}
