"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ConnectionStatus from "@/components/ConnectionStatus";
import { useAuth } from "@/context/AuthContext";
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
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await logout();
    router.replace("/login");
  }

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main">
        <Link href="/" className={styles.brand}>
          Lab Inventory
        </Link>

        <ConnectionStatus />

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="main-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.bars} aria-hidden="true" />
        </button>

        <div
          id="main-menu"
          className={`${styles.menu} ${open ? styles.menuOpen : ""}`}
          onClick={(e) => {
            // Any link tap inside the menu closes it.
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
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

        <div className={styles.account} aria-busy={loading}>
          {loading ? null : user ? (
            <>
              <Link
                href="/profile"
                className={`${styles.login} ${pathname === "/profile" ? styles.active : ""}`}
              >
                Profile
              </Link>
              <button
                type="button"
                className={`${styles.login} ${styles.logout}`}
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`${styles.login} ${pathname === "/login" ? styles.active : ""}`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={`${styles.login} ${pathname === "/signup" ? styles.active : ""}`}
              >
                Signup
              </Link>
            </>
          )}
        </div>
        </div>
      </nav>
    </header>
  );
}
