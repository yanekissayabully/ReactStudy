import styles from "@/styles/PageFallback.module.css";

export default function PageFallback() {
  return (
    <div className={styles.fallback} aria-busy="true" role="status">
      <div className={`${styles.bar} ${styles.title}`} />
      <div className={styles.bar} />
      <div className={styles.bar} />
      <span className="visuallyHidden">Loading page…</span>
    </div>
  );
}
