import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/Home.module.css";

const TOUR = [
  {
    href: "/items",
    title: "Browse equipment",
    text: "Search, filter, sort and page through every item. The URL remembers your filters.",
  },
  {
    href: "/dashboard",
    title: "See the dashboard",
    text: "Totals, breakdowns by status and category, and the most valuable gear.",
  },
  {
    href: "/about",
    title: "How it works",
    text: "The routes, the layouts and the lazy loading behind this app.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <h1 className={styles.title}>Know where every tool in the lab is.</h1>
          <p className={styles.lead}>
            Lab Inventory tracks equipment, who has borrowed it and when it
            needs service. Every screen has its own URL, so you can bookmark,
            share and refresh any page.
          </p>
          <div className="btnRow">
            <Link href="/items" className="btn btnPrimary">
              Open the inventory
            </Link>
            <Link href="/dashboard" className="btn">
              View dashboard
            </Link>
          </div>
        </div>

        <Image
          src="/lab.svg"
          alt="Illustration of a lab bench with an oscilloscope and a 3D printer"
          width={480}
          height={320}
          unoptimized
          priority
          className={styles.image}
        />
      </section>

      <ul className={styles.tour}>
        {TOUR.map((card) => (
          <li key={card.href}>
            <Link href={card.href} className={`${styles.card} panel`}>
              <h2 className={styles.cardTitle}>{card.title} →</h2>
              <p>{card.text}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
