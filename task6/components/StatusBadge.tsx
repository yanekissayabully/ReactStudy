import type { Status } from "@/lib/types";
import styles from "@/styles/StatusBadge.module.css";

const LABELS: Record<Status, string> = {
  available: "Available",
  "checked-out": "Checked out",
  maintenance: "In maintenance",
};

export function statusLabel(status: Status): string {
  return LABELS[status];
}

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {LABELS[status]}
    </span>
  );
}
