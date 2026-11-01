"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/NavBar.module.css";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/items", label: "Equipment" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main">
        <Link href="/" className={styles.brand}>
          Lab Inventory
        </Link>

        <ul className={styles.links}>
          {LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`${styles.link} ${isActive(pathname, href) ? styles.active : ""}`}
                aria-current={isActive(pathname, href) ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/login"
          className={`${styles.login} ${pathname === "/login" ? styles.active : ""}`}
        >
          Log in
        </Link>
      </nav>
    </header>
  );
}
