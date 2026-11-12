import Link from "next/link";
import { formatMoney } from "@/lib/items";
import type { Item } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import styles from "@/styles/ItemCard.module.css";

export default function ItemCard({ item }: { item: Item }) {
  return (
    <li>
      <Link href={`/items/${item.id}`} className={`${styles.card} panel`}>
        <div className={styles.top}>
          <span className={styles.category}>{item.category}</span>
          <StatusBadge status={item.status} />
        </div>
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.description}>{item.description}</p>
        <dl className={styles.meta}>
          <div>
            <dt>Location</dt>
            <dd>{item.location}</dd>
          </div>
          <div>
            <dt>Value</dt>
            <dd>{formatMoney(item.valueUsd)}</dd>
          </div>
        </dl>
      </Link>
    </li>
  );
}
