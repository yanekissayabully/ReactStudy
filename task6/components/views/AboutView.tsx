import Link from "next/link";
import styles from "@/styles/AboutView.module.css";

const ROUTES = [
  { path: "/", file: "app/page.tsx", what: "Home" },
  { path: "/about", file: "app/about/page.tsx", what: "This page" },
  { path: "/items", file: "app/items/page.tsx", what: "List with search, filters, sort, paging" },
  { path: "/items/:id", file: "app/items/[id]/page.tsx", what: "Item details (dynamic segment)" },
  { path: "/items/new", file: "app/items/new/page.tsx", what: "Create an item" },
  { path: "/items/:id/edit", file: "app/items/[id]/edit/page.tsx", what: "Edit an item" },
  { path: "/dashboard", file: "app/dashboard/page.tsx", what: "Statistics" },
  { path: "/login", file: "app/login/page.tsx", what: "Login placeholder" },
  { path: "*", file: "app/not-found.tsx", what: "404 page" },
];

export default function AboutView() {
  return (
    <>
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">About this project</h1>
          <p className="pageLead">
            Lab Inventory started as a small async-React exercise. This version
            adds real routing on top of Next.js.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        <section className={`${styles.card} panel`}>
          <h2>What it does</h2>
          <ul>
            <li>Tracks lab equipment: category, serial number, location, value.</li>
            <li>Check an item out to someone, return it, or send it to maintenance.</li>
            <li>Create, edit and remove items.</li>
            <li>
              Talks to an asynchronous &ldquo;API&rdquo; with random latency and
              errors — change them with the Network simulator in the footer.
            </li>
          </ul>
        </section>

        <section className={`${styles.card} panel`}>
          <h2>How it is built</h2>
          <ul>
            <li>Next.js App Router, TypeScript, CSS Modules.</li>
            <li>
              <code>layout.tsx</code> plays the role of RootLayout + Outlet.
            </li>
            <li>
              <code>app/items/layout.tsx</code> is a nested layout (breadcrumbs).
            </li>
            <li>
              Filters live in the URL via <code>useSearchParams</code>.
            </li>
            <li>
              Pages are lazy-loaded with <code>React.lazy</code> and{" "}
              <code>Suspense</code>.
            </li>
            <li>
              Stale responses are cancelled with <code>AbortController</code>.
            </li>
          </ul>
        </section>
      </div>

      <section className={`${styles.card} panel`}>
        <h2>Routes</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>URL</th>
                <th>File</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              {ROUTES.map((route) => (
                <tr key={route.path}>
                  <td>
                    <code>{route.path}</code>
                  </td>
                  <td>
                    <code>{route.file}</code>
                  </td>
                  <td>{route.what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className={styles.back}>
        <Link href="/items">See the equipment →</Link>
      </p>
    </>
  );
}
