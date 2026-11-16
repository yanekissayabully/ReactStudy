"use client";

import styles from "@/styles/Login.module.css";

export default function GoogleButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      className={`btn ${styles.google}`}
      onClick={onClick}
      disabled={disabled}
    >
      Continue with Google
    </button>
  );
}
