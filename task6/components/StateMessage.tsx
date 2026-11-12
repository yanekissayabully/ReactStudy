import type { ReactNode } from "react";
import styles from "@/styles/StateMessage.module.css";

interface StateMessageProps {
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  tone?: "neutral" | "error";
}

export default function StateMessage({
  title,
  children,
  actions,
  tone = "neutral",
}: StateMessageProps) {
  return (
    <div
      className={`${styles.message} panel`}
      role={tone === "error" ? "alert" : undefined}
    >
      <p className={styles.title}>{title}</p>
      {children && <p className={styles.text}>{children}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
