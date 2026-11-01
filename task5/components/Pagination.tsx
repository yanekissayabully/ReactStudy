import styles from "@/styles/Pagination.module.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className="btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ← Previous
      </button>

      <ul className={styles.pages}>
        {pages.map((n) => (
          <li key={n}>
            <button
              type="button"
              className={`${styles.page} ${n === page ? styles.current : ""}`}
              aria-current={n === page ? "page" : undefined}
              aria-label={`Page ${n}`}
              onClick={() => onChange(n)}
            >
              {n}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="btn"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next →
      </button>
    </nav>
  );
}
