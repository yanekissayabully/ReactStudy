"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/Breadcrumbs.module.css";

export default function Breadcrumbs() {
  const segments = usePathname().split("/").filter(Boolean).slice(1);

  const crumbs = [{ href: "/items", label: "Equipment" }];
  let href = "/items";
  for (const segment of segments) {
    href += `/${segment}`;
    const label = /^\d+$/.test(segment)
      ? `#${segment}`
      : segment === "new"
        ? "New"
        : "Edit";
    crumbs.push({ href, label });
  }

  return (
    <nav className={styles.crumbs} aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      {crumbs.map((crumb, index) => (
        <span key={crumb.href}>
          <span aria-hidden="true"> / </span>
          {index === crumbs.length - 1 ? (
            <span aria-current="page">{crumb.label}</span>
          ) : (
            <Link href={crumb.href}>{crumb.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
